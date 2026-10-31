import { createFileRoute } from "@tanstack/react-router";
import {
  getOrderById,
  getOrderByStripeSession,
  orderFromStripeMetadata,
  parseOrder,
  updateOrder,
} from "@/lib/shop/orders.server";
import { fulfillOrderWithPrintify } from "@/lib/shop/fulfill.server";
import { getStripe, stripeConfigured } from "@/lib/stripe/client";
import { rateLimit } from "@/lib/security/rate-limit.server";

export const Route = createFileRoute("/api/shop/order/$orderId")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        // Order lookups return personal data: throttle enumeration attempts.
        const limited = rateLimit(request, "shop-order", { limit: 60, windowMs: 10 * 60_000 });
        if (limited) return limited;
        if (!/^[A-Za-z0-9_-]{6,64}$/.test(params.orderId)) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        const url = new URL(request.url);
        const sessionId = url.searchParams.get("session_id");
        let row = await getOrderById(params.orderId);

        // Reconstruct from Stripe metadata (serverless without durable DB)
        if (!row && sessionId && stripeConfigured()) {
          try {
            const stripe = getStripe();
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            row = orderFromStripeMetadata(
              session.metadata as Record<string, string> | null,
            );
            if (row) {
              await updateOrder(row.id, {
                stripe_session_id: session.id,
              });
              row = await getOrderById(params.orderId);
            }
          } catch (err) {
            console.error("[order recover]", err);
          }
        }

        if (
          sessionId &&
          stripeConfigured() &&
          row &&
          row.status === "pending"
        ) {
          try {
            const stripe = getStripe();
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            if (session.payment_status === "paid") {
              await updateOrder(row.id, {
                status: "paid",
                stripe_session_id: session.id,
                stripe_payment_intent:
                  typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : null,
              });
              await fulfillOrderWithPrintify(row.id);
              row = await getOrderById(params.orderId);
            }
          } catch (err) {
            console.error("[order confirm]", err);
          }
        }

        if (!row && sessionId) {
          row = await getOrderByStripeSession(sessionId);
        }

        if (!row) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }

        // Authorisation: an order that went through Stripe is only returned to
        // the holder of its checkout session id (carried in the success URL).
        // Demo orders (no Stripe) rely on the unguessable order id alone.
        if (row.stripe_session_id && sessionId !== row.stripe_session_id) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }

        return Response.json(parseOrder(row), {
          headers: { "Cache-Control": "private, no-store" },
        });
      },
    },
  },
});
