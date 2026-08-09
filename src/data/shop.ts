export type ProductCategory = "print" | "apparel" | "object";

export type ProductVariant = {
  id: string;
  label: string;
  priceGBP: number;
  sku: string;
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
};

export const shopProducts: ShopProduct[] = [
  {
    id: "e-01",
    slug: "coronation-study-print",
    name: "Coronation study — archival print",
    shortDescription: "Ceremonial plate on museum-weight matte paper.",
    description:
      "A large-format archival print drawn from a curated ceremonial composition. Quiet margins, soft charcoal grading, and a caption strip on the reverse. Produced on demand via Printify and packed as a limited archive edition.",
    category: "print",
    gradient: "from-[#2a241e] via-[#4a3e34] to-[#14110e]",
    accentLabel: "Print",
    materials: "Museum-weight matte paper · archival pigment inks",
    fulfilment: "Printify · ships flat or in protective tube",
    featured: true,
    variants: [
      { id: "a3", label: 'A3 (297 × 420 mm)', priceGBP: 48, sku: "PRINT-COR-A3" },
      { id: "a2", label: 'A2 (420 × 594 mm)', priceGBP: 72, sku: "PRINT-COR-A2" },
      { id: "a1", label: 'A1 (594 × 841 mm)', priceGBP: 110, sku: "PRINT-COR-A1" },
    ],
  },
  {
    id: "e-02",
    slug: "niavaran-light-print",
    name: "Niavaran light — fine art paper",
    shortDescription: "Soft-toned family-era study with generous margins.",
    description:
      "A quieter domestic register from the palace years. Printed on fine-art paper with restrained contrast so the image remains contemplative rather than commercial.",
    category: "print",
    gradient: "from-[#1e1a16] via-[#3c342c] to-[#100e0c]",
    accentLabel: "Print",
    materials: "Fine art paper · giclée-style pigment print",
    fulfilment: "Printify · archival sleeve packaging",
    featured: true,
    variants: [
      { id: "a3", label: "A3", priceGBP: 42, sku: "PRINT-NIA-A3" },
      { id: "a2", label: "A2", priceGBP: 64, sku: "PRINT-NIA-A2" },
    ],
  },
  {
    id: "e-07",
    slug: "exile-horizon-print",
    name: "Exile horizon — tonal print",
    shortDescription: "Post-1979 continuity plate for the exile room.",
    description:
      "A contemplative plate for the exile sequence. Designed for wall study rather than spectacle — deep field, minimal typography on the certificate insert.",
    category: "print",
    gradient: "from-[#161412] via-[#2e2824] to-[#0a0908]",
    accentLabel: "Print",
    materials: "Heavy matte stock · pigment inks",
    fulfilment: "Printify",
    variants: [
      { id: "a3", label: "A3", priceGBP: 46, sku: "PRINT-EX-A3" },
      { id: "a2", label: "A2", priceGBP: 68, sku: "PRINT-EX-A2" },
    ],
  },
  {
    id: "e-03",
    slug: "ivory-crest-tee",
    name: "Ivory crest tee",
    shortDescription: "Heavyweight cotton with restrained monochrome crest.",
    description:
      "An object-first garment: heavyweight cotton, soft hand, single crest mark in charcoal. Sized for everyday wear without sportswear noise.",
    category: "apparel",
    gradient: "from-[#3a342c] via-[#5a5046] to-[#1c1814]",
    accentLabel: "Apparel",
    materials: "100% heavyweight cotton · DTG print",
    fulfilment: "Printify · UK / EU production where available",
    featured: true,
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
    name: "Charcoal archive hoodie",
    shortDescription: "Minimal wordmark hoodie in deep charcoal.",
    description:
      "Soft midweight hoodie with a single typographic archive mark. Palette locked to the site’s charcoal and ivory system.",
    category: "apparel",
    gradient: "from-[#24201c] via-[#3e3832] to-[#12100e]",
    accentLabel: "Apparel",
    materials: "Cotton-blend fleece · DTG",
    fulfilment: "Printify",
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
    shortDescription: "Warm ivory long sleeve with micro crest at cuff.",
    description:
      "Quiet daily layer. Cream ground, micro crest detail, no chest shout. Meant to sit beside the reading room rather than a street stall.",
    category: "apparel",
    gradient: "from-[#4a443c] via-[#6b6358] to-[#2a2622]",
    accentLabel: "Apparel",
    materials: "Cotton long sleeve · soft print",
    fulfilment: "Printify",
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
    name: "Lineage folio postcard set",
    shortDescription: "Six sequenced cards with reverse captions.",
    description:
      "A portable folio of six plates spanning early dynasty, coronation, family, and exile. Captions on the reverse keep each card archival rather than decorative-only.",
    category: "object",
    gradient: "from-[#2c2622] via-[#4c443c] to-[#161412]",
    accentLabel: "Object",
    materials: "Heavy postcard stock · boxed set of 6",
    fulfilment: "Printify",
    featured: true,
    variants: [
      { id: "set", label: "Set of 6", priceGBP: 24, sku: "CARD-LIN-6" },
    ],
  },
  {
    id: "e-06",
    slug: "museum-tote-parchment",
    name: "Museum tote — parchment",
    shortDescription: "Natural canvas tote with single typographic mark.",
    description:
      "Built for books from the reading room. Natural canvas, one mark, reinforced handles. No lifestyle photography clutter — object on ivory ground.",
    category: "object",
    gradient: "from-[#38322c] via-[#564c42] to-[#1a1612]",
    accentLabel: "Object",
    materials: "Natural canvas · durable print",
    fulfilment: "Printify",
    variants: [
      { id: "one", label: "One size", priceGBP: 28, sku: "TOTE-PAR-1" },
    ],
  },
  {
    id: "e-09",
    slug: "archive-mug",
    name: "Archive mug — ivory rim",
    shortDescription: "Ceramic mug with micro wordmark.",
    description:
      "A daily object for the desk beside open letters. Ivory ceramic, charcoal micro mark, no loud wrap graphics.",
    category: "object",
    gradient: "from-[#3a342e] via-[#5a5046] to-[#1c1814]",
    accentLabel: "Object",
    materials: "Ceramic · dishwasher-safe print",
    fulfilment: "Printify",
    variants: [
      { id: "11oz", label: "11 oz", priceGBP: 18, sku: "MUG-AR-11" },
      { id: "15oz", label: "15 oz", priceGBP: 22, sku: "MUG-AR-15" },
    ],
  },
];

export const shopCategories = [
  { id: "all", label: "All editions" },
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

// Backward-compatible shape used by older home/data imports
export const editions = shopProducts.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.shortDescription,
  price: `from ${formatGBP(startingPrice(p))}`,
  category: p.category,
  gradient: p.gradient,
}));
