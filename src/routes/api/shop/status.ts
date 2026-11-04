import { createFileRoute } from "@tanstack/react-router";
import {
  listPrintifyShops,
  printifyConfigured,
  resolvePrintifyShopId,
} from "@/lib/printify/client";
import { databaseStatus } from "@/lib/shop/orders.server";
import { stripeConfigured } from "@/lib/stripe/client";
import { isAdminRequest } from "@/lib/security/admin.server";
import { rateLimit } from "@/lib/security/rate-limit.server";

type ShopStatus = Record<string, unknown> & { ready: boolean };

const STATUS_TTL_MS = 60_000;
let cached: { at: number; value: ShopStatus } | null = null;

/** Full vendor/mode detail. Admin-only; never return this to anonymous callers. */
async function computeStatus(): Promise<ShopStatus> {
  const stripe = stripeConfigured();
  const stripeWebhook = Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
  const hasToken = Boolean(process.env.PRINTIFY_API_TOKEN?.trim());
  const hasShopIdEnv = Boolean(process.env.PRINTIFY_SHOP_ID?.trim());
  const db = await databaseStatus();

  let printify = false;
  let shopId: string | null = process.env.PRINTIFY_SHOP_ID?.trim() ?? null;
  let shopTitle: string | null = null;
  let shops: Array<{ id: number; title: string }> = [];
  let printifyError: string | null = null;
  let autoSelected = false;

  if (hasToken) {
    try {
      const list = await listPrintifyShops();
      shops = list.map((s) => ({ id: s.id, title: s.title }));
      const resolved = await resolvePrintifyShopId();
      shopId = resolved;
      const match = list.find((s) => String(s.id) === resolved);
      if (match) {
        printify = true;
        shopTitle = match.title;
        autoSelected = !hasShopIdEnv;
      }
    } catch (err) {
      printifyError =
        err instanceof Error
          ? err.message
          : "Could not reach Printify — check the API token";
    }
  } else if (hasShopIdEnv) {
    printifyError =
      "PRINTIFY_SHOP_ID is set, but PRINTIFY_API_TOKEN is missing";
  }

  const message = stripe
    ? printify
      ? `Stripe + Printify connected (“${shopTitle ?? shopId}”)`
      : printifyError ??
        "Stripe connected — add PRINTIFY_API_TOKEN on Vercel, then redeploy"
    : printify
      ? "Printify connected — add STRIPE_SECRET_KEY for card checkout"
      : printifyError ?? "Add Stripe + Printify keys on Vercel, then Redeploy";

  const result: ShopStatus = {
    stripe,
    printify,
    printifyConfigured: printifyConfigured(),
    hasToken,
    hasShopId: Boolean(shopId),
    hasShopIdEnv,
    shopId,
    shopTitle,
    shops,
    autoSelected,
    printifyError,
    database: db,
    stripeWebhook,
    ready: Boolean(stripe && stripeWebhook && printify && db.ok),
    mode:
      stripe && stripeWebhook && printify && db.ok
        ? "live_checkout"
        : "demo",
    message,
  };
  return result;
}

async function getStatus(): Promise<ShopStatus> {
  if (cached && Date.now() - cached.at < STATUS_TTL_MS) return cached.value;
  const value = await computeStatus();
  cached = { at: Date.now(), value };
  return value;
}

const NO_STORE = { "Cache-Control": "no-store" } as const;

export const Route = createFileRoute("/api/shop/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const limited = rateLimit(request, "shop-status", { limit: 60, windowMs: 60_000 });
        if (limited) return limited;
        const admin = await isAdminRequest(request);
        const status = await getStatus();
        if (admin) {
          return Response.json(status, { headers: NO_STORE });
        }
        // Public: readiness only. No vendor, mode, shop, host or key details.
        return Response.json({ ok: status.ready }, { headers: NO_STORE });
      },
    },
  },
});
