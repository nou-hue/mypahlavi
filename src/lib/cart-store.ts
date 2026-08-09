import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ShopProduct, ProductVariant } from "@/data/shop";

export type CartLine = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  variantId: string;
  variantLabel: string;
  unitPriceGBP: number;
  quantity: number;
  gradient: string;
  sku: string;
  imageSrc?: string;
  printifyProductId?: string | null;
  printifyVariantId?: number | null;
};

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (
    product: ShopProduct,
    variant: ProductVariant,
    quantity?: number,
  ) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

function lineKey(productId: string, variantId: string) {
  return `${productId}__${variantId}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      addItem: (product, variant, quantity = 1) => {
        const key = lineKey(product.id, variant.id);
        set((state) => {
          const existing = state.lines.find((l) => l.key === key);
          if (existing) {
            return {
              isOpen: true,
              lines: state.lines.map((l) =>
                l.key === key
                  ? { ...l, quantity: l.quantity + quantity }
                  : l,
              ),
            };
          }
          return {
            isOpen: true,
            lines: [
              ...state.lines,
              {
                key,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                variantId: variant.id,
                variantLabel: variant.label,
                unitPriceGBP: variant.priceGBP,
                quantity,
                gradient: product.gradient,
                sku: variant.sku,
                imageSrc: product.imageSrc,
                printifyProductId: product.printifyProductId ?? null,
                printifyVariantId: variant.printifyVariantId ?? null,
              },
            ],
          };
        });
      },
      setQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set((state) => ({
          lines: state.lines.map((l) =>
            l.key === key ? { ...l, quantity } : l,
          ),
        }));
      },
      removeItem: (key) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.key !== key),
        })),
      clear: () => set({ lines: [] }),
      count: () => get().lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: () =>
        get().lines.reduce((n, l) => n + l.unitPriceGBP * l.quantity, 0),
    }),
    {
      name: "mypahlavi-cart",
      partialize: (s) => ({ lines: s.lines }),
    },
  ),
);
