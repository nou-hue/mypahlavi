import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { LayoutShell } from "@/components/archive/layout-shell";
import { formatGBP } from "@/data/shop";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  session_id: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/order/$orderId")({
  component: OrderPage,
  validateSearch: searchSchema,
});

type ApiOrder = {
  id: string;
  createdAt: string;
  email: string;
  status: string;
  printifyOrderId?: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  shipping: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  lines: Array<{
    key: string;
    name: string;
    variantLabel: string;
    quantity: number;
    unitPriceGBP: number;
    gradient?: string;
    imageSrc?: string;
  }>;
  error?: string | null;
};

function OrderPage() {
  const { orderId } = Route.useParams();
  const search = Route.useSearch();
  const clear = useCartStore((s) => s.clear);
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const q = search.session_id
          ? `?session_id=${encodeURIComponent(search.session_id)}`
          : "";
        const res = await fetch(`/api/shop/order/${orderId}${q}`);
        if (res.ok) {
          const data = (await res.json()) as ApiOrder;
          if (!cancelled) {
            setOrder(data);
            if (
              data.status === "paid" ||
              data.status === "printify_submitted" ||
              data.status === "demo_received"
            ) {
              clear();
            }
          }
          return;
        }
      } catch {
        /* fall through */
      }
      try {
        const raw = sessionStorage.getItem(`mypahlavi-order-${orderId}`);
        if (raw && !cancelled) setOrder(JSON.parse(raw) as ApiOrder);
      } catch {
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orderId, search.session_id, clear]);

  if (loading) {
    return (
      <LayoutShell>
        <div className="mx-auto max-w-lg px-5 py-24 text-center">
          <p className="font-serif text-2xl text-ink-muted">Confirming order…</p>
        </div>
      </LayoutShell>
    );
  }

  if (!order) {
    return (
      <LayoutShell>
        <div className="mx-auto max-w-lg px-5 py-24 text-center">
          <h1 className="font-serif text-3xl">Order not found</h1>
          <p className="mt-3 text-sm text-ink-muted">
            This confirmation may have expired or the payment is still processing.
          </p>
          <Link
            to="/editions"
            className="mt-8 inline-flex h-11 items-center border border-border px-6 font-sans text-[0.7rem] uppercase tracking-[0.16em] hover:bg-ink hover:text-cream"
          >
            Return to shop
          </Link>
        </div>
      </LayoutShell>
    );
  }

  const statusLabel: Record<string, string> = {
    pending: "Awaiting payment",
    paid: "Paid — preparing production",
    printify_submitted: "In production",
    demo_received: "Order recorded",
    fulfilled: "Fulfilled",
    failed: "Needs attention",
  };

  return (
    <LayoutShell>
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 archive-rise">
        <p className="font-sans text-[0.65rem] uppercase tracking-[0.22em] text-accent">
          {statusLabel[order.status] ?? order.status}
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight">Thank you</h1>
        <p className="mt-3 text-base text-ink-muted">
          Confirmation for <span className="text-ink">{order.email}</span>. Reference{" "}
          <span className="font-medium text-ink">{order.id}</span>.
        </p>
        {order.printifyOrderId && (
          <p className="mt-2 text-sm text-ink-subtle">
            Production id {order.printifyOrderId}
          </p>
        )}
        {order.error && (
          <p className="mt-3 text-sm text-ink-muted">{order.error}</p>
        )}

        <div className="mt-10 border border-border bg-ground-elevated p-6">
          <h2 className="font-serif text-2xl">Items</h2>
          <ul className="mt-5 space-y-4">
            {order.lines.map((line) => (
              <li
                key={line.key}
                className="flex gap-3 border-b border-border pb-4 last:border-0"
              >
                {line.imageSrc ? (
                  <img
                    src={line.imageSrc}
                    alt=""
                    className="h-16 w-14 object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      "h-16 w-14 shrink-0 bg-gradient-to-br",
                      line.gradient ?? "from-[#2a241e] to-[#14110e]",
                    )}
                  />
                )}
                <div className="flex-1">
                  <p className="font-serif text-lg leading-snug">{line.name}</p>
                  <p className="text-xs text-ink-subtle">
                    {line.variantLabel} × {line.quantity}
                  </p>
                </div>
                <p className="text-sm tabular-nums">
                  {formatGBP(line.unitPriceGBP * line.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between text-ink-muted">
              <span>Subtotal</span>
              <span>{formatGBP(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Shipping</span>
              <span>{formatGBP(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-serif text-xl">
              <span>Total</span>
              <span>{formatGBP(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border border-border p-6">
          <h2 className="font-serif text-xl">Ship to</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            {order.shipping.fullName}
            <br />
            {order.shipping.line1}
            {order.shipping.line2 ? (
              <>
                <br />
                {order.shipping.line2}
              </>
            ) : null}
            <br />
            {order.shipping.city} {order.shipping.postcode}
            <br />
            {order.shipping.country}
          </p>
        </div>

        <Link
          to="/editions"
          className="mt-10 inline-flex h-11 items-center bg-ink px-6 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-cream hover:opacity-90"
        >
          Continue browsing
        </Link>
      </div>
    </LayoutShell>
  );
}
