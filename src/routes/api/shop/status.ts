import { createFileRoute } from "@tanstack/react-router";
import {
  listPrintifyShops,
  printifyConfigured,
  resolvePrintifyShopId,
} from "@/lib/printify/client";
import { databaseStatus } from "@/lib/shop/orders.server";
import { stripeConfigured } from "@/lib/stripe/client";

export const Route = createFileRoute("/api/shop/status")({
  server: {
    handlers: {
      GET: async () => {
        const stripe = stripeConfigured();
        const hasToken = Boolean(process.env.PRINTIFY_API_TOKEN?.trim());
        const hasShopIdEnv = Boolean(process.env.PRINTIFY_SHOP_ID?.trim());
        const db = await databaseStatus();

        let printify = false;
        let shopId: string | null = process.env.PRINTIFY_SHOP_ID?.trim() ?? null;
        let shopTitle: string | null = null;
        let shops: Array<{ id: number; title: string }> = [];
        let printifyError: string | null = null;
        let autoSelected = false;

        if (hasToken) {
          try {
            const list = await listPrintifyShops();
            shops = list.map((s) => ({ id: s.id, title: s.title }));
            const resolved = await resolvePrintifyShopId();
            shopId = resolved;
            const match = list.find((s) => String(s.id) === resolved);
            if (match) {
              printify = true;
              shopTitle = match.title;
              autoSelected = !hasShopIdEnv;
            }
          } catch (err) {
            printifyError =
              err instanceof Error
                ? err.message
                : "Could not reach Printify — check the API token";
          }
        } else if (hasShopIdEnv) {
          printifyError =
            "PRINTIFY_SHOP_ID is set, but PRINTIFY_API_TOKEN is missing";
        }

        const message = stripe
          ? printify
            ? `Stripe + Printify connected (“${shopTitle ?? shopId}”)`
            : printifyError ??
              "Stripe connected — add PRINTIFY_API_TOKEN on Vercel, then redeploy"
          : printify
            ? "Printify connected — add STRIPE_SECRET_KEY for card checkout"
            : printifyError ?? "Add Stripe + Printify keys on Vercel, then Redeploy";

        return Response.json({
          stripe,
          printify,
          printifyConfigured: printifyConfigured(),
          hasToken,
          hasShopId: Boolean(shopId),
          hasShopIdEnv,
          shopId,
          shopTitle,
          shops,
          autoSelected,
          printifyError,
          database: db,
          ready: stripe,
          mode: stripe ? "live_checkout" : "demo",
          message,
        });
      },
    },
  },
});
