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
          <h1 className="font-serif text-3xl">Edition not found</h1>
          <p className="mt-3 text-sm text-ink-muted">
            This product is not in the current catalogue.
          </p>
          <Link
            to="/editions"
            className="mt-8 inline-flex h-11 items-center border border-ink/20 px-6 font-sans text-[0.72rem] uppercase tracking-[0.16em] hover:bg-ink hover:text-cream"
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
  const openCart = useCartStore((s) => s.openCart);

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
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          to="/editions"
          className="mb-8 inline-flex items-center gap-2 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-ink-subtle hover:text-ink"
        >
          <ArrowLeft className="size-3.5" /> All editions
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div
            className={cn(
              "aspect-[4/5] w-full bg-gradient-to-br shadow-soft",
              product.gradient,
            )}
          />

          <div className="flex flex-col archive-rise">
            <p className="font-sans text-[0.68rem] uppercase tracking-[0.18em] text-ink-subtle">
              {product.accentLabel} · Printify edition
            </p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
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
              <p className="font-sans text-[0.68rem] uppercase tracking-[0.16em] text-ink-subtle">
                {product.category === "apparel" ? "Size" : "Options"}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariantId(v.id)}
                    className={cn(
                      "min-h-11 px-4 font-sans text-[0.72rem] uppercase tracking-[0.12em] transition-colors",
                      variantId === v.id
                        ? "bg-ink text-cream"
                        : "border border-border text-ink-muted hover:border-ink/40",
                    )}
                  >
                    {v.label}
                    {product.variants.length > 1 && product.category === "print" ? (
                      <span className="ml-2 opacity-70">{formatGBP(v.priceGBP)}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-3 text-sm text-ink-muted sm:grid-cols-2">
              <div className="border border-border p-4">
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle">
                  Materials
                </p>
                <p className="mt-2">{product.materials}</p>
              </div>
              <div className="border border-border p-4">
                <p className="font-sans text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle">
                  Fulfilment
                </p>
                <p className="mt-2">{product.fulfilment}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleAdd}
                className="flex h-12 flex-1 items-center justify-center gap-2 bg-ink font-sans text-[0.72rem] uppercase tracking-[0.16em] text-cream transition-colors hover:bg-deep"
              >
                {added ? (
                  <>
                    <Check className="size-4" /> Added to bag
                  </>
                ) : (
                  "Add to bag"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAdd();
                  openCart();
                }}
                className="flex h-12 items-center justify-center border border-ink/20 px-6 font-sans text-[0.72rem] uppercase tracking-[0.16em] hover:border-ink"
              >
                Add & view bag
              </button>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-ink-subtle">
              SKU {variant?.sku}. Produced on demand when you complete checkout.
              Connect your Printify store API for live production routing.
            </p>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20 border-t border-border pt-12">
            <h2 className="font-serif text-3xl tracking-tight">Related editions</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to="/editions/$productId"
                  params={{ productId: p.slug }}
                  className="group border border-border"
                >
                  <div
                    className={cn(
                      "aspect-[4/5] bg-gradient-to-br transition-transform duration-500 group-hover:scale-[1.01]",
                      p.gradient,
                    )}
                  />
                  <div className="p-4">
                    <p className="font-serif text-lg leading-snug">{p.name}</p>
                    <p className="mt-1 text-xs text-ink-subtle">
                      from {formatGBP(startingPrice(p))}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </LayoutShell>
  );
}
