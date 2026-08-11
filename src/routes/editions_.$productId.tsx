import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  formatGBP,
  startingPrice,
  type ShopProduct,
} from "@/data/shop";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/editions_/$productId")({
  component: ProductPage,
});

type CatalogResponse = {
  source: "printify" | "editorial";
  products: ShopProduct[];
};

function ProductPlate({ product }: { product: ShopProduct }) {
  return (
    <div className="overflow-hidden border border-border/50 bg-cream">
      {product.imageSrc ? (
        <div className="flex aspect-[4/5] items-center justify-center p-10 sm:p-14 lg:min-h-[28rem] lg:aspect-auto lg:p-16">
          <img
            src={product.imageSrc}
            alt={product.name}
            className="max-h-[22rem] max-w-[75%] object-contain sm:max-h-[26rem]"
          />
        </div>
      ) : (
        <div
          className={cn("aspect-[4/5] w-full bg-gradient-to-br", product.gradient)}
        />
      )}
    </div>
  );
}

function ProductPage() {
  const { productId } = Route.useParams();
  const [products, setProducts] = useState<ShopProduct[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/shop/catalog")
      .then((r) => r.json())
      .then((d: CatalogResponse) => {
        if (cancelled) return;
        setProducts(d.products?.length ? d.products : []);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const list = products ?? [];
  const product =
    list.find((p) => p.slug === productId || p.id === productId) ?? null;

  if (loading) {
    return (
      <LayoutShell>
        <div className="mx-auto max-w-lg px-6 py-24 text-center text-sm text-ink-subtle">
          Loading…
        </div>
      </LayoutShell>
    );
  }

  if (!product) {
    return (
      <LayoutShell>
        <div className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="font-serif text-3xl">Not found</h1>
          <p className="mt-3 text-sm text-ink-muted">
            This edition is not available.
          </p>
          <Link
            to="/editions"
            className="mt-8 inline-flex h-11 items-center border border-border px-6 font-sans text-[0.7rem] uppercase tracking-[0.16em] hover:bg-ink hover:text-cream"
          >
            Back to Editions
          </Link>
        </div>
      </LayoutShell>
    );
  }

  return <ProductDetail product={product} all={list} />;
}

function ProductDetail({
  product,
  all,
}: {
  product: ShopProduct;
  all: ShopProduct[];
}) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const variant = useMemo(
    () =>
      product.variants.find((v) => v.id === variantId) ?? product.variants[0],
    [product, variantId],
  );

  const related = all.filter((p) => p.id !== product.id).slice(0, 2);

  const materials = (product.materials || "")
    .replace(/printify/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/^[·\s]+|[·\s]+$/g, "")
    .trim();

  const label =
    product.category === "apparel"
      ? "Apparel"
      : product.category === "print"
        ? "Print"
        : "Object";

  function handleAdd() {
    if (!variant) return;
    addItem(product, variant, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  const description = product.description
    .replace(/printify/gi, "our atelier")
    .replace(/Product features[\s\S]*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 420);

  return (
    <LayoutShell>
      <div className="mx-auto max-w-5xl px-6 py-14 sm:px-10 sm:py-20">
        <Link
          to="/editions"
          className="mb-12 inline-flex items-center gap-2 font-sans text-[0.62rem] uppercase tracking-[0.16em] text-ink-subtle transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.25} /> Editions
        </Link>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 xl:gap-20">
          <ProductPlate product={product} />

          <div className="flex flex-col lg:pt-2 archive-rise">
            <p className="font-sans text-[0.62rem] uppercase tracking-[0.2em] text-ink-subtle">
              {label}
            </p>
            <h1 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
              {product.name}
            </h1>
            <p className="mt-5 font-serif text-xl text-ink-soft sm:text-2xl">
              {variant
                ? formatGBP(variant.priceGBP)
                : `from ${formatGBP(startingPrice(product))}`}
            </p>

            {description && (
              <p className="mt-6 max-w-md text-[0.95rem] leading-[1.7] text-ink-muted">
                {description}
              </p>
            )}

            <div className="mt-10 space-y-3">
              <p className="font-sans text-[0.58rem] uppercase tracking-[0.16em] text-ink-subtle">
                Options
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariantId(v.id)}
                    className={cn(
                      "min-h-10 px-3.5 py-2 font-sans text-[0.62rem] uppercase tracking-[0.1em] transition-colors",
                      variantId === v.id
                        ? "bg-ink text-cream"
                        : "border border-border text-ink-muted hover:border-ink/30",
                    )}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {materials && !/printify/i.test(materials) && (
              <p className="mt-8 border-t border-border pt-6 font-sans text-[0.7rem] uppercase tracking-[0.12em] text-ink-subtle">
                {materials}
              </p>
            )}

            <div className="mt-8">
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex h-12 min-w-[11rem] items-center justify-center gap-2 bg-ink px-7 font-sans text-[0.68rem] uppercase tracking-[0.16em] text-cream transition-opacity hover:opacity-90"
              >
                {added ? (
                  <>
                    <Check className="size-4" /> Added
                  </>
                ) : (
                  "Add to bag"
                )}
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-28 border-t border-border pt-16">
            <p className="font-sans text-[0.62rem] uppercase tracking-[0.22em] text-ink-subtle">
              Continue exploring
            </p>
            <h2 className="mt-3 font-serif text-2xl tracking-tight sm:text-3xl">
              Also in Editions
            </h2>
            <div className="mt-12 grid gap-12 sm:grid-cols-2">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to="/editions/$productId"
                  params={{ productId: p.slug }}
                  className="group"
                >
                  <div className="overflow-hidden border border-border/60 bg-cream">
                    {p.imageSrc ? (
                      <div className="flex aspect-[4/5] items-center justify-center p-8 sm:p-10">
                        <img
                          src={p.imageSrc}
                          alt={p.name}
                          className="max-h-[65%] max-w-[65%] object-contain transition-opacity group-hover:opacity-90"
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "aspect-[4/5] bg-gradient-to-br",
                          p.gradient,
                        )}
                      />
                    )}
                  </div>
                  <p className="mt-4 font-serif text-xl tracking-tight">{p.name}</p>
                  <p className="mt-1 font-sans text-[0.58rem] uppercase tracking-[0.14em] text-ink-subtle">
                    from {formatGBP(startingPrice(p))}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </LayoutShell>
  );
}
