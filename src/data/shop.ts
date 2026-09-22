export type ProductCategory = "print" | "apparel" | "object";

export type ProductVariant = {
  id: string;
  label: string;
  priceGBP: number;
  sku: string;
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
  imageSrc?: string;
  printifyProductId?: string | null;
};

/**
 * V4 editorial catalogue.
 * These are the art direction and product masters. A concept becomes purchasable
 * only after its matching Printify product and variant ids have been connected.
 */
export const shopProducts: ShopProduct[] = [
  {
    id: "v4-01",
    slug: "tehran-grid-no-01",
    name: "Tehran Grid No. 01",
    shortDescription: "Original modernist city study with a wide archival margin.",
    description:
      "An original MyPahlavi composition built from abstract street grids, intersecting movement and restrained Persian-modernist colour. Designed first as a print rather than adapted from merchandise art.",
    category: "print",
    gradient: "from-[#fffefa] via-[#efefeb] to-[#d8d8d3]",
    accentLabel: "Archive Print",
    materials: "Heavy matte art paper · pigment print · uncoated finish",
    fulfilment: "Studio study · production mapping in progress",
    featured: true,
    imageSrc: "/editions/tehran-grid-01.svg",
    printifyProductId: null,
    variants: [
      { id: "a3", label: "A3 · 297 × 420 mm", priceGBP: 42, sku: "MP-TG01-A3" },
      { id: "a2", label: "A2 · 420 × 594 mm", priceGBP: 64, sku: "MP-TG01-A2" },
      { id: "a1", label: "A1 · 594 × 841 mm", priceGBP: 92, sku: "MP-TG01-A1" },
    ],
  },
  {
    id: "v4-02",
    slug: "caspian-line-no-01",
    name: "Caspian Line No. 01",
    shortDescription: "An original northbound travel study: coast, horizon, movement.",
    description:
      "A graphic edition developed from the visual language of mid-century travel material without copying a historical poster. Mountain line, sea band and route geometry form a new image of northern Iran.",
    category: "print",
    gradient: "from-[#fffefa] via-[#edf2f1] to-[#dfe7e6]",
    accentLabel: "Archive Print",
    materials: "Heavy matte art paper · pigment print · wide white border",
    fulfilment: "Studio study · production mapping in progress",
    featured: true,
    imageSrc: "/editions/caspian-line-01.svg",
    printifyProductId: null,
    variants: [
      { id: "a3", label: "A3 · 297 × 420 mm", priceGBP: 42, sku: "MP-CL01-A3" },
      { id: "a2", label: "A2 · 420 × 594 mm", priceGBP: 64, sku: "MP-CL01-A2" },
    ],
  },
  {
    id: "v4-03",
    slug: "garden-plan-no-01",
    name: "Garden Plan No. 01",
    shortDescription: "Axial garden geometry translated into an original graphic study.",
    description:
      "A new composition based on the ordering principles of Persian gardens: axis, water, enclosure and planted quadrants. It references a design logic rather than reproducing a historical motif.",
    category: "print",
    gradient: "from-[#fffefa] via-[#f0f0ec] to-[#e3e3df]",
    accentLabel: "Archive Print",
    materials: "Heavy matte art paper · pigment print · wide white border",
    fulfilment: "Studio study · production mapping in progress",
    imageSrc: "/editions/garden-plan-01.svg",
    printifyProductId: null,
    variants: [
      { id: "a3", label: "A3 · 297 × 420 mm", priceGBP: 42, sku: "MP-GP01-A3" },
      { id: "a2", label: "A2 · 420 × 594 mm", priceGBP: 64, sku: "MP-GP01-A2" },
    ],
  },
  {
    id: "v4-04",
    slug: "tehran-desk-study-no-01",
    name: "Tehran Desk Study No. 01",
    shortDescription: "Panoramic original artwork made specifically for the working desk.",
    description:
      "A purpose-built panoramic composition rather than a poster stretched across a product. The wide format uses route lines, civic-grid rhythm and a restrained red mark to create a functional desk object.",
    category: "object",
    gradient: "from-[#111214] via-[#222427] to-[#111214]",
    accentLabel: "Desk Object",
    materials: "Full-surface dye sublimation · non-slip rubber backing",
    fulfilment: "Studio study · production mapping in progress",
    featured: true,
    imageSrc: "/editions/tehran-desk-01.svg",
    printifyProductId: null,
    variants: [
      { id: "large", label: "31.5 × 15.5 in", priceGBP: 46, sku: "MP-TD01-L" },
    ],
  },
  {
    id: "v4-05",
    slug: "garden-plan-notebook",
    name: "Garden Plan Notebook",
    shortDescription: "A5 matte notebook with the Garden Plan study carried as a full cover.",
    description:
      "A paper object for reading rooms and research desks. The artwork is scaled for the cover format rather than treated as a small logo.",
    category: "object",
    gradient: "from-[#fffefa] via-[#efefeb] to-[#e5e5e5]",
    accentLabel: "Paper Object",
    materials: "A5 matte laminated cover · lined interior",
    fulfilment: "Studio study · UK production mapping in progress",
    imageSrc: "/editions/garden-plan-01.svg",
    printifyProductId: null,
    variants: [
      { id: "a5", label: "A5", priceGBP: 24, sku: "MP-GPN-A5" },
    ],
  },
];

export const shopCategories = [
  { id: "all", label: "All" },
  { id: "print", label: "Prints" },
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
  if (country === "United Kingdom") return 0;
  throw new Error("International delivery is not enabled yet.");
}

export const editions = shopProducts.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.shortDescription,
  price: `from ${formatGBP(startingPrice(p))}`,
  category: p.category,
  gradient: p.gradient,
}));
