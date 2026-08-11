import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  getCircleTier,
  stripePriceEnvKey,
} from "@/data/circle";
import {
  insertMembership,
  updateMembership,
} from "@/lib/circle/memberships.server";
import { getStripe, stripeConfigured } from "@/lib/stripe/client";
import {
  getSessionUser,
  UnauthorizedError,
} from "@/lib/auth/verify.server";

const bodySchema = z.object({
  tierId: z.enum(["reader", "patron", "benefactor"]),
  /** Live-preview bearer session token when cookies are partitioned */
  bearerToken: z.string().optional(),
});

function originFrom(request: Request) {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return "http://127.0.0.1:8080";
}

export const Route = createFileRoute("/api/circle/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!stripeConfigured()) {
          return Response.json(
            {
              error: "Stripe is not configured",
              message:
                "Set STRIPE_SECRET_KEY to enable Circle patronage checkout.",
              stripeConfigured: false,
            },
            { status: 503 },
          );
        }

        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = bodySchema.safeParse(json);
        if (!parsed.success) {
          return Response.json({ error: "Invalid tier" }, { status: 400 });
        }

        const user = await getSessionUser(parsed.data.bearerToken);
        if (!user) {
          return Response.json(
            { error: "Sign in required", code: "auth_required" },
            { status: 401 },
          );
        }

        const tier = getCircleTier(parsed.data.tierId);
        if (!tier) {
          return Response.json({ error: "Unknown tier" }, { status: 400 });
        }

        const email = user.email;
        if (!email) {
          return Response.json(
            { error: "Account email required for patronage" },
            { status: 400 },
          );
        }

        const membership = await insertMembership({
          userId: user.id,
          email,
          tierId: tier.id,
          amountPence: tier.amountPence,
        });

        const origin = originFrom(request);
        const stripe = getStripe();
        const priceEnv = process.env[stripePriceEnvKey(tier.id)]?.trim();

        const lineItem = priceEnv
          ? { price: priceEnv, quantity: 1 }
          : {
              price_data: {
                currency: "gbp" as const,
                unit_amount: tier.amountPence,
                recurring: { interval: "month" as const },
                product_data: {
                  name: `Pahlavi Circle · ${tier.name}`,
                  description: tier.description,
                  metadata: { tier_id: tier.id },
                  tax_code: "txcd_10000000",
                },
              },
              quantity: 1,
            };

        try {
          const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer_email: email,
            client_reference_id: membership.id,
            line_items: [lineItem],
            success_url: `${origin}/patronage?joined=1&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/patronage?cancelled=1`,
            metadata: {
              kind: "circle_membership",
              membershipId: membership.id,
              tierId: tier.id,
              userId: user.id,
            },
            subscription_data: {
              metadata: {
                membershipId: membership.id,
                tierId: tier.id,
                userId: user.id,
              },
            },
            // Managed Payments accounts require tax codes; disable for patronage checkout
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...( { managed_payments: { enabled: false } } as any ),
          });

          await updateMembership(membership.id, {
            stripe_session_id: session.id,
          });

          if (!session.url) {
            return Response.json(
              { error: "Stripe did not return a checkout URL" },
              { status: 502 },
            );
          }

          return Response.json({
            url: session.url,
            sessionId: session.id,
            membershipId: membership.id,
            tier: tier.id,
            stripeConfigured: true,
          });
        } catch (err) {
          console.error("[circle checkout]", err);
          return Response.json(
            {
              error:
                err instanceof Error
                  ? err.message
                  : "Could not start Circle checkout",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});

void UnauthorizedError;
