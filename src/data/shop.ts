export type ProductCategory = "print" | "apparel" | "object";

export type ProductVariant = {
  id: string;
  label: string;
  priceGBP: number;
  sku: string;
  /** Printify variant id (number) once product is published in your shop */
  printifyVariantId?: number | null;
};

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
export const shopProducts: ShopProduct[] = [
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
      { id: "a3", label: "A3 (297 × 420 mm)", priceGBP: 48, sku: "PRINT-COR-A3" },
      { id: "a2", label: "A2 (420 × 594 mm)", priceGBP: 72, sku: "PRINT-COR-A2" },
      { id: "a1", label: "A1 (594 × 841 mm)", priceGBP: 110, sku: "PRINT-COR-A1" },
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
      { id: "a3", label: "A3", priceGBP: 48, sku: "PRINT-GAR-A3" },
      { id: "a2", label: "A2", priceGBP: 72, sku: "PRINT-GAR-A2" },
    ],
  },
  {
    id: "e-10",
    slug: "soraya-emerald-print",
    name: "Soraya in emerald",
    shortDescription: "Queen Soraya, formal portrait of the 1950s court.",
    description:
      "Studio presence of Queen Soraya Esfandiary-Bakhtiary. A carefully framed edition for collectors of the mid-century court.",
    category: "print",
    gradient: "from-[#1a2218] via-[#2e3c2a] to-[#0c100c]",
    accentLabel: "Print",
    materials: "Heavy matte · pigment inks",
    fulfilment: "Made to order",
    featured: true,
    imageSrc: "/archive/soraya-esfandiary/user-soraya-emerald-gown-tiara.jpg",
    printifyProductId: null,
    variants: [
      { id: "a3", label: "A3", priceGBP: 52, sku: "PRINT-SOR-A3" },
      { id: "a2", label: "A2", priceGBP: 78, sku: "PRINT-SOR-A2" },
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
      { id: "a3", label: "A3", priceGBP: 46, sku: "PRINT-TRI-A3" },
      { id: "a2", label: "A2", priceGBP: 68, sku: "PRINT-TRI-A2" },
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
      { id: "s", label: "S", priceGBP: 36, sku: "TEE-CR-S" },
      { id: "m", label: "M", priceGBP: 36, sku: "TEE-CR-M" },
      { id: "l", label: "L", priceGBP: 36, sku: "TEE-CR-L" },
      { id: "xl", label: "XL", priceGBP: 36, sku: "TEE-CR-XL" },
      { id: "2xl", label: "2XL", priceGBP: 38, sku: "TEE-CR-2XL" },
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
      { id: "s", label: "S", priceGBP: 58, sku: "HOOD-AR-S" },
      { id: "m", label: "M", priceGBP: 58, sku: "HOOD-AR-M" },
      { id: "l", label: "L", priceGBP: 58, sku: "HOOD-AR-L" },
      { id: "xl", label: "XL", priceGBP: 58, sku: "HOOD-AR-XL" },
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
      { id: "s", label: "S", priceGBP: 42, sku: "LS-PR-S" },
      { id: "m", label: "M", priceGBP: 42, sku: "LS-PR-M" },
      { id: "l", label: "L", priceGBP: 42, sku: "LS-PR-L" },
      { id: "xl", label: "XL", priceGBP: 42, sku: "LS-PR-XL" },
    ],
  },
  {
    id: "e-05",
    slug: "lineage-folio-cards",
    name: "Lineage folio",
    shortDescription: "Six sequenced cards with reverse captions.",
    description:
      "Six plates spanning early dynasty, coronation, family, and exile. Captions on the reverse.",
    category: "object",
    gradient: "from-[#2c2622] via-[#4c443c] to-[#161412]",
    accentLabel: "Object",
    materials: "Heavy postcard stock · set of 6",
    fulfilment: "Made to order",
    featured: true,
    imageSrc: "/archive/fawzia-fuad/princess-fawzia-fuad-of-egypt-by-armand.jpg",
    printifyProductId: null,
    variants: [
      { id: "set", label: "Set of 6", priceGBP: 24, sku: "CARD-LIN-6" },
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
      { id: "one", label: "One size", priceGBP: 28, sku: "TOTE-PAR-1" },
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
      { id: "11oz", label: "11 oz", priceGBP: 18, sku: "MUG-AR-11" },
      { id: "15oz", label: "15 oz", priceGBP: 22, sku: "MUG-AR-15" },
    ],
  },
];

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

export function startingPrice(product: ShopProduct) {
  return Math.min(...product.variants.map((v) => v.priceGBP));
}

export function estimateShippingGBP(country: string) {
  if (country === "United Kingdom") return 4.5;
  if (country === "European Union") return 8.5;
  if (country === "United States" || country === "Canada") return 12;
  if (country === "Australia") return 14;
  return 16;
}

export const editions = shopProducts.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.shortDescription,
  price: `from ${formatGBP(startingPrice(p))}`,
  category: p.category,
  gradient: p.gradient,
}));
