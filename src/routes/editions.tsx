import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  formatGBP,
  startingPrice,
  type ShopProduct,
} from "@/data/shop";
import { resolveEditionImage } from "@/data/edition-imagery";
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
        // Prefer live Printify catalogue; fall back to editorial objects so
        // the museum-shop presentation remains reviewable offline/preview.
        const list = d.products?.length ? d.products : [];
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
      <div className="mx-auto max-w-[72rem] px-6 py-16 sm:px-10 sm:py-24 lg:px-12">
        <header className="mb-16 max-w-xl space-y-5 archive-rise sm:mb-20">
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.28em] text-ink-subtle">
            Editions
          </p>
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            Limited cultural objects
          </h1>
          <p className="text-base leading-relaxed text-ink-muted">
            A quiet extension of the archive — objects issued with the same
            editorial care as the plates themselves. Museum shop, not merchandise
            floor.
          </p>
          <div className="flex items-center gap-6 pt-2">
            <button
              type="button"
              onClick={openCart}
              className="inline-flex h-10 items-center gap-2 font-sans text-[0.65rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
            >
              <ShoppingBag className="size-3.5" strokeWidth={1.25} />
              Bag{count > 0 ? ` · ${String(count).padStart(2, "0")}` : ""}
            </button>
            {connected && (
              <span className="font-sans text-[0.58rem] uppercase tracking-[0.18em] text-ink-subtle">
                Made to order
              </span>
            )}
          </div>
        </header>

        {loading ? (
          <p className="font-sans text-sm text-ink-subtle">Loading…</p>
        ) : products.length === 0 ? (
          <div className="border-t border-border pt-16 text-center">
            <p className="font-serif text-2xl tracking-tight">
              {connected ? "Between releases" : "Editions forthcoming"}
            </p>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
              {connected
                ? "The current collection is empty. New numbered works are in preparation."
                : "The first numbered releases are being prepared — museum-grade prints, portfolios, and archival publications."}
            </p>
            <Link
              to="/gallery"
              className="mt-12 inline-flex h-11 items-center border border-border px-6 font-sans text-[0.65rem] uppercase tracking-[0.16em] hover:bg-ink hover:text-cream"
            >
              Explore the gallery
            </Link>
          </div>
        ) : (
          <div className="grid gap-x-12 gap-y-20 sm:grid-cols-2">
            {products.map((item, i) => {
              const plate = resolveEditionImage(item);
              const isObject =
                plate.plate === "object" || plate.plate === "interior";
              return (
                <article
                  key={item.id}
                  className="group flex flex-col archive-fade"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <Link
                    to="/editions/$productId"
                    params={{ productId: item.slug }}
                    className={cn(
                      "relative block overflow-hidden border border-border",
                      isObject ? "bg-cream" : "bg-ground-elevated",
                    )}
                  >
                    {plate.imageSrc || item.imageSrc ? (
                      <img
                        src={plate.imageSrc || item.imageSrc}
                        alt={item.name}
                        className={cn(
                          "w-full transition-opacity duration-500 group-hover:opacity-95",
                          isObject
                            ? "aspect-[4/3] object-contain p-6 sm:p-8"
                            : "aspect-[3/4] object-cover",
                        )}
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
                  <div className="mt-6 space-y-2">
                    <p className="font-sans text-[0.58rem] uppercase tracking-[0.18em] text-ink-subtle">
                      {item.accentLabel || "Edition"} · from{" "}
                      {formatGBP(startingPrice(item))}
                    </p>
                    <Link
                      to="/editions/$productId"
                      params={{ productId: item.slug }}
                      className="block font-serif text-2xl leading-snug tracking-tight transition-opacity hover:opacity-70"
                    >
                      {item.name}
                    </Link>
                    <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
                      {item.shortDescription}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
