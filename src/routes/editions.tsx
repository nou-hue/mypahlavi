import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  formatGBP,
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
  message?: string;
};

function ShopPage() {
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartStore((s) => s.count());
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/shop/catalog")
      .then((r) => r.json())
      .then((d: CatalogResponse) => {
        if (cancelled) return;
        // Printify products only — no editorial placeholders
        const list =
          d.source === "printify" && d.products?.length
            ? d.products
            : [];
        setProducts(list);
        setConnected(Boolean(d.connected && d.source === "printify"));
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setConnected(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <LayoutShell>
      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <header className="mb-14 flex flex-col gap-6 archive-rise sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md space-y-3">
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.28em] text-ink-subtle">
              Editions
            </p>
            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
              Limited shop
            </h1>
            <p className="text-base leading-relaxed text-ink-muted">
              Apparel and objects from the archive atelier.
            </p>
          </div>
          <button
            type="button"
            onClick={openCart}
            className="inline-flex h-11 shrink-0 items-center gap-2 border border-border px-5 font-sans text-[0.68rem] uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-cream"
          >
            <ShoppingBag className="size-4" />
            Bag{count > 0 ? ` (${count})` : ""}
          </button>
        </header>

        {loading ? (
          <p className="font-sans text-sm text-ink-subtle">Loading…</p>
        ) : products.length === 0 ? (
          <div className="border border-border px-6 py-16 text-center">
            <p className="font-serif text-2xl tracking-tight">
              {connected ? "Collection empty" : "Opening soon"}
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
              {connected
                ? "No published pieces in the atelier yet."
                : "The next release is being prepared."}
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex h-11 items-center border border-border px-6 font-sans text-[0.68rem] uppercase tracking-[0.16em] hover:bg-ink hover:text-cream"
            >
              Home
            </Link>
          </div>
        ) : (
          <div className="grid gap-x-10 gap-y-16 sm:grid-cols-2">
            {products.map((item, i) => (
              <article
                key={item.id}
                className="group flex flex-col archive-fade"
                style={{ animationDelay: `${i * 35}ms` }}
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
                <div className="mt-5 space-y-1.5">
                  <p className="font-sans text-[0.62rem] uppercase tracking-[0.16em] text-ink-subtle">
                    {item.category === "apparel" ? "Apparel" : "Object"} · from{" "}
                    {formatGBP(startingPrice(item))}
                  </p>
                  <Link
                    to="/editions/$productId"
                    params={{ productId: item.slug }}
                    className="font-serif text-2xl leading-snug tracking-tight hover:text-accent"
                  >
                    {item.name}
                  </Link>
                  <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
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
