/**
 * Printify REST client (server-only).
 * Docs: https://developers.printify.com/
 *
 * Env:
 *   PRINTIFY_API_TOKEN  — Personal access token from Printify → Connections
 *   PRINTIFY_SHOP_ID    — Optional if the account has exactly one shop
 */

const PRINTIFY_BASE = "https://api.printify.com/v1";

export type PrintifyShop = {
  id: number;
  title: string;
  sales_channel: string;
};

export type PrintifyLineItemInput = {
  product_id: string;
  variant_id: number;
  quantity: number;
};

export type PrintifyAddress = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country: string;
  region?: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
};

/** True when an API token is present (shop id can auto-resolve). */
export function printifyConfigured() {
  return Boolean(process.env.PRINTIFY_API_TOKEN?.trim());
}

let cachedShopId: string | null = null;

async function printifyFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = process.env.PRINTIFY_API_TOKEN?.trim();
  if (!token) throw new Error("PRINTIFY_API_TOKEN is not set");

  const res = await fetch(`${PRINTIFY_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Printify ${res.status}: ${body.slice(0, 400)}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function listPrintifyShops() {
  return printifyFetch<PrintifyShop[]>("/shops.json");
}

/**
 * Resolve shop id: env PRINTIFY_SHOP_ID, else sole shop on the account,
 * else shop titled mypahlavi / matching domain.
 */
export async function resolvePrintifyShopId(): Promise<string> {
  if (cachedShopId) return cachedShopId;

  const fromEnv = process.env.PRINTIFY_SHOP_ID?.trim();
  if (fromEnv) {
    cachedShopId = fromEnv;
    return fromEnv;
  }

  const shops = await listPrintifyShops();
  if (shops.length === 0) {
    throw new Error("No Printify shops on this account");
  }

  if (shops.length === 1) {
    cachedShopId = String(shops[0]!.id);
    return cachedShopId;
  }

  const named =
    shops.find((s) => /mypahlavi/i.test(s.title)) ??
    shops.find((s) => /pahlavi/i.test(s.title));
  if (named) {
    cachedShopId = String(named.id);
    return cachedShopId;
  }

  throw new Error(
    `Multiple Printify shops — set PRINTIFY_SHOP_ID. Options: ${shops
      .map((s) => `${s.id} (${s.title})`)
      .join(", ")}`,
  );
}

/** Sync helper — prefer resolvePrintifyShopId() for auto-detect. */
export function getPrintifyShopId() {
  const id = process.env.PRINTIFY_SHOP_ID?.trim() || cachedShopId;
  if (!id) {
    throw new Error(
      "PRINTIFY_SHOP_ID not set and shop not resolved yet — call resolvePrintifyShopId()",
    );
  }
  return id;
}

export async function listPrintifyProducts(page = 1, limit = 50) {
  const shopId = await resolvePrintifyShopId();
  return printifyFetch<{
    current_page: number;
    data: Array<{
      id: string;
      title: string;
      description: string;
      visible: boolean;
      blueprint_id: number;
      variants: Array<{
        id: number;
        sku: string;
        title: string;
        price: number;
        is_enabled: boolean;
      }>;
      images: Array<{ src: string; is_default: boolean }>;
    }>;
  }>(`/shops/${shopId}/products.json?page=${page}&limit=${limit}`);
}

export async function getPrintifyProduct(productId: string) {
  const shopId = await resolvePrintifyShopId();
  return printifyFetch<{
    id: string;
    title: string;
    description?: string;
    variants: Array<{
      id: number;
      sku: string;
      title: string;
      price: number;
      is_enabled: boolean;
    }>;
    images: Array<{ src: string; is_default: boolean }>;
  }>(`/shops/${shopId}/products/${productId}.json`);
}

/** Create a Printify order (not yet sent to production until submitted). */
export async function createPrintifyOrder(input: {
  externalId: string;
  label?: string;
  lineItems: PrintifyLineItemInput[];
  shippingMethod?: number;
  addressTo: PrintifyAddress;
  sendToProduction?: boolean;
}) {
  const shopId = await resolvePrintifyShopId();
  const body = {
    external_id: input.externalId,
    label: input.label ?? input.externalId,
    line_items: input.lineItems.map((li) => ({
      product_id: li.product_id,
      variant_id: li.variant_id,
      quantity: li.quantity,
    })),
    shipping_method: input.shippingMethod ?? 1,
    send_shipping_notification: true,
    address_to: input.addressTo,
  };

  const order = await printifyFetch<{
    id: string;
    status: string;
    external_id: string;
  }>(`/shops/${shopId}/orders.json`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (input.sendToProduction !== false) {
    try {
      await printifyFetch(`/shops/${shopId}/orders/${order.id}/send_to_production.json`, {
        method: "POST",
      });
    } catch (err) {
      console.warn("[printify] send_to_production failed", err);
    }
  }

  return order;
}

export function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0] || "Customer", last: "—" };
  return { first: parts[0]!, last: parts.slice(1).join(" ") };
}

/** Map UI country labels to ISO-ish codes Printify expects. */
export function countryToCode(country: string): string {
  const map: Record<string, string> = {
    "United Kingdom": "GB",
    "United States": "US",
    Canada: "CA",
    Australia: "AU",
    "European Union": "DE",
    "Rest of world": "GB",
  };
  return map[country] ?? (country.length === 2 ? country.toUpperCase() : "GB");
}
