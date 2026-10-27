import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  formatGBP,
  shopProducts,
  startingPrice,
  type ShopProduct,
} from "@/data/shop";
import { useCartStore } from "@/lib/cart-store";

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

function ProductPlate({ product }: { product: ShopProduct }) {
  return (
    <div className="border border-border bg-[#fffefa] p-5 shadow-soft sm:p-7">
      <div className="flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#f2f2ef]">
        {product.imageSrc ? (
          <img
            src={product.imageSrc}
            alt={product.name}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className={"h-full w-full bg-gradient-to-br " + product.gradient} />
        )}
      </div>
    </div>
  );
}

function EditionsPage() {
  const openCart = useCartStore((s) => s.openCart);
  const count = useCartStore((s) => s.count());
  const [available, setAvailable] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/shop/catalog")
      .then((r) => r.json())
      .then((d: CatalogResponse) => {
        if (cancelled) return;
        const list = (d.products ?? []).filter((p) => Boolean(p.printifyProductId));
        setAvailable(list);
        setConnected(Boolean(d.connected));
      })
      .catch(() => {
        if (!cancelled) {
          setAvailable([]);
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
      <main>
        <section className="border-b border-border bg-ground">
          <div className="mx-auto max-w-[90rem] px-6 py-20 sm:px-12 sm:py-28">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-2xl archive-rise">
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-ink-subtle">
                  MyPahlavi Editions
                </p>
                <h1 className="mt-6 text-balance font-serif text-5xl leading-[1] tracking-[-0.035em] sm:text-6xl">
                  Objects from the research.
                </h1>
                <p className="mt-7 max-w-xl text-base leading-8 text-ink-muted">
                  Original graphic studies, archival editions where provenance permits,
                  and useful objects designed for the reading desk. No generic souvenir
                  catalogue.
                </p>
              </div>

              <button
                type="button"
                onClick={openCart}
                className="inline-flex h-10 items-center gap-2 font-sans text-[0.65rem] uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-ink"
              >
                <ShoppingBag className="size-3.5" strokeWidth={1.25} />
                Bag{count > 0 ? ` · ${String(count).padStart(2, "0")}` : ""}
              </button>
            </div>
          </div>
        </section>

        <section className="bg-ground">
          <div className="mx-auto max-w-[90rem] px-6 py-20 sm:px-12 sm:py-28">
            <div className="mb-14 grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
              <div>
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.26em] text-ink-subtle">
                  Studio / V4
                </p>
                <h2 className="mt-4 font-serif text-3xl tracking-[-0.02em] sm:text-4xl">
                  First studies
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-ink-muted">
                Every study begins as an artwork for a specific format. Prints keep a
                deliberate white border; panoramic work is designed for the desk rather
                than stretched from a poster; paper goods use full-cover compositions.
                These masters become purchasable only after production and mockups pass review.
              </p>
            </div>

            <div className="grid gap-x-9 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {shopProducts.map((item, i) => (
                <article
                  key={item.id}
                  className="archive-fade"
                  style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                >
                  <ProductPlate product={item} />
                  <div className="mt-5">
                    <p className="font-sans text-[0.55rem] uppercase tracking-[0.18em] text-ink-subtle">
                      {item.accentLabel} · study
                    </p>
                    <h3 className="mt-2 font-serif text-2xl leading-tight tracking-tight">
                      {item.name}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-7 text-ink-muted">
                      {item.shortDescription}
                    </p>
                    <p className="mt-4 font-sans text-[0.55rem] uppercase tracking-[0.14em] text-ink-subtle">
                      Target retail · from {formatGBP(startingPrice(item))}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-[#111214] text-[#fffefa]">
          <div className="mx-auto max-w-[90rem] px-6 py-20 sm:px-12 sm:py-28">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-8">
              <div>
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.26em] text-white/45">
                  Available now
                </p>
                <h2 className="mt-4 font-serif text-4xl tracking-[-0.025em]">
                  Production-approved objects
                </h2>
              </div>
              {connected && (
                <span className="font-sans text-[0.55rem] uppercase tracking-[0.16em] text-white/45">
                  Printify connected · made to order
                </span>
              )}
            </div>

            {loading ? (
              <p className="text-sm text-white/50">Checking the live catalogue…</p>
            ) : available.length === 0 ? (
              <div className="max-w-xl border-t border-white/15 pt-8">
                <p className="font-serif text-2xl">The new collection is in production review.</p>
                <p className="mt-4 text-sm leading-7 text-white/60">
                  Nothing is being pushed live merely to fill the shop. The first V4 objects
                  will appear here after the artwork, crop, mockup, material and price all pass.
                </p>
              </div>
            ) : (
              <div className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                {available.map((item) => (
                  <article key={item.id} className="group">
                    <Link
                      to="/editions/$productId"
                      params={{ productId: item.slug }}
                      className="block"
                    >
                      <div className="bg-[#fffefa] p-5">
                        <div className="flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#efefeb]">
                          {item.imageSrc ? (
                            <img
                              src={item.imageSrc}
                              alt={item.name}
                              className="h-full w-full object-contain transition-opacity group-hover:opacity-90"
                            />
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-5 font-sans text-[0.55rem] uppercase tracking-[0.16em] text-white/45">
                        {item.accentLabel} · from {formatGBP(startingPrice(item))}
                      </p>
                      <h3 className="mt-2 font-serif text-2xl">{item.name}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/60">
                        {item.shortDescription}
                      </p>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </LayoutShell>
  );
}
