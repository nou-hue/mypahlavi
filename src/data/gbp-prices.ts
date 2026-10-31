/**
 * GBP price map — the single source of truth for every price shown or charged.
 *
 * Why this exists: Printify returns each variant's retail price as integer
 * minor units in the *Printify shop's* currency (USD in practice) with no
 * currency field. The shop used to read that number and render it as £, which
 * is how a hoodie showed £105.89. Printify prices are therefore NEVER used for
 * display or checkout. A variant is only purchasable if it has an entry here.
 *
 * Rules
 *  - Amounts are integer PENCE (GBP). No floats, no conversion.
 *  - Keyed by product key, then variant key (see productKey / variantKeyCandidates).
 *  - Unmapped product or variant => `priceGBP: null` => "Price on request",
 *    hidden from feeds, not addable to the bag, rejected by checkout.
 *  - The Stripe amount is re-derived from this map on the server at checkout.
 *
 * Product keys
 *  - Printify-sourced products:  `printify:<printify product id>` (stable even
 *    if the Printify title changes).
 *  - Editorial products:         the product slug.
 *
 * Prices approved by nou, 31 Oct 2026 01:31 UK (see
 * /workspace/fastcash/pricing-sheet.md). Prices only; rights checks and Printify
 * cost reads are separate steps.
 */

export type VariantPriceMap = Record<string, number>;

export const GBP_PRICE_MAP_PENCE: Record<string, VariantPriceMap> = {
  // ── Live Printify products ───────────────────────────────────────────────
  // Abstract Night Sky graphic Hoodie — £65 S–XL, £72 2XL–3XL (approved)
  "printify:6a78e64d335c253a4b030aa4": {
    s: 6500,
    m: 6500,
    l: 6500,
    xl: 6500,
    "2xl": 7200,
    "3xl": 7200,
  },
  // Mehr Persian Lion & Sun framed canvas, 30×40 in, all frame colours — £149 (approved)
  "printify:6a7aeeec78e78ae42d015e7b": {
    "30x40": 14900,
  },
  // Desk mat (6a78e60ac169c5412b01ecc1) and metallic mug (6a78dcf7e2315589c60c87e0)
  // are deliberately UNMAPPED: no GBP price has been approved for them, so they
  // show "Price on request" until nou sets one. Add them here to enable sale.

  // ── Editorial catalogue (src/data/shop.ts); original GBP prices ─────────
  "coronation-study-print": { a3: 4800, a2: 7200, a1: 11000 },
  "garden-laughter-print": { a3: 4800, a2: 7200 },
  "imperial-trio-print": { a3: 4600, a2: 6800 },
  "ivory-crest-tee": { s: 3600, m: 3600, l: 3600, xl: 3600, "2xl": 3800 },
  "charcoal-archive-hoodie": { s: 5800, m: 5800, l: 5800, xl: 5800 },
  "parchment-longsleeve": { s: 4200, m: 4200, l: 4200, xl: 4200 },
  "museum-tote-parchment": { one: 2800 },
  "archive-mug": { "11oz": 1800, "15oz": 2200 },

  // ── Approved wall-art ladders (products live on the V4 / archive branches;
  //    keys are the V4 slugs, or provisional slugs where V4 has none yet) ───
  // Tehran Grid No. 01 — A3 £42 / A2 £64 / A1 £92 (approved)
  "tehran-grid-no-01": { a3: 4200, a2: 6400, a1: 9200 },
  // Caspian Line No. 01 — A3 £42 / A2 £64 (approved)
  "caspian-line-no-01": { a3: 4200, a2: 6400 },
  // Kennedy welcome, 1962 — A3 £44 / A2 £66 (approved; provisional slug)
  "kennedy-welcome-1962-print": { a3: 4400, a2: 6600 },
  // Mohammad Reza Pahlavi, 1973 (#2) — A3 £46 / A2 £68 / A1 £105 (approved; provisional slug)
  "mohammad-reza-pahlavi-1973-print": { a3: 4600, a2: 6800, a1: 10500 },
  // Shahbanu of Iran — A3 £46 / A2 £68 / A1 £105 (approved; provisional slug)
  "shahbanu-of-iran-print": { a3: 4600, a2: 6800, a1: 10500 },
};

type PriceableProduct = {
  slug: string;
  printifyProductId?: string | null;
};
type PriceableVariant = {
  id: string;
  label: string;
};

export function productKey(product: PriceableProduct): string {
  return product.printifyProductId
    ? `printify:${product.printifyProductId}`
    : product.slug;
}

/**
 * Candidate variant keys derived from a variant's id and label, e.g.
 *  "a3" / "A3 (297 × 420 mm)"      -> a3
 *  "White / 2XL"                    -> 2xl
 *  `30" x 40" (Vertical) / Natural` -> 30x40
 */
export function variantKeyCandidates(variant: PriceableVariant): string[] {
  const out = new Set<string>();
  out.add(variant.id.trim().toLowerCase());
  const label = variant.label.toLowerCase();
  for (const token of label.split(/[\s/·,()]+/)) {
    const t = token.trim();
    if (t) out.add(t);
  }
  const dim = label.match(
    /(\d+(?:\.\d+)?)\s*["”″']?\s*[x×]\s*(\d+(?:\.\d+)?)/,
  );
  if (dim) out.add(`${dim[1]}x${dim[2]}`);
  const oz = label.match(/(\d+)\s*oz/);
  if (oz) out.add(`${oz[1]}oz`);
  return [...out];
}

/**
 * Price in pence for a variant, or null when the product or variant is not
 * mapped (or ambiguously mapped). Never falls back to a vendor price.
 */
export function gbpPricePence(
  product: PriceableProduct,
  variant: PriceableVariant,
  map: Record<string, VariantPriceMap> = GBP_PRICE_MAP_PENCE,
): number | null {
  const entry = map[productKey(product)];
  if (!entry) return null;
  const hits = new Set<string>();
  for (const key of variantKeyCandidates(variant)) {
    if (Object.prototype.hasOwnProperty.call(entry, key)) hits.add(key);
  }
  if (hits.size !== 1) return null; // unmapped or ambiguous -> price on request
  const pence = entry[[...hits][0]!]!;
  return Number.isInteger(pence) && pence > 0 ? pence : null;
}

/** Apply the map: sets `priceGBP` (pounds) + explicit `currency`, or null. */
export function applyGbpPrices<
  P extends PriceableProduct & {
    variants: Array<PriceableVariant & { priceGBP?: number | null }>;
  },
>(product: P): P & {
  variants: Array<
    P["variants"][number] & { priceGBP: number | null; currency: "GBP" }
  >;
} {
  return {
    ...product,
    variants: product.variants.map((v) => {
      const pence = gbpPricePence(product, v);
      return {
        ...v,
        currency: "GBP" as const,
        priceGBP: pence === null ? null : pence / 100,
      };
    }),
  };
}
