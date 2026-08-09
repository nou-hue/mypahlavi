import { createFileRoute } from "@tanstack/react-router";
import { getLiveCatalog } from "@/lib/shop/catalog.server";

export const Route = createFileRoute("/api/shop/catalog")({
  server: {
    handlers: {
      GET: async () => {
        const catalog = await getLiveCatalog();
        return Response.json(catalog);
      },
    },
  },
});
