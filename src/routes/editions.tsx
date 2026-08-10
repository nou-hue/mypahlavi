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
  component: EditionsPage,
});

type CatalogResponse = {
  source: "printify" | "editorial";
  connected: boolean;
  shopTitle: string | null;
  products: ShopProduct[];
  message?: string;
};

function EditionsPage() {
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
        const list =
          d.source === "printify" && d.products?.length ? d.products : [];
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
          <div className="max-w-lg space-y-4">
            <p className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ink-subtle">
              Pahlavi Editions
            </p>
            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
              Limited cultural objects
            </h1>
            <p className="text-base leading-relaxed text-ink-muted">
              Archival prints, publications, and objects issued in numbered
              editions. A collector's house — not merchandise.
            </p>
          </div>
          <button
            type="button"
            onClick={openCart}
            className="inline-flex h-11 shrink-0 items-center gap-2 border border-border px-5 font-sans text-[0.65rem] uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-cream"
          >
            <ShoppingBag className="size-4" />
            Bag{count > 0 ? ` (${count})` : ""}
          </button>
        </header>

        {loading ? (
          <p className="font-sans text-sm text-ink-subtle">Loading…</p>
        ) : products.length === 0 ? (
          <div className="border border-border px-6 py-20 text-center">
            <p className="font-serif text-2xl tracking-tight">
              {connected ? "Between releases" : "Editions forthcoming"}
            </p>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
              {connected
                ? "The current collection is empty. New numbered works are in preparation."
                : "The first numbered releases are being prepared — museum-grade prints, portfolios, and archival publications."}
            </p>
            <div className="mx-auto mt-12 max-w-sm space-y-6 text-left">
              <div className="border-t border-border pt-5">
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.18em] text-ink-subtle">
                  Edition 001
                </p>
                <p className="mt-1 font-serif text-xl">Tehran / 1967</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Archival photographic print · museum-grade paper · edition of
                  25
                </p>
              </div>
              <div className="border-t border-border pt-5">
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.18em] text-ink-subtle">
                  Edition 002
                </p>
                <p className="mt-1 font-serif text-xl">The Tehran Book</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Limited archival publication
                </p>
              </div>
              <div className="border-t border-border pt-5">
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.18em] text-ink-subtle">
                  Edition 003
                </p>
                <p className="mt-1 font-serif text-xl">The Archive Box</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Photographs, documents and essays — physical collection
                </p>
              </div>
            </div>
            <Link
              to="/gallery"
              className="mt-12 inline-flex h-11 items-center border border-border px-6 font-sans text-[0.65rem] uppercase tracking-[0.16em] hover:bg-ink hover:text-cream"
            >
              Explore the gallery
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
                      className={cn("aspect-[3/4] bg-gradient-to-br", item.gradient)}
                    />
                  )}
                </Link>
                <div className="mt-5 space-y-1.5">
                  <p className="font-sans text-[0.58rem] uppercase tracking-[0.16em] text-ink-subtle">
                    Edition · from {formatGBP(startingPrice(item))}
                  </p>
                  <Link
                    to="/editions/$productId"
                    params={{ productId: item.slug }}
                    className="font-serif text-2xl leading-snug tracking-tight hover:opacity-70"
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
