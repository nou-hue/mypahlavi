/**
 * Stripe server client.
 *
 * Env:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   VITE_STRIPE_PUBLISHABLE_KEY (optional client)
 */

import { createRequire } from "node:module";

type StripeCtor = typeof import("stripe").default;
type StripeClient = InstanceType<StripeCtor>;

let Stripe: StripeCtor | null = null;
let stripeSingleton: StripeClient | null = null;

function loadStripe(): StripeCtor {
  if (Stripe) return Stripe;
  try {
    // Prefer static-resolution path when Vite/Node can resolve ESM
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const req = createRequire(import.meta.url);
    // stripe CJS entry
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = req("stripe") as any;
    Stripe = (mod.default ?? mod) as StripeCtor;
    return Stripe;
  } catch (err) {
    throw new Error(
      `Stripe module unavailable: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!stripeSingleton) {
    const S = loadStripe();
    stripeSingleton = new S(key);
  }
  return stripeSingleton;
}

export function getWebhookSecret() {
  const s = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!s) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return s;
}

export function poundsToPence(amount: number) {
  return Math.round(amount * 100);
}

export function penceToPounds(pence: number) {
  return pence / 100;
}
