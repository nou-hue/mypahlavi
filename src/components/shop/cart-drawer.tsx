import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { formatGBP } from "@/data/shop";
import { useCartStore } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        className="absolute inset-0 bg-deep/40 backdrop-blur-[2px]"
        aria-label="Close bag"
        onClick={closeCart}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-ground text-ink shadow-soft archive-fade">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-ink-muted" />
            <p className="font-sans text-[0.68rem] uppercase tracking-[0.16em]">
              Bag
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="inline-flex h-11 w-11 items-center justify-center"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="font-serif text-2xl">Empty</p>
              <p className="max-w-xs text-sm text-ink-muted">
                Limited editions — prints and objects from the collection.
              </p>
              <Link
                to="/editions"
                onClick={closeCart}
                className="mt-2 h-11 border border-border px-5 font-sans text-[0.68rem] uppercase tracking-[0.16em] leading-[2.75rem] hover:bg-ink hover:text-cream"
              >
                Browse
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-4 border-b border-border pb-5">
                  {line.imageSrc ? (
                    <img
                      src={line.imageSrc}
                      alt=""
                      className="h-24 w-20 shrink-0 object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "h-24 w-20 shrink-0 bg-gradient-to-br",
                        line.gradient,
                      )}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/editions/$productId"
                      params={{ productId: line.slug }}
                      onClick={closeCart}
                      className="font-serif text-lg leading-snug hover:text-accent"
                    >
                      {line.name}
                    </Link>
                    <p className="mt-1 text-xs text-ink-subtle">
                      {line.variantLabel}
                    </p>
                    <p className="mt-1 text-sm">
                      {formatGBP(line.unitPriceGBP * line.quantity)}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center border border-border"
                        onClick={() => setQuantity(line.key, line.quantity - 1)}
                        aria-label="Decrease"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center border border-border"
                        onClick={() => setQuantity(line.key, line.quantity + 1)}
                        aria-label="Increase"
                      >
                        <Plus className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="ml-auto text-[0.65rem] uppercase tracking-[0.12em] text-ink-subtle hover:text-ink"
                        onClick={() => removeItem(line.key)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-border px-5 py-5">
            <div className="flex items-center justify-between">
              <span className="font-sans text-[0.65rem] uppercase tracking-[0.14em] text-ink-subtle">
                Subtotal
              </span>
              <span className="font-serif text-2xl">{formatGBP(subtotal)}</span>
            </div>
            <p className="mt-2 text-xs text-ink-subtle">
              Shipping calculated at checkout. Each piece is made to order.
            </p>
            <Link
              to="/checkout"
              search={{}}
              onClick={closeCart}
              className="mt-4 flex h-12 w-full items-center justify-center bg-ink font-sans text-[0.7rem] uppercase tracking-[0.16em] text-cream hover:opacity-90"
            >
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
