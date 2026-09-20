import { createFileRoute } from "@tanstack/react-router";
import { buildGoogleFeed } from "@/lib/marketing/product-feeds.server";

export const Route = createFileRoute("/api/marketing/google")({
  server: {
    handlers: {
      GET: async () => {
        const feed = await buildGoogleFeed();
        if (!feed) {
          return Response.json(
            { ok: false, message: "Live commerce catalogue is unavailable." },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }
        return new Response(feed, {
          status: 200,
          headers: {
            "Content-Type": "text/tab-separated-values; charset=utf-8",
            "Cache-Control": "public, max-age=900, s-maxage=900",
            "Content-Disposition": 'inline; filename="mypahlavi-google.tsv"',
          },
        });
      },
    },
  },
});
