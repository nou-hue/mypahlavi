export type ProductCategory = "print" | "apparel" | "object";

import { applyGbpPrices } from "@/data/gbp-prices";

export type ProductVariant = {
  id: string;
  label: string;
  /**
   * Retail price in GBP pounds, from the GBP price map (src/data/gbp-prices.ts)
   * only. `null` = not mapped = "Price on request" (not purchasable).
   * Never derived from a vendor (Printify) price.
   */
  priceGBP: number | null;
  /** Always GBP. Prices in any other unit must never reach this field. */
  currency: "GBP";
  sku: string;
  /** Printify variant id (number) once product is published in your shop */
  printifyVariantId?: number | null;
};

/** Variant as authored: price comes from the GBP price map, not from here. */
type RawVariant = Omit<ProductVariant, "priceGBP" | "currency">;

export type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: ProductCategory;
  gradient: string;
  accentLabel: string;
  materials: string;
  fulfilment: string;
  variants: ProductVariant[];
  featured?: boolean;
  /** Optional product image (archive plate or mock) */
  imageSrc?: string;
  /** Printify product id string once published in your shop */
  printifyProductId?: string | null;
};

/**
 * Editorial catalogue.
 * Connect Printify: create matching products in your Printify shop, then set
 * printifyProductId + each variant's printifyVariantId (or use /api/shop/printify/sync).
 */
type RawShopProduct = Omit<ShopProduct, "variants"> & { variants: RawVariant[] };

const rawShopProducts: RawShopProduct[] = [
  {
    id: "e-01",
    slug: "coronation-study-print",
    name: "Coronation study",
    shortDescription: "Ceremonial plate on museum-weight matte paper.",
    description:
      "Large-format archival print from the coronation sequence. Quiet margins, soft grading. Produced on demand and packed as a limited edition.",
    category: "print",
    gradient: "from-[#2a241e] via-[#4a3e34] to-[#14110e]",
    accentLabel: "Print",
    materials: "Museum-weight matte paper · pigment inks",
    fulfilment: "Made to order",
    featured: true,
    imageSrc: "/archive/farah-pahlavi/user-farah-coronation-crown-ermine.jpg",
    printifyProductId: null,
    variants: [
      { id: "a3", label: "A3 (297 × 420 mm)", sku: "PRINT-COR-A3" },
      { id: "a2", label: "A2 (420 × 594 mm)", sku: "PRINT-COR-A2" },
      { id: "a1", label: "A1 (594 × 841 mm)", sku: "PRINT-COR-A1" },
    ],
  },
  {
    id: "e-02",
    slug: "garden-laughter-print",
    name: "Garden light",
    shortDescription: "Private moment — Shah, Farah, and child.",
    description:
      "A quieter domestic plate from the collection. Printed on fine-art paper with restrained contrast for contemplative display.",
    category: "print",
    gradient: "from-[#1e1a16] via-[#3c342c] to-[#100e0c]",
    accentLabel: "Print",
    materials: "Fine art paper · giclée pigment",
    fulfilment: "Made to order",
    featured: true,
    imageSrc: "/archive/other-family/user-garden-laughter-with-baby.jpg",
    printifyProductId: null,
    variants: [
      { id: "a3", label: "A3", sku: "PRINT-GAR-A3" },
      { id: "a2", label: "A2", sku: "PRINT-GAR-A2" },
    ],
  },
  {
    id: "e-07",
    slug: "imperial-trio-print",
    name: "Imperial trio",
    shortDescription: "Crown Prince Reza with Farah and the Shah.",
    description:
      "Formal family composition — succession made visible. Limited wall edition.",
    category: "print",
    gradient: "from-[#161412] via-[#2e2824] to-[#0a0908]",
    accentLabel: "Print",
    materials: "Heavy matte stock · pigment inks",
    fulfilment: "Made to order",
    imageSrc: "/archive/other-family/user-imperial-trio-reza-farah-shah.jpg",
    printifyProductId: null,
    variants: [
      { id: "a3", label: "A3", sku: "PRINT-TRI-A3" },
      { id: "a2", label: "A2", sku: "PRINT-TRI-A2" },
    ],
  },
  {
    id: "e-03",
    slug: "ivory-crest-tee",
    name: "Ivory crest tee",
    shortDescription: "Heavyweight cotton, restrained monochrome crest.",
    description:
      "Heavyweight cotton, soft hand, single crest in charcoal. Everyday wear without noise.",
    category: "apparel",
    gradient: "from-[#3a342c] via-[#5a5046] to-[#1c1814]",
    accentLabel: "Apparel",
    materials: "100% heavyweight cotton · DTG",
    fulfilment: "Made to order",
    featured: true,
    printifyProductId: null,
    variants: [
      { id: "s", label: "S", sku: "TEE-CR-S" },
      { id: "m", label: "M", sku: "TEE-CR-M" },
      { id: "l", label: "L", sku: "TEE-CR-L" },
      { id: "xl", label: "XL", sku: "TEE-CR-XL" },
      { id: "2xl", label: "2XL", sku: "TEE-CR-2XL" },
    ],
  },
  {
    id: "e-04",
    slug: "charcoal-archive-hoodie",
    name: "Archive hoodie",
    shortDescription: "Minimal wordmark hoodie in deep charcoal.",
    description:
      "Soft midweight hoodie with a single typographic mark. Charcoal and ivory only.",
    category: "apparel",
    gradient: "from-[#24201c] via-[#3e3832] to-[#12100e]",
    accentLabel: "Apparel",
    materials: "Cotton-blend fleece · DTG",
    fulfilment: "Made to order",
    printifyProductId: null,
    variants: [
      { id: "s", label: "S", sku: "HOOD-AR-S" },
      { id: "m", label: "M", sku: "HOOD-AR-M" },
      { id: "l", label: "L", sku: "HOOD-AR-L" },
      { id: "xl", label: "XL", sku: "HOOD-AR-XL" },
    ],
  },
  {
    id: "e-08",
    slug: "parchment-longsleeve",
    name: "Parchment long sleeve",
    shortDescription: "Warm ivory long sleeve with micro crest.",
    description: "Quiet daily layer. Cream ground, micro crest — no chest shout.",
    category: "apparel",
    gradient: "from-[#4a443c] via-[#6b6358] to-[#2a2622]",
    accentLabel: "Apparel",
    materials: "Cotton long sleeve · soft print",
    fulfilment: "Made to order",
    printifyProductId: null,
    variants: [
      { id: "s", label: "S", sku: "LS-PR-S" },
      { id: "m", label: "M", sku: "LS-PR-M" },
      { id: "l", label: "L", sku: "LS-PR-L" },
      { id: "xl", label: "XL", sku: "LS-PR-XL" },
    ],
  },
  {
    id: "e-06",
    slug: "museum-tote-parchment",
    name: "Canvas tote",
    shortDescription: "Natural canvas with single typographic mark.",
    description: "Built for books. Natural canvas, one mark, reinforced handles.",
    category: "object",
    gradient: "from-[#38322c] via-[#564c42] to-[#1a1612]",
    accentLabel: "Object",
    materials: "Natural canvas · durable print",
    fulfilment: "Made to order",
    printifyProductId: null,
    variants: [
      { id: "one", label: "One size", sku: "TOTE-PAR-1" },
    ],
  },
  {
    id: "e-09",
    slug: "archive-mug",
    name: "Archive mug",
    shortDescription: "Ceramic mug with micro wordmark.",
    description: "Ivory ceramic, charcoal micro mark — for the desk beside open letters.",
    category: "object",
    gradient: "from-[#3a342e] via-[#5a5046] to-[#1c1814]",
    accentLabel: "Object",
    materials: "Ceramic · dishwasher-safe print",
    fulfilment: "Made to order",
    printifyProductId: null,
    variants: [
      { id: "11oz", label: "11 oz", sku: "MUG-AR-11" },
      { id: "15oz", label: "15 oz", sku: "MUG-AR-15" },
    ],
  },
];

