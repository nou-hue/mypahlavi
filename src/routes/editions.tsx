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

  const products = catalog?.products ?? shopProducts;

  const items = useMemo(() => {
    if (cat === "all") return products;
    return products.filter((e) => e.category === cat);
  }, [cat, products]);

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
              Archival prints, apparel, and objects — produced on demand through
              Printify. Small catalogue, quiet presentation.
            </p>
            {catalog && (
              <p
                className={cn(
                  "text-xs",
                  catalog.connected && catalog.source === "printify"
                    ? "text-ink-muted"
                    : "text-ink-subtle",
                )}
              >
                {catalog.message}
                {catalog.error ? ` · ${catalog.error}` : ""}
              </p>
            )}
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

        <div className="mb-10 flex flex-wrap gap-2">
          {shopCategories.map((c) => (
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

        {loading ? (
          <p className="font-sans text-sm text-ink-subtle">Loading editions…</p>
        ) : items.length === 0 ? (
          <p className="font-sans text-sm text-ink-muted">
            No products in this category yet. Publish items in your Printify shop,
            then refresh.
          </p>
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
