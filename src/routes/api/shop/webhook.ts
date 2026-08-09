import { createFileRoute } from "@tanstack/react-router";
import {
  getOrderById,
  getOrderByStripeSession,
  orderFromStripeMetadata,
  updateOrder,
} from "@/lib/shop/orders.server";
import { fulfillOrderWithPrintify } from "@/lib/shop/fulfill.server";
import { getStripe, getWebhookSecret, stripeConfigured } from "@/lib/stripe/client";

export const Route = createFileRoute("/api/shop/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!stripeConfigured()) {
          return Response.json({ error: "Stripe not configured" }, { status: 503 });
        }

        const stripe = getStripe();
        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          return Response.json({ error: "Missing signature" }, { status: 400 });
        }

        const raw = await request.text();
        let event;
        try {
          event = stripe.webhooks.constructEvent(
            raw,
            signature,
            getWebhookSecret(),
          );
        } catch (err) {
          console.error("[stripe webhook] signature", err);
          return Response.json({ error: "Invalid signature" }, { status: 400 });
        }

        try {
          if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const orderId =
              session.metadata?.orderId ||
              session.client_reference_id ||
              undefined;

            let order = orderId ? await getOrderById(orderId) : null;
            if (!order && session.id) {
              order = await getOrderByStripeSession(session.id);
            }
            if (!order && session.metadata) {
              order = orderFromStripeMetadata(
                session.metadata as Record<string, string>,
              );
            }
            if (!order) {
              console.error("[stripe webhook] order not found", orderId, session.id);
              return Response.json({ received: true, warning: "order_missing" });
            }

            await updateOrder(order.id, {
              status: "paid",
              stripe_session_id: session.id,
              stripe_payment_intent:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id ?? null,
              error_message: null,
            });

            await fulfillOrderWithPrintify(order.id);
          }
        } catch (err) {
          console.error("[stripe webhook] handler", err);
          return Response.json({ error: "Handler failed" }, { status: 500 });
        }

        return Response.json({ received: true });
      },
    },
  },
});
