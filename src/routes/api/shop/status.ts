import { createFileRoute } from "@tanstack/react-router";
import {
  listPrintifyShops,
  printifyConfigured,
} from "@/lib/printify/client";
import { stripeConfigured } from "@/lib/stripe/client";

export const Route = createFileRoute("/api/shop/status")({
  server: {
    handlers: {
      GET: async () => {
        const stripe = stripeConfigured();
        const hasToken = Boolean(process.env.PRINTIFY_API_TOKEN?.trim());
        const hasShopId = Boolean(process.env.PRINTIFY_SHOP_ID?.trim());
        const printifyEnv = printifyConfigured();

        let printify = false;
        let shopTitle: string | null = null;
        let shops: Array<{ id: number; title: string }> = [];
        let printifyError: string | null = null;

        if (hasToken) {
          try {
            const list = await listPrintifyShops();
            shops = list.map((s) => ({ id: s.id, title: s.title }));
            if (hasShopId) {
              const id = process.env.PRINTIFY_SHOP_ID!.trim();
              const match = list.find((s) => String(s.id) === id);
              if (match) {
                printify = true;
                shopTitle = match.title;
              } else {
                printifyError = `PRINTIFY_SHOP_ID “${id}” not found. Your shops: ${list
                  .map((s) => `${s.id} (${s.title})`)
                  .join(", ") || "none"}`;
              }
            } else {
              printifyError =
                "PRINTIFY_API_TOKEN is set, but PRINTIFY_SHOP_ID is missing. " +
                (list.length
                  ? `Use one of: ${list.map((s) => s.id).join(", ")}`
                  : "No shops on this Printify account.");
            }
          } catch (err) {
            printifyError =
              err instanceof Error
                ? err.message
                : "Could not reach Printify — check the API token";
          }
        } else if (hasShopId) {
          printifyError =
            "PRINTIFY_SHOP_ID is set, but PRINTIFY_API_TOKEN is missing";
        }

        const message = stripe
          ? printify
            ? `Stripe + Printify connected${shopTitle ? ` (“${shopTitle}”)` : ""}`
            : printifyError ??
              "Stripe connected — add PRINTIFY_API_TOKEN and PRINTIFY_SHOP_ID, then redeploy"
          : printify
            ? "Printify connected — add STRIPE_SECRET_KEY for card checkout"
            : printifyError ??
              "Add Stripe + Printify keys on Vercel (Project → Settings → Environment Variables), then Redeploy";

        return Response.json({
          stripe,
          printify,
          printifyEnv,
          hasToken,
          hasShopId,
          shopId: process.env.PRINTIFY_SHOP_ID?.trim() ?? null,
          shopTitle,
          shops,
          printifyError,
          ready: stripe,
          mode: stripe ? "live_checkout" : "demo",
          message,
          help: {
            where:
              "Vercel → Project “mypahlavi” → Settings → Environment Variables → Production",
            vars: [
              "PRINTIFY_API_TOKEN",
              "PRINTIFY_SHOP_ID",
              "STRIPE_SECRET_KEY",
              "STRIPE_WEBHOOK_SECRET",
              "VITE_STRIPE_PUBLISHABLE_KEY",
              "DATABASE_URL",
            ],
            after: "Save variables → Deployments → … on latest → Redeploy",
            test: "https://www.mypahlavi.com/api/shop/status",
          },
        });
      },
    },
  },
});
