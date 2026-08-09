import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { LayoutShell } from "@/components/archive/layout-shell";
import { estimateShippingGBP, formatGBP } from "@/data/shop";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  cancelled: z.union([z.literal("1"), z.boolean()]).optional().catch(undefined),
});

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  validateSearch: searchSchema,
});

type FormState = {
  email: string;
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
  notes: string;
};

const emptyForm: FormState = {
  email: "",
  fullName: "",
  line1: "",
  line2: "",
  city: "",
  postcode: "",
  country: "United Kingdom",
  phone: "",
  notes: "",
};

function CheckoutPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal());
  const clear = useCartStore((s) => s.clear);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shopStatus, setShopStatus] = useState<{
    stripe: boolean;
    printify: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/shop/status")
      .then((r) => r.json())
      .then((d) =>
        setShopStatus({
          stripe: Boolean(d.stripe),
          printify: Boolean(d.printify),
          message: d.message ?? "",
        }),
      )
      .catch(() => null);
  }, []);

  const shipping = useMemo(
    () => (lines.length === 0 ? 0 : estimateShippingGBP(form.country)),
    [lines.length, form.country],
  );
  const total = subtotal + shipping;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (lines.length === 0) {
      setError("Your bag is empty.");
      return;
    }
    if (!form.email || !form.fullName || !form.line1 || !form.city || !form.postcode) {
      setError("Please complete the required shipping fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          fullName: form.fullName,
          line1: form.line1,
          line2: form.line2,
          city: form.city,
          postcode: form.postcode,
          country: form.country,
          phone: form.phone,
          notes: form.notes,
          lines: lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            quantity: l.quantity,
          })),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        mode?: string;
        orderId?: string;
        url?: string | null;
      };
      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.mode === "stripe" && data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.orderId) {
        clear();
        await navigate({
          to: "/order/$orderId",
          params: { orderId: data.orderId },
          search: {},
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <LayoutShell>
        <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 py-20 text-center">
          <h1 className="font-serif text-3xl">Nothing to check out</h1>
          <p className="mt-3 text-sm text-ink-muted">Add editions to your bag first.</p>
          <Link
            to="/editions"
            className="mt-8 h-11 border border-border px-6 font-sans text-[0.7rem] uppercase tracking-[0.16em] leading-[2.75rem] hover:bg-ink hover:text-cream"
          >
            Open shop
          </Link>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="mb-10 max-w-xl space-y-3 archive-rise">
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ink-subtle">
            Checkout
          </p>
          <h1 className="font-serif text-4xl tracking-tight">Shipping & payment</h1>
          <p className="text-sm leading-relaxed text-ink-muted">
            {shopStatus?.stripe
              ? "Card payment via Stripe. Production through Printify after payment."
              : "Preview mode — orders are recorded until Stripe keys are connected."}
          </p>
          {(search.cancelled === "1" || search.cancelled === true) && (
            <p className="text-sm text-amber-800" role="status">
              Payment was cancelled. Your bag is still here.
            </p>
          )}
        </header>

        <form
          onSubmit={onSubmit}
          className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]"
        >
          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="font-serif text-2xl">Contact</h2>
              <Field
                label="Email"
                required
                type="email"
                value={form.email}
                onChange={(v) => update("email", v)}
              />
              <Field
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(v) => update("phone", v)}
              />
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl">Shipping</h2>
              <Field
                label="Full name"
                required
                value={form.fullName}
                onChange={(v) => update("fullName", v)}
              />
              <Field
                label="Address line 1"
                required
                value={form.line1}
                onChange={(v) => update("line1", v)}
              />
              <Field
                label="Address line 2"
                value={form.line2}
                onChange={(v) => update("line2", v)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="City"
                  required
                  value={form.city}
                  onChange={(v) => update("city", v)}
                />
                <Field
                  label="Postcode"
                  required
                  value={form.postcode}
                  onChange={(v) => update("postcode", v)}
                />
              </div>
              <label className="block space-y-2">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle">
                  Country
                </span>
                <select
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  className="h-12 w-full border border-border bg-ground px-3 text-sm outline-none focus:border-accent"
                >
                  <option>United Kingdom</option>
                  <option>European Union</option>
                  <option>United States</option>
                  <option>Canada</option>
                  <option>Australia</option>
                  <option>Rest of world</option>
                </select>
              </label>
              <label className="block space-y-2">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle">
                  Notes
                </span>
                <textarea
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={3}
                  className="w-full border border-border bg-ground px-3 py-3 text-sm outline-none focus:border-accent"
                  placeholder="Optional"
                />
              </label>
            </section>
          </div>

          <aside className="h-fit border border-border bg-ground-elevated p-6">
            <h2 className="font-serif text-2xl">Summary</h2>
            <ul className="mt-6 space-y-4">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-3 border-b border-border pb-4">
                  {line.imageSrc ? (
                    <img
                      src={line.imageSrc}
                      alt=""
                      className="h-16 w-14 shrink-0 object-cover"
                    />
                  ) : (
                    <div
                      className={cn("h-16 w-14 shrink-0 bg-gradient-to-br", line.gradient)}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-base leading-snug">{line.name}</p>
                    <p className="text-xs text-ink-subtle">
                      {line.variantLabel} × {line.quantity}
                    </p>
                    <p className="mt-1 text-sm">
                      {formatGBP(line.unitPriceGBP * line.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={formatGBP(subtotal)} />
              <Row label="Shipping" value={formatGBP(shipping)} />
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="font-sans text-[0.65rem] uppercase tracking-[0.14em]">
                  Total
                </span>
                <span className="font-serif text-2xl">{formatGBP(total)}</span>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex h-12 w-full items-center justify-center bg-ink font-sans text-[0.7rem] uppercase tracking-[0.16em] text-cream hover:opacity-90 disabled:opacity-60"
            >
              {submitting
                ? "Redirecting…"
                : shopStatus?.stripe
                  ? "Pay with card"
                  : "Place order"}
            </button>
            <p className="mt-3 text-xs leading-relaxed text-ink-subtle">
              {shopStatus?.message ||
                "Secure checkout. Printify produces each edition after payment."}
            </p>
            <Link
              to="/editions"
              className="mt-4 block text-center font-sans text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle hover:text-ink"
            >
              Back to shop
            </Link>
          </aside>
        </form>
      </div>
    </LayoutShell>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-sans text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full border border-border bg-ground px-3 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-ink-muted">
      <span>{label}</span>
      <span className="tabular-nums text-ink">{value}</span>
    </div>
  );
}
