import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  formatGBP,
  shopCategories,
  shopProducts,
  startingPrice,
  type ShopProduct,
} from "@/data/shop";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/editions")({
  component: ShopPage,
});

type CatalogResponse = {
  source: "printify" | "editorial";
  connected: boolean;
  shopTitle: string | null;
  products: ShopProduct[];
  message: string;
  error?: string;
};

/** Archival prints paused until the collection is curated by hand. */
function isPrintProduct(p: ShopProduct) {
  if (p.category === "print") return true;
  const t = `${p.name} ${p.shortDescription} ${p.accentLabel}`.toLowerCase();
  return /\bprint\b|poster|giclée|giclee|canvas wall|fine art paper/.test(t);
}

function ShopPage() {
  const [cat, setCat] = useState("all");
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartStore((s) => s.count());
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/shop/catalog")
      .then((r) => r.json())
      .then((d: CatalogResponse) => {
        if (!cancelled) setCatalog(d);
      })
      .catch(() => {
        if (!cancelled) {
          setCatalog({
            source: "editorial",
            connected: false,
            shopTitle: null,
            products: shopProducts,
            message: "Could not load catalogue",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const products = useMemo(() => {
    const raw = catalog?.products ?? shopProducts;
    // No archival prints until curated — keep apparel / objects only
    return raw.filter((p) => !isPrintProduct(p));
  }, [catalog]);

  const items = useMemo(() => {
    if (cat === "all") return products;
    return products.filter((e) => e.category === cat);
  }, [cat, products]);

  const categories = shopCategories.filter((c) => c.id !== "print");

  return (
    <LayoutShell>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <header className="mb-12 flex flex-col gap-6 archive-rise sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl space-y-3">
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ink-subtle">
              Editions
            </p>
            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
              Limited shop
            </h1>
            <p className="text-base leading-relaxed text-ink-muted">
              A small atelier of objects — curated by hand, produced on demand.
            </p>
          </div>
          <button
            type="button"
            onClick={openCart}
            className="inline-flex h-11 items-center gap-2 border border-border px-5 font-sans text-[0.68rem] uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-cream"
          >
            <ShoppingBag className="size-4" />
            Bag{count > 0 ? ` (${count})` : ""}
          </button>
        </header>

        {/* Prints — intentionally closed */}
        <div className="mb-14 border border-border bg-ground-elevated px-6 py-10 text-center sm:px-10 archive-rise">
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ink-subtle">
            Archival prints
          </p>
          <h2 className="mt-3 font-serif text-2xl tracking-tight sm:text-3xl">
            Coming soon
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
            Wall editions from the collection will open when each plate has been
            chosen with care. Not a catalogue dump — a short list, later.
          </p>
        </div>

        {categories.length > 1 && products.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                className={cn(
                  "h-9 px-3.5 font-sans text-[0.65rem] uppercase tracking-[0.14em]",
                  cat === c.id
                    ? "bg-ink text-cream"
                    : "border border-border text-ink-muted hover:border-ink/30",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="font-sans text-sm text-ink-subtle">Loading editions…</p>
        ) : items.length === 0 ? (
          <div className="border border-border px-6 py-14 text-center">
            <p className="font-serif text-xl text-ink-soft">
              Objects open next
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm text-ink-muted">
              Apparel and small goods will appear here when released. Prints remain
              closed until selected.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex h-11 items-center border border-border px-6 font-sans text-[0.68rem] uppercase tracking-[0.16em] hover:bg-ink hover:text-cream"
            >
              Return home
            </Link>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <article
                key={item.id}
                className="group flex flex-col archive-fade"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <Link
                  to="/editions/$productId"
                  params={{ productId: item.slug }}
                  className="block overflow-hidden border border-border bg-deep"
                >
                  {item.imageSrc ? (
                    <img
                      src={item.imageSrc}
                      alt={item.name}
                      className="aspect-[3/4] w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={cn(
                        "aspect-[3/4] bg-gradient-to-br",
                        item.gradient,
                      )}
                    />
                  )}
                </Link>
                <div className="mt-3 space-y-1">
                  <p className="font-sans text-[0.62rem] uppercase tracking-[0.14em] text-ink-subtle">
                    {item.accentLabel} · from {formatGBP(startingPrice(item))}
                  </p>
                  <Link
                    to="/editions/$productId"
                    params={{ productId: item.slug }}
                    className="font-serif text-xl leading-snug hover:text-accent"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    {item.shortDescription}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
