import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { estimateShippingGBP } from "@/data/shop";
import { printifyConfigured } from "@/lib/printify/client";
import { resolveProductForCheckout } from "@/lib/shop/catalog.server";
import {
  insertOrder,
  orderToStripeMetadata,
  updateOrder,
} from "@/lib/shop/orders.server";
import { getStripe, poundsToPence, stripeConfigured } from "@/lib/stripe/client";
import { canonicalOrigin } from "@/lib/security/origin.server";
import { rateLimit } from "@/lib/security/rate-limit.server";
import { randomBytes } from "node:crypto";

const bodySchema = z.object({
  email: z.string().email().max(254),
  fullName: z.string().min(2).max(120),
  line1: z.string().min(2).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  postcode: z.string().min(2).max(16),
  country: z.literal("United Kingdom"),
  phone: z.string().max(32).optional(),
  notes: z.string().max(1000).optional(),
  lines: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(20),
});

/** Unguessable order id (80 bits): the id doubles as a bearer reference on order lookup. */
function orderId() {
  return `MP-${randomBytes(10).toString("hex").toUpperCase()}`;
}

function originFrom(request: Request) {
  return canonicalOrigin(request);
}

export const Route = createFileRoute("/api/shop/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Each call can create an order row and a Stripe session: cap per client.
        const limited = rateLimit(request, "shop-checkout", { limit: 10, windowMs: 10 * 60_000 });
        if (limited) return limited;
        const declared = Number(request.headers.get("content-length") ?? 0);
        if (declared > 64_000) {
          return Response.json({ error: "Payload too large" }, { status: 413 });
        }
        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = bodySchema.safeParse(json);
        if (!parsed.success) {
          return Response.json({ error: "Invalid checkout payload" }, { status: 400 });
        }

        const data = parsed.data;

        if (stripeConfigured() && !printifyConfigured()) {
          return Response.json(
            {
              error:
                "The shop is temporarily unavailable for fulfilment. No payment has been taken.",
            },
            { status: 503 },
          );
        }

        const resolved = [];
        for (const line of data.lines) {
          const product = await resolveProductForCheckout({
            productId: line.productId,
            variantId: line.variantId,
          });
          if (!product) {
            return Response.json(
              { error: `Unknown product ${line.productId}` },
              { status: 400 },
            );
          }
          const variant =
            product.variants.find((v) => v.id === line.variantId) ??
            product.variants.find(
              (v) => String(v.printifyVariantId) === line.variantId,
            );
          if (!variant) {
            return Response.json(
              { error: `Unknown variant ${line.variantId}` },
              { status: 400 },
            );
          }
          if (
            stripeConfigured() &&
            (!product.printifyProductId || !variant.printifyVariantId)
          ) {
            return Response.json(
              {
                error:
                  "This edition is temporarily unavailable for automated fulfilment. No payment has been taken.",
              },
              { status: 503 },
            );
          }

          resolved.push({
            key: `${product.id}__${variant.id}`,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            variantId: variant.id,
            variantLabel: variant.label,
            unitPriceGBP: variant.priceGBP,
            quantity: line.quantity,
            sku: variant.sku,
            gradient: product.gradient,
            imageSrc: product.imageSrc,
            printifyProductId: product.printifyProductId ?? null,
            printifyVariantId: variant.printifyVariantId ?? null,
          });
        }

        const subtotal = resolved.reduce(
          (n, l) => n + l.unitPriceGBP * l.quantity,
          0,
        );
        const shippingCost = estimateShippingGBP(data.country);
        const total = subtotal + shippingCost;
        const id = orderId();

        const shipping = {
          email: data.email,
          fullName: data.fullName,
          line1: data.line1,
          line2: data.line2 ?? "",
          city: data.city,
          postcode: data.postcode,
          country: data.country,
          phone: data.phone,
          notes: data.notes,
        };

        if (!stripeConfigured()) {
          await insertOrder({
            id,
            email: data.email,
            status: "demo_received",
            subtotalPence: poundsToPence(subtotal),
            shippingPence: poundsToPence(shippingCost),
            totalPence: poundsToPence(total),
            shipping,
            lines: resolved,
            metadata: { mode: "demo" },
          });
          return Response.json({
            mode: "demo",
            orderId: id,
            url: `/order/${id}`,
          });
        }

        const stripe = getStripe();
        const origin = originFrom(request);

        try {
          const row = await insertOrder({
            id,
            email: data.email,
            status: "pending",
            subtotalPence: poundsToPence(subtotal),
            shippingPence: poundsToPence(shippingCost),
            totalPence: poundsToPence(total),
            shipping,
            lines: resolved,
            metadata: { mode: "stripe" },
          });

          const TAX_GENERAL = "txcd_99999999";
          const TAX_SHIPPING = "txcd_92010001";

          const lineItems = resolved.map((l) => ({
            quantity: l.quantity,
            price_data: {
              currency: "gbp" as const,
              unit_amount: poundsToPence(l.unitPriceGBP),
              product_data: {
                name: `${l.name} — ${l.variantLabel}`.slice(0, 120),
                description: `SKU ${l.sku}`,
                images: l.imageSrc?.startsWith("http")
                  ? [l.imageSrc]
                  : l.imageSrc
                    ? [`${origin}${l.imageSrc}`]
                    : undefined,
                tax_code: TAX_GENERAL,
                metadata: {
                  productId: l.productId,
                  variantId: l.variantId,
                  sku: l.sku,
                },
              },
            },
          }));

          if (shippingCost > 0) {
            lineItems.push({
              quantity: 1,
              price_data: {
                currency: "gbp" as const,
                unit_amount: poundsToPence(shippingCost),
                product_data: {
                  name:
                    data.country === "United Kingdom"
                      ? "UK shipping"
                      : "International shipping",
                  description: `Ship to ${data.country}`,
                  images: undefined,
                  tax_code: TAX_SHIPPING,
                  metadata: {
                    productId: "shipping",
                    variantId: "flat",
                    sku: "SHIP",
                  },
                },
              },
            });
          }

          const sessionParams: Parameters<
            typeof stripe.checkout.sessions.create
          >[0] = {
            mode: "payment",
            customer_email: data.email,
            client_reference_id: id,
            success_url: `${origin}/order/${id}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/checkout?cancelled=1`,
            metadata: orderToStripeMetadata(row),
            line_items: lineItems,
          };
          // Disable Stripe Managed Payments (default on some accounts) so classic
          // Checkout works for POD without strict tax-code product catalog rules.
          (sessionParams as Record<string, unknown>).managed_payments = {
            enabled: false,
          };

          const session = await stripe.checkout.sessions.create(sessionParams);

          await updateOrder(id, {
            stripe_session_id: session.id,
          });

          return Response.json({
            mode: "stripe",
            orderId: id,
            sessionId: session.id,
            url: session.url,
          });
        } catch (err) {
          console.error("[checkout]", err);
          return Response.json(
            { error: "Checkout could not be started. No payment has been taken." },
            { status: 500 },
          );
        }
      },
    },
  },
});
