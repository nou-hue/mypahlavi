import { createFileRoute } from "@tanstack/react-router";
import {
  getOrderById,
  getOrderByStripeSession,
  parseOrder,
  updateOrder,
} from "@/lib/shop/orders.server";
import { fulfillOrderWithPrintify } from "@/lib/shop/fulfill.server";
import { getStripe, stripeConfigured } from "@/lib/stripe/client";

export const Route = createFileRoute("/api/shop/order/$orderId")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get("session_id");
        let row = await getOrderById(params.orderId);

        // After Stripe redirect: confirm session if webhook is delayed
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

        return Response.json(parseOrder(row));
      },
    },
  },
});
