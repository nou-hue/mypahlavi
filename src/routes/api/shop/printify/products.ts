import { createFileRoute } from "@tanstack/react-router";
import {
  listPrintifyProducts,
  listPrintifyShops,
  printifyConfigured,
} from "@/lib/printify/client";

export const Route = createFileRoute("/api/shop/printify/products")({
  server: {
    handlers: {
      GET: async () => {
        if (!printifyConfigured()) {
          return Response.json(
            {
              connected: false,
              products: [],
              message:
                "Set PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID to load live products",
            },
            { status: 200 },
          );
        }

        try {
          const shops = await listPrintifyShops();
          const catalog = await listPrintifyProducts(1, 50);
          return Response.json({
            connected: true,
            shopId: process.env.PRINTIFY_SHOP_ID,
            shops,
            products: catalog.data.map((p) => ({
              id: p.id,
              title: p.title,
              image: p.images.find((i) => i.is_default)?.src ?? p.images[0]?.src,
              variants: p.variants
                .filter((v) => v.is_enabled)
                .map((v) => ({
                  id: v.id,
                  sku: v.sku,
                  title: v.title,
                  priceCents: v.price,
                })),
            })),
          });
        } catch (err) {
          return Response.json(
            {
              connected: false,
              error: err instanceof Error ? err.message : "Printify error",
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