/** Every product leaves this module priced from the GBP map (or null). */
export const shopProducts: ShopProduct[] = rawShopProducts.map((p) =>
  applyGbpPrices(p),
);

export const shopCategories = [
  { id: "all", label: "All" },
  { id: "print", label: "Prints" },
  { id: "apparel", label: "Apparel" },
  { id: "object", label: "Objects" },
] as const;

export function formatGBP(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

export function getProduct(idOrSlug: string) {
  return shopProducts.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

export const PRICE_ON_REQUEST = "Price on request";

/** Lowest mapped GBP price, or null when no variant has a price. */
export function startingPrice(product: ShopProduct): number | null {
  const prices = product.variants
    .map((v) => v.priceGBP)
    .filter((n): n is number => typeof n === "number");
  return prices.length ? Math.min(...prices) : null;
}

/** "from £65.00", or "Price on request" if nothing is priced. */
export function startingPriceLabel(product: ShopProduct): string {
  const n = startingPrice(product);
  return n === null ? PRICE_ON_REQUEST : `from ${formatGBP(n)}`;
}

export function variantPriceLabel(variant: ProductVariant): string {
  return variant.priceGBP === null ? PRICE_ON_REQUEST : formatGBP(variant.priceGBP);
}

export function isPurchasable(variant: ProductVariant): boolean {
  return typeof variant.priceGBP === "number" && variant.priceGBP > 0;
}

export function estimateShippingGBP(country: string) {
  // UK launch: delivery is absorbed into the retail price for a cleaner,
  // luxury checkout. International selling stays closed until each
  // provider/product shipping profile has been verified.
  if (country === "United Kingdom") return 0;
  throw new Error("International delivery is not enabled yet.");
}

export const editions = shopProducts.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.shortDescription,
  price: startingPriceLabel(p),
  category: p.category,
  gradient: p.gradient,
}));
