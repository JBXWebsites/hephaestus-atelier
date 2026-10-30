import { decodeRelic, renderPrint } from "../../../../../lib/server-relics";

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
  return new Response(renderPrint(relic.recipe, relic.id), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="hephaestus-${relic.id.toLowerCase()}.svg"`,
      "Content-Security-Policy":
        "default-src 'none'; style-src 'none'; sandbox",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
