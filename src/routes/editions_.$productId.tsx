import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { LayoutShell } from "@/components/archive/layout-shell";
import {
  formatGBP,
  getProduct,
  shopProducts,
  startingPrice,
  type ShopProduct,
} from "@/data/shop";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/editions_/$productId")({
  component: ProductPage,
});

function ProductPage() {
  const { productId } = Route.useParams();
  const product = getProduct(productId);

  if (!product) {
    return (
      <LayoutShell>
        <div className="mx-auto max-w-lg px-5 py-24 text-center">
          <h1 className="font-serif text-3xl">Not found</h1>
          <Link
            to="/editions"
            className="mt-8 inline-flex h-11 items-center border border-border px-6 font-sans text-[0.7rem] uppercase tracking-[0.16em] hover:bg-ink hover:text-cream"
          >
            Back to shop
          </Link>
        </div>
      </LayoutShell>
    );
  }

  return <ProductDetail product={product} />;
}

function ProductDetail({ product }: { product: ShopProduct }) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const variant = useMemo(
    () => product.variants.find((v) => v.id === variantId) ?? product.variants[0],
    [product, variantId],
  );

  const related = shopProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  function handleAdd() {
    if (!variant) return;
    addItem(product, variant, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <LayoutShell>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          to="/editions"
          className="mb-8 inline-flex items-center gap-2 font-sans text-[0.65rem] uppercase tracking-[0.16em] text-ink-subtle hover:text-ink"
        >
          <ArrowLeft className="size-3.5" /> Editions
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="overflow-hidden border border-border bg-deep">
            {product.imageSrc ? (
              <img
                src={product.imageSrc}
                alt={product.name}
                className="aspect-[3/4] w-full object-cover"
              />
            ) : (
              <div
                className={cn("aspect-[3/4] w-full bg-gradient-to-br", product.gradient)}
              />
            )}
          </div>

          <div className="flex flex-col archive-rise">
            <p className="font-sans text-[0.65rem] uppercase tracking-[0.18em] text-ink-subtle">
              {product.accentLabel}
            </p>
            <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 font-serif text-2xl text-ink-soft">
              {variant
                ? formatGBP(variant.priceGBP)
                : `from ${formatGBP(startingPrice(product))}`}
            </p>
            <p className="mt-5 text-base leading-relaxed text-ink-muted">
              {product.description}
            </p>

            <div className="mt-8 space-y-3">
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle">
                Options
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariantId(v.id)}
                    className={cn(
                      "h-10 px-3.5 font-sans text-[0.65rem] uppercase tracking-[0.12em] transition-colors",
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

            <dl className="mt-8 space-y-2 border-t border-border pt-6 text-sm text-ink-muted">
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-ink-subtle">Materials</dt>
                <dd>{product.materials}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-24 shrink-0 text-ink-subtle">Fulfilment</dt>
                <dd>{product.fulfilment}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex h-12 min-w-[10rem] items-center justify-center gap-2 bg-ink px-6 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-cream hover:opacity-90"
              >
                {added ? (
                  <>
                    <Check className="size-4" /> Added
                  </>
                ) : (
                  "Add to bag"
                )}
              </button>
              <Link
                to="/checkout"
                search={{}}
                className="inline-flex h-12 items-center border border-border px-6 font-sans text-[0.7rem] uppercase tracking-[0.16em] hover:border-ink/40"
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t border-border pt-12">
            <h2 className="font-serif text-2xl tracking-tight">Also in this series</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to="/editions/$productId"
                  params={{ productId: p.slug }}
                  className="group"
                >
                  {p.imageSrc ? (
                    <img
                      src={p.imageSrc}
                      alt={p.name}
                      className="aspect-[3/4] w-full border border-border object-cover transition-opacity group-hover:opacity-90"
                    />
                  ) : (
                    <div
                      className={cn(
                        "aspect-[3/4] border border-border bg-gradient-to-br",
                        p.gradient,
                      )}
                    />
                  )}
                  <p className="mt-2 font-serif text-lg">{p.name}</p>
                  <p className="text-xs text-ink-subtle">
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
