import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getCircleTier } from "@/data/circle";
import {
  getActiveMembershipForUser,
  getMembershipBySession,
  updateMembership,
} from "@/lib/circle/memberships.server";
import { getSessionUser } from "@/lib/auth/verify.server";
import {
  getStripe,
  stripeConfigured,
} from "@/lib/stripe/client";

function periodEndIso(sub: { current_period_end?: number } | null | undefined) {
  const end = sub?.current_period_end;
  return typeof end === "number" ? new Date(end * 1000).toISOString() : null;
}

const searchSchema = z.object({
  session_id: z.string().optional(),
  bearerToken: z.string().optional(),
});

export const Route = createFileRoute("/api/circle/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get("session_id") ?? undefined;
        const bearer =
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
          undefined;

        const user = await getSessionUser(bearer);
        const stripeOn = stripeConfigured();

        // After Checkout return: verify session with Stripe (don't trust query alone)
        if (sessionId && stripeOn) {
          try {
            const stripe = getStripe();
            const session = await stripe.checkout.sessions.retrieve(sessionId, {
              expand: ["subscription"],
            });
            if (
              session.metadata?.kind === "circle_membership" &&
              session.payment_status === "paid"
            ) {
              const membershipId = session.metadata.membershipId;
              const sub =
                typeof session.subscription === "object" && session.subscription
                  ? session.subscription
                  : null;
              if (membershipId) {
                await updateMembership(membershipId, {
                  status: "active",
                  stripe_session_id: session.id,
                  stripe_customer_id:
                    typeof session.customer === "string"
                      ? session.customer
                      : session.customer?.id ?? null,
                  stripe_subscription_id: sub?.id ?? null,
                  current_period_end: periodEndIso(sub as { current_period_end?: number } | null),
                });
              }
            }
            const m = await getMembershipBySession(sessionId);
            if (m) {
              const tier = getCircleTier(m.tier_id);
              return Response.json({
                stripeConfigured: true,
                membership: {
                  id: m.id,
                  tierId: m.tier_id,
                  tierName: tier?.name ?? m.tier_id,
                  status: m.status,
                  amountPence: m.amount_pence,
                },
              });
            }
          } catch (err) {
            console.error("[circle status] session", err);
          }
        }

        if (!user) {
          return Response.json({
            stripeConfigured: stripeOn,
            membership: null,
            signedIn: false,
          });
        }

        const active = await getActiveMembershipForUser(user.id);
        const tier = active ? getCircleTier(active.tier_id) : null;
        return Response.json({
          stripeConfigured: stripeOn,
          signedIn: true,
          membership: active
            ? {
                id: active.id,
                tierId: active.tier_id,
                tierName: tier?.name ?? active.tier_id,
                status: active.status,
                amountPence: active.amount_pence,
              }
            : null,
        });
      },
    },
  },
});

void searchSchema;
