/**
 * Stripe server client.
 *
 * Env:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   VITE_STRIPE_PUBLISHABLE_KEY (optional client)
 */

import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key);
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
