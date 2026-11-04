import { gbpPricePence } from "@/data/gbp-prices";

type P = { slug: string; printifyProductId?: string | null };
type V = { id: string; label: string };

export type PricedLine =
  | { ok: true; unitPence: number }
  | { ok: false; reason: "price_on_request" };

/**
 * Server-side checkout price for one line, in pence. Derived only from the GBP
 * price map: ignores the client cart, the product object's `priceGBP`, and any
 * vendor (Printify) price. Unmapped => not purchasable.
 */
export function priceCheckoutLine(product: P, variant: V): PricedLine {
  const unitPence = gbpPricePence(product, variant);
  return unitPence === null
    ? { ok: false, reason: "price_on_request" }
    : { ok: true, unitPence };
}
