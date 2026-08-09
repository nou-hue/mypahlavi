import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { estimateShippingGBP } from "@/data/shop";
import { resolveProductForCheckout } from "@/lib/shop/catalog.server";
import {
  insertOrder,
  orderToStripeMetadata,
  updateOrder,
} from "@/lib/shop/orders.server";
import { getStripe, poundsToPence, stripeConfigured } from "@/lib/stripe/client";

const bodySchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  line1: z.string().min(2),
  line2: z.string().optional(),
  city: z.string().min(1),
  postcode: z.string().min(2),
  country: z.string().min(2),
  phone: z.string().optional(),
  notes: z.string().optional(),
  lines: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1),
});

function orderId() {
  return `MP-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

function originFrom(request: Request) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return "http://127.0.0.1:8080";
}

export const Route = createFileRoute("/api/shop/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = bodySchema.safeParse(json);
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid checkout payload", details: parsed.error.flatten() },
            { status: 400 },
          );
        }

        const data = parsed.data;
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
            {
              error: err instanceof Error ? err.message : "Checkout failed",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
