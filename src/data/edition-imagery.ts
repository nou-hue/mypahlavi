/**
 * Editorial image overrides for Editions products.
 * Matched against Printify product id / title / slug.
 * Keeps product data, prices, and checkout IDs unchanged.
 */

export type EditionImageOverride = {
  /** Prefer matching Printify product id substring */
  productIdIncludes?: string[];
  /** Match against cleaned title or slug (lowercase) */
  titleIncludes?: string[];
  imageSrc: string;
  /** How the grid/detail plate should present the photo */
  plate: "fashion" | "object" | "interior";
};

export const editionImageOverrides: EditionImageOverride[] = [
  {
    titleIncludes: ["night sky", "hoodie", "abstract night"],
    productIdIncludes: ["6a78e64d335c253a4b030aa4"],
    imageSrc: "/editions/night-sky-hoodie.jpg",
    plate: "fashion",
  },
  {
    titleIncludes: ["horse", "desk mat", "mouse pad", "double-headed"],
    productIdIncludes: ["6a78e60ac169c5412b01ecc1"],
    imageSrc: "/editions/horse-desk-mat.jpg",
    plate: "object",
  },
  {
    titleIncludes: ["lion", "mehr", "sun canvas", "lion & sun", "lion and sun"],
    productIdIncludes: ["6a7aeeec78e78ae42d015e7b"],
    imageSrc: "/editions/lion-sun-canvas.jpg",
    plate: "interior",
  },
];

export function resolveEditionImage(input: {
  id?: string | null;
  printifyProductId?: string | null;
  name?: string;
  slug?: string;
  imageSrc?: string;
}): { imageSrc?: string; plate: "fashion" | "object" | "interior" | "default" } {
  const hay = [
    input.printifyProductId,
    input.id?.replace(/^pfy-/, ""),
    input.name,
    input.slug,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const o of editionImageOverrides) {
    const idHit = o.productIdIncludes?.some((p) => hay.includes(p.toLowerCase()));
    const titleHit = o.titleIncludes?.some((t) => hay.includes(t.toLowerCase()));
    if (idHit || titleHit) {
      return { imageSrc: o.imageSrc, plate: o.plate };
    }
  }
  return { imageSrc: input.imageSrc, plate: "default" };
}
