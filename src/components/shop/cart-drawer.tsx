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
            <p className="font-sans text-[0.72rem] uppercase tracking-[0.18em]">
              Your bag
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
              <p className="font-serif text-2xl">The bag is empty</p>
              <p className="max-w-xs text-sm text-ink-muted">
                Request editions from the shop — prints, apparel, and objects
                fulfilled on demand.
              </p>
              <Link
                to="/editions"
                onClick={closeCart}
                className="mt-2 h-11 border border-ink/20 px-5 font-sans text-[0.72rem] uppercase tracking-[0.16em] leading-[2.75rem] hover:bg-ink hover:text-cream"
              >
                Browse editions
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-4 border-b border-border pb-5">
                  <div
                    className={cn(
                      "h-24 w-20 shrink-0 bg-gradient-to-br",
                      line.gradient,
                    )}
                  />
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
                      {line.variantLabel} · {line.sku}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {formatGBP(line.unitPriceGBP)}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            setQuantity(line.key, line.quantity - 1)
                          }
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center"
                          aria-label="Increase quantity"
                          onClick={() =>
                            setQuantity(line.key, line.quantity + 1)
                          }
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(line.key)}
                        className="font-sans text-[0.65rem] uppercase tracking-[0.12em] text-ink-subtle hover:text-ink"
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
            <div className="mb-4 flex items-center justify-between">
              <span className="font-sans text-[0.7rem] uppercase tracking-[0.16em] text-ink-subtle">
                Subtotal
              </span>
              <span className="font-serif text-xl">{formatGBP(subtotal)}</span>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-ink-subtle">
              Shipping calculated at checkout. Printify produces each edition on
              demand.
            </p>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="flex h-12 w-full items-center justify-center bg-ink font-sans text-[0.72rem] uppercase tracking-[0.16em] text-cream transition-colors hover:bg-deep"
            >
              Checkout
            </Link>
            <button
              type="button"
              onClick={closeCart}
              className="mt-3 w-full py-2 font-sans text-[0.68rem] uppercase tracking-[0.14em] text-ink-subtle hover:text-ink"
            >
              Continue browsing
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
