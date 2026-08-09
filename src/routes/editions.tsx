import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  formatGBP,
  shopCategories,
  shopProducts,
  startingPrice,
} from "@/data/shop";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/editions")({
  component: ShopPage,
});

function ShopPage() {
  const [cat, setCat] = useState("all");
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartStore((s) => s.count());

  const items = useMemo(() => {
    if (cat === "all") return shopProducts;
    return shopProducts.filter((e) => e.category === cat);
  }, [cat]);

  const featured = shopProducts.filter((p) => p.featured);

  return (
    <LayoutShell>
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="mb-10 flex flex-col gap-6 archive-rise sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="font-sans text-[0.7rem] uppercase tracking-[0.22em] text-ink-subtle">
              Shop · Editions
            </p>
            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
              Objects from the archive
            </h1>
            <p className="text-base leading-relaxed text-ink-muted">
              A full print-on-demand shop: archival prints, apparel, and objects.
              Fulfilled via Printify. Presented as editions — with a real bag and
              checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={openCart}
            className="inline-flex h-12 items-center gap-2 border border-ink/20 px-5 font-sans text-[0.72rem] uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-cream"
          >
            <ShoppingBag className="size-4" />
            Bag{count > 0 ? ` (${count})` : ""}
          </button>
        </header>

        {cat === "all" && (
          <section className="mb-14 grid gap-4 lg:grid-cols-12">
            {featured.slice(0, 2).map((product, i) => (
              <Link
                key={product.id}
                to="/editions/$productId"
                params={{ productId: product.slug }}
                className={cn(
                  "group relative overflow-hidden border border-border",
                  i === 0 ? "lg:col-span-7" : "lg:col-span-5",
                )}
              >
                <div
                  className={cn(
                    "min-h-[280px] bg-gradient-to-br transition-transform duration-700 group-hover:scale-[1.02] sm:min-h-[360px]",
                    product.gradient,
                  )}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-deep/90 via-deep/50 to-transparent p-6 text-cream sm:p-8">
                  <p className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-cream/55">
                    Featured · from {formatGBP(startingPrice(product))}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
                    {product.name}
                  </h2>
                  <p className="mt-2 max-w-md text-sm text-cream/70">
                    {product.shortDescription}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 font-sans text-[0.68rem] uppercase tracking-[0.14em] text-accent-soft">
                    View edition <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </section>
        )}

        <div className="mb-8 flex flex-wrap gap-2">
          {shopCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={cn(
                "h-10 px-4 font-sans text-[0.68rem] uppercase tracking-[0.14em]",
                cat === c.id
                  ? "bg-ink text-cream"
                  : "border border-border text-ink-muted hover:border-ink/30",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <article
              key={item.id}
              className="flex flex-col border border-border bg-ground archive-fade"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <Link
                to="/editions/$productId"
                params={{ productId: item.slug }}
                className="group block"
              >
                <div
                  className={cn(
                    "aspect-[4/5] bg-gradient-to-br transition-transform duration-500 group-hover:scale-[1.015]",
                    item.gradient,
                  )}
                />
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle">
                  {item.accentLabel} · from {formatGBP(startingPrice(item))}
                </p>
                <Link
                  to="/editions/$productId"
                  params={{ productId: item.slug }}
                  className="mt-2 font-serif text-2xl leading-snug hover:text-accent"
                >
                  {item.name}
                </Link>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                  {item.shortDescription}
                </p>
                <div className="mt-6 flex gap-2">
                  <Link
                    to="/editions/$productId"
                    params={{ productId: item.slug }}
                    className="flex h-11 flex-1 items-center justify-center bg-ink font-sans text-[0.68rem] uppercase tracking-[0.14em] text-cream hover:bg-deep"
                  >
                    Select options
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 grid gap-6 border border-border bg-ground-elevated p-6 sm:grid-cols-3 sm:p-8">
          <div>
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle">
              Fulfilment
            </p>
            <p className="mt-2 font-serif text-xl">Printify on demand</p>
            <p className="mt-2 text-sm text-ink-muted">
              Each edition is produced when ordered — no warehouse stock.
            </p>
          </div>
          <div>
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle">
              Shipping
            </p>
            <p className="mt-2 font-serif text-xl">UK & international</p>
            <p className="mt-2 text-sm text-ink-muted">
              Rates shown at checkout. Local production where Printify allows.
            </p>
          </div>
          <div>
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle">
              Presentation
            </p>
            <p className="mt-2 font-serif text-xl">Archive first</p>
            <p className="mt-2 text-sm text-ink-muted">
              Quiet objects on ivory ground — not a loud merch grid.
            </p>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
