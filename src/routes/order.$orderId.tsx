import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutShell } from "@/components/archive/layout-shell";
import { formatGBP } from "@/data/shop";
import type { CartLine } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/order/$orderId")({
  component: OrderPage,
});

type StoredOrder = {
  id: string;
  createdAt: string;
  email: string;
  shipping: {
    fullName: string;
    line1: string;
    line2: string;
    city: string;
    postcode: string;
    country: string;
  };
  lines: CartLine[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
};

function OrderPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<StoredOrder | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`mypahlavi-order-${orderId}`);
      if (raw) setOrder(JSON.parse(raw) as StoredOrder);
    } catch {
      setOrder(null);
    }
  }, [orderId]);

  if (!order) {
    return (
      <LayoutShell>
        <div className="mx-auto max-w-lg px-5 py-24 text-center">
          <h1 className="font-serif text-3xl">Order not found</h1>
          <p className="mt-3 text-sm text-ink-muted">
            This confirmation may have expired in this browser session.
          </p>
          <Link
            to="/editions"
            className="mt-8 inline-flex h-11 items-center border border-ink/20 px-6 font-sans text-[0.72rem] uppercase tracking-[0.16em] hover:bg-ink hover:text-cream"
          >
            Return to shop
          </Link>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8 archive-rise">
        <p className="font-sans text-[0.7rem] uppercase tracking-[0.22em] text-accent">
          Order received
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight">Thank you</h1>
        <p className="mt-3 text-base text-ink-muted">
          Confirmation for <span className="text-ink">{order.email}</span>. Reference{" "}
          <span className="font-medium text-ink">{order.id}</span>.
        </p>

        <div className="mt-10 border border-border bg-ground-elevated p-6">
          <h2 className="font-serif text-2xl">Items</h2>
          <ul className="mt-5 space-y-4">
            {order.lines.map((line) => (
              <li key={line.key} className="flex gap-3 border-b border-border pb-4 last:border-0">
                <div
                  className={cn("h-16 w-14 shrink-0 bg-gradient-to-br", line.gradient)}
                />
                <div className="flex-1">
                  <p className="font-serif text-lg">{line.name}</p>
                  <p className="text-xs text-ink-subtle">
                    {line.variantLabel} × {line.quantity} · {line.sku}
                  </p>
                </div>
                <p className="text-sm tabular-nums">
                  {formatGBP(line.unitPriceGBP * line.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-ink-muted">
              <span>Subtotal</span>
              <span>{formatGBP(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Shipping</span>
              <span>{formatGBP(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between pt-2 font-serif text-xl">
              <span>Total</span>
              <span>{formatGBP(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 border border-border p-6 text-sm leading-relaxed text-ink-muted">
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle">
            Ship to
          </p>
          <p className="mt-2 text-ink">
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
            {order.shipping.city}, {order.shipping.postcode}
            <br />
            {order.shipping.country}
          </p>
          <p className="mt-4">
            Production status: awaiting Printify API connection. Once keys are
            linked, this order payload maps directly to a Printify submit.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/editions"
            className="inline-flex h-11 items-center bg-ink px-6 font-sans text-[0.72rem] uppercase tracking-[0.16em] text-cream hover:bg-deep"
          >
            Continue shopping
          </Link>
          <Link
            to="/"
            className="inline-flex h-11 items-center border border-border px-6 font-sans text-[0.72rem] uppercase tracking-[0.16em] hover:border-ink/40"
          >
            Back to archive
          </Link>
        </div>
      </div>
    </LayoutShell>
  );
}
