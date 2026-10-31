import { createFileRoute } from "@tanstack/react-router";
import {
  getOrderById,
  getOrderByStripeSession,
  orderFromStripeMetadata,
  updateOrder,
} from "@/lib/shop/orders.server";
import { fulfillOrderWithPrintify } from "@/lib/shop/fulfill.server";
import {
  getMembershipById,
  getMembershipBySubscription,
  updateMembership,
} from "@/lib/circle/memberships.server";
import { getStripe, getWebhookSecret, stripeConfigured } from "@/lib/stripe/client";

function periodEndIso(sub: { current_period_end?: number } | null | undefined) {
  const end = sub?.current_period_end;
  return typeof end === "number" ? new Date(end * 1000).toISOString() : null;
}

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
          if (
            event.type === "checkout.session.completed" ||
            event.type === "checkout.session.async_payment_succeeded"
          ) {
            const session = event.data.object;

            // Circle patronage subscription
            if (session.metadata?.kind === "circle_membership") {
              const membershipId = session.metadata.membershipId;
              if (membershipId) {
                const subId =
                  typeof session.subscription === "string"
                    ? session.subscription
                    : session.subscription?.id ?? null;
                let periodEnd: string | null = null;
                if (subId) {
                  try {
                    const sub = await stripe.subscriptions.retrieve(subId);
                    periodEnd = periodEndIso(sub as { current_period_end?: number });
                  } catch {
                    /* ignore */
                  }
                }
                await updateMembership(membershipId, {
                  status:
                    session.payment_status === "paid" ||
                    session.status === "complete"
                      ? "active"
                      : "incomplete",
                  stripe_session_id: session.id,
                  stripe_customer_id:
                    typeof session.customer === "string"
                      ? session.customer
                      : session.customer?.id ?? null,
                  stripe_subscription_id: subId,
                  current_period_end: periodEnd,
                });
              }
              return Response.json({ received: true, kind: "circle" });
            }

            // Shop order fulfilment
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
              console.error(
                "[stripe webhook] order not found",
                orderId,
                session.id,
              );
              return Response.json({ received: true, warning: "order_missing" });
            }

            // Only act on money actually received (async methods complete unpaid).
            if (
              session.payment_status !== "paid" &&
              session.payment_status !== "no_payment_required"
            ) {
              return Response.json({ received: true, warning: "not_paid" });
            }

            // The order must belong to this session.
            if (order.stripe_session_id && order.stripe_session_id !== session.id) {
              console.error(
                "[stripe webhook] session/order mismatch",
                order.id,
                session.id,
              );
              return Response.json({ received: true, warning: "session_mismatch" });
            }

            // Idempotent on Stripe retries / duplicate events: never regress
            // status or re-submit an order that is already with Printify.
            if (
              order.printify_order_id ||
              order.status === "printify_submitted" ||
              order.status === "fulfilled"
            ) {
              return Response.json({ received: true, duplicate: true });
            }

            // Strict: if the DB write fails, return 500 so Stripe retries.
            await updateOrder(
              order.id,
              {
                status: "paid",
                stripe_session_id: session.id,
                stripe_payment_intent:
                  typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : session.payment_intent?.id ?? null,
                error_message: null,
              },
              { strict: true },
            );

            // Amount paid must equal what we recorded; otherwise hold for review.
            if (
              typeof session.amount_total === "number" &&
              session.amount_total !== order.total_pence
            ) {
              const msg = `Amount mismatch: Stripe ${session.amount_total}p vs order ${order.total_pence}p — held for manual review`;
              console.error("[stripe webhook]", order.id, msg);
              await updateOrder(order.id, { error_message: msg });
              return Response.json({ received: true, warning: "amount_mismatch" });
            }

            await fulfillOrderWithPrintify(order.id);
          }

          if (
            event.type === "customer.subscription.updated" ||
            event.type === "customer.subscription.deleted"
          ) {
            const sub = event.data.object;
            const membershipId = sub.metadata?.membershipId;
            let membership = membershipId
              ? await getMembershipById(membershipId)
              : null;
            if (!membership && sub.id) {
              membership = await getMembershipBySubscription(sub.id);
            }
            if (membership) {
              const statusMap: Record<string, string> = {
                active: "active",
                past_due: "past_due",
                canceled: "canceled",
                unpaid: "past_due",
                incomplete: "incomplete",
                incomplete_expired: "canceled",
                trialing: "active",
              };
              const status =
                event.type === "customer.subscription.deleted"
                  ? "canceled"
                  : statusMap[sub.status] ?? sub.status;
              await updateMembership(membership.id, {
                status,
                stripe_subscription_id: sub.id,
                current_period_end: periodEndIso(sub as { current_period_end?: number }),
              });
            }
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
