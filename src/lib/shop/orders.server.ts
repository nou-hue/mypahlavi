import { getSql } from "@/lib/db";

export type OrderLineRecord = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  variantId: string;
  variantLabel: string;
  unitPriceGBP: number;
  quantity: number;
  sku: string;
  gradient?: string;
  imageSrc?: string;
  printifyProductId?: string | null;
  printifyVariantId?: number | null;
};

export type ShippingRecord = {
  email: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
  phone?: string;
  notes?: string;
};

export type ShopOrderRecord = {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  status: string;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  printify_order_id: string | null;
  currency: string;
  subtotal_pence: number;
  shipping_pence: number;
  total_pence: number;
  shipping_json: string;
  lines_json: string;
  metadata_json: string;
  error_message: string | null;
};

export async function insertOrder(input: {
  id: string;
  email: string;
  status: string;
  stripeSessionId?: string | null;
  subtotalPence: number;
  shippingPence: number;
  totalPence: number;
  shipping: ShippingRecord;
  lines: OrderLineRecord[];
  metadata?: Record<string, unknown>;
}) {
  const sql = await getSql();
  await sql`
    insert into shop_orders (
      id, email, status, stripe_session_id,
      subtotal_pence, shipping_pence, total_pence,
      shipping_json, lines_json, metadata_json
    ) values (
      ${input.id},
      ${input.email},
      ${input.status},
      ${input.stripeSessionId ?? null},
      ${input.subtotalPence},
      ${input.shippingPence},
      ${input.totalPence},
      ${JSON.stringify(input.shipping)},
      ${JSON.stringify(input.lines)},
      ${JSON.stringify(input.metadata ?? {})}
    )
  `;
}

export async function updateOrder(
  id: string,
  patch: Partial<{
    status: string;
    stripe_session_id: string | null;
    stripe_payment_intent: string | null;
    printify_order_id: string | null;
    error_message: string | null;
    metadata_json: string;
  }>,
) {
  const sql = await getSql();
  const current = await getOrderById(id);
  if (!current) return null;

  const status = patch.status ?? current.status;
  const stripe_session_id =
    patch.stripe_session_id !== undefined
      ? patch.stripe_session_id
      : current.stripe_session_id;
  const stripe_payment_intent =
    patch.stripe_payment_intent !== undefined
      ? patch.stripe_payment_intent
      : current.stripe_payment_intent;
  const printify_order_id =
    patch.printify_order_id !== undefined
      ? patch.printify_order_id
      : current.printify_order_id;
  const error_message =
    patch.error_message !== undefined ? patch.error_message : current.error_message;
  const metadata_json = patch.metadata_json ?? current.metadata_json;

  await sql`
    update shop_orders set
      status = ${status},
      stripe_session_id = ${stripe_session_id},
      stripe_payment_intent = ${stripe_payment_intent},
      printify_order_id = ${printify_order_id},
      error_message = ${error_message},
      metadata_json = ${metadata_json},
      updated_at = CURRENT_TIMESTAMP
    where id = ${id}
  `;
  return getOrderById(id);
}

export async function getOrderById(id: string) {
  const sql = await getSql();
  const rows = await sql<ShopOrderRecord>`
    select * from shop_orders where id = ${id} limit 1
  `;
  return rows[0] ?? null;
}

export async function getOrderByStripeSession(sessionId: string) {
  const sql = await getSql();
  const rows = await sql<ShopOrderRecord>`
    select * from shop_orders where stripe_session_id = ${sessionId} limit 1
  `;
  return rows[0] ?? null;
}

export function parseOrder(row: ShopOrderRecord) {
  return {
    id: row.id,
    createdAt: row.created_at,
    email: row.email,
    status: row.status,
    stripeSessionId: row.stripe_session_id,
    printifyOrderId: row.printify_order_id,
    currency: row.currency,
    subtotal: row.subtotal_pence / 100,
    shippingCost: row.shipping_pence / 100,
    total: row.total_pence / 100,
    shipping: JSON.parse(row.shipping_json) as ShippingRecord,
    lines: JSON.parse(row.lines_json) as OrderLineRecord[],
    error: row.error_message,
  };
}
