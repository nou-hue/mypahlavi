/** Circle patronage tiers — cultural patronage, not SaaS plans. */

export type CircleTierId = "reader" | "patron" | "benefactor";

export type CircleTier = {
  id: CircleTierId;
  name: string;
  /** Display price */
  priceLabel: string;
  amountPence: number;
  description: string;
  perks: string[];
  /** Honest labels for not-yet-built access */
  forthcoming?: string[];
};

export const circleTiers: CircleTier[] = [
  {
    id: "reader",
    name: "Patron",
    priceLabel: "£12 / month",
    amountPence: 1200,
    description: "Quiet support for digitisation and new essays.",
    perks: [
      "Circle newsletter",
      "Early library notes",
      "Name on the supporters list",
    ],
    forthcoming: ["Newsletter delivery"],
  },
  {
    id: "patron",
    name: "Collector",
    priceLabel: "£36 / month",
    amountPence: 3600,
    description: "Sustaining membership for the working archive.",
    perks: [
      "Everything in Patron",
      "Early Vault releases",
      "Higher-resolution gallery access",
      "Seasonal digital folio",
    ],
    forthcoming: ["Vault early access", "Hi-res gallery", "Digital folio"],
  },
  {
    id: "benefactor",
    name: "Founding Circle",
    priceLabel: "£120 / month",
    amountPence: 12000,
    description: "Major support for conservation-scale work and Editions.",
    perks: [
      "Everything in Collector",
      "Collector previews of Editions",
      "Private archival releases",
      "Annual physical publication (when issued)",
    ],
    forthcoming: ["Editions previews", "Private releases", "Physical publication"],
  },
];

export function getCircleTier(id: string) {
  return circleTiers.find((t) => t.id === id);
}

/** Env override for fixed Stripe Price IDs (optional). */
export function stripePriceEnvKey(tierId: CircleTierId): string {
  const map: Record<CircleTierId, string> = {
    reader: "STRIPE_PRICE_CIRCLE_PATRON",
    patron: "STRIPE_PRICE_CIRCLE_COLLECTOR",
    benefactor: "STRIPE_PRICE_CIRCLE_FOUNDING",
  };
  return map[tierId];
}
