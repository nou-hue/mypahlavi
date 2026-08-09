import { createFileRoute } from "@tanstack/react-router";
import { printifyConfigured } from "@/lib/printify/client";
import { stripeConfigured } from "@/lib/stripe/client";

export const Route = createFileRoute("/api/shop/status")({
  server: {
    handlers: {
      GET: async () => {
        const stripe = stripeConfigured();
        const printify = printifyConfigured();
        return Response.json({
          stripe,
          printify,
          ready: stripe, // payments can run; Printify fulfils after keys
          mode: stripe ? "live_checkout" : "demo",
          message: stripe
            ? printify
              ? "Stripe + Printify connected"
              : "Stripe connected — add Printify keys to auto-fulfil"
            : "Add STRIPE_SECRET_KEY to enable card checkout",
        });
      },
    },
  },
});
