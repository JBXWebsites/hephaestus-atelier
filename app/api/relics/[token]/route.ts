import { decodeRelic } from "../../../../lib/server-relics";

export const runtime = "nodejs";
export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await context.params;
  const relic = decodeRelic(token);
  if (!relic)
    return Response.json(
      {
        error:
          "This relic link is incomplete or invalid. You can forge another.",
      },
      {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  return Response.json(relic, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
