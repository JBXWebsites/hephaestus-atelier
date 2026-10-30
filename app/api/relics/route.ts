import {
  createRelic,
  InvalidRecipeError,
  MAX_BODY_BYTES,
} from "../../../lib/server-relics";

export const runtime = "nodejs";

function error(message: string, status: number): Response {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

function isSameOrigin(request: Request, origin: string): boolean {
  try {
    // Next can construct request.url from its internal listening address. Host is
    // the browser-facing authority; never accept a caller's forwarded host.
    const url = new URL(request.url);
    const host = request.headers.get("host") ?? url.host;
    if (!/^(?:[a-z0-9.-]+|\[[a-f0-9:.]+\])(?::\d{1,5})?$/i.test(host))
      return false;
    let protocol = url.protocol;
    // Vercel terminates TLS and sets this header. Outside that platform the
    // request URL is authoritative, so client-supplied proxy headers do nothing.
    if (process.env.VERCEL === "1") {
      const forwardedProtocol = request.headers.get("x-forwarded-proto");
      if (forwardedProtocol !== null) {
        if (forwardedProtocol !== "https" && forwardedProtocol !== "http")
          return false;
        protocol = `${forwardedProtocol}:`;
      }
    }
    if (protocol !== "http:" && protocol !== "https:") return false;
    // Origin is an origin, never a URL containing credentials, path or fragment.
    if (
      !/^https?:\/\/(?:[a-z0-9.-]+|\[[a-f0-9:.]+\])(?::\d{1,5})?$/i.test(origin)
    )
      return false;
    const supplied = new URL(origin);
    if (supplied.username || supplied.password) return false;
    return supplied.origin === new URL(`${protocol}//${host}`).origin;
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  if (origin !== null && !isSameOrigin(request, origin))
    return error("Open the atelier on this site before forging a relic.", 400);
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    return error("Send the three choices as JSON.", 415);
  const declaredLength = request.headers.get("content-length");
  if (
    declaredLength !== null &&
    /^\d+$/.test(declaredLength) &&
    Number(declaredLength) > MAX_BODY_BYTES
  )
    return error("The recipe is too large. Send only the three choices.", 413);
  if (!request.body)
    return error("Choose an intention, material and maker’s mark.", 400);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        void reader.cancel().catch(() => undefined);
        return error(
          "The recipe is too large. Send only the three choices.",
          413,
        );
      }
      chunks.push(value);
    }
  } catch {
    return error("The recipe could not be read. Please try again.", 400);
  } finally {
    reader.releaseLock();
  }
  try {
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const input: unknown = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(bytes),
    );
    const result = createRelic(input);
    return Response.json(result, {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        Location: result.url,
      },
    });
  } catch (cause) {
    if (cause instanceof InvalidRecipeError) return error(cause.message, 400);
    if (cause instanceof SyntaxError || cause instanceof TypeError)
      return error(
        "The recipe could not be read. Send valid JSON with three choices.",
        400,
      );
    return error(
      "The forge could not finish this relic. Please try again.",
      500,
    );
  }
}
