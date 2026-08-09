/**
 * Order persistence.
 * Prefer Postgres when DATABASE_URL works; otherwise process-memory + Stripe
 * session metadata snapshots (Vercel serverless cannot use PGLite files).
 */

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

type Snapshot = {
  id: string;
  email: string;
  status: string;
  subtotal_pence: number;
  shipping_pence: number;
  total_pence: number;
  shipping: ShippingRecord;
  lines: OrderLineRecord[];
  metadata?: Record<string, unknown>;
  stripe_session_id?: string | null;
  stripe_payment_intent?: string | null;
  printify_order_id?: string | null;
  error_message?: string | null;
  created_at?: string;
};

const globalRef = globalThis as typeof globalThis & {
  __mypahlaviOrderMem__?: Map<string, ShopOrderRecord>;
};

function mem(): Map<string, ShopOrderRecord> {
  globalRef.__mypahlaviOrderMem__ ??= new Map();
  return globalRef.__mypahlaviOrderMem__;
}

function nowIso() {
  return new Date().toISOString();
}

function rowFromSnapshot(s: Snapshot): ShopOrderRecord {
  const ts = s.created_at ?? nowIso();
  return {
    id: s.id,
    created_at: ts,
    updated_at: nowIso(),
    email: s.email,
    status: s.status,
    stripe_session_id: s.stripe_session_id ?? null,
    stripe_payment_intent: s.stripe_payment_intent ?? null,
    printify_order_id: s.printify_order_id ?? null,
    currency: "gbp",
    subtotal_pence: s.subtotal_pence,
    shipping_pence: s.shipping_pence,
    total_pence: s.total_pence,
    shipping_json: JSON.stringify(s.shipping),
    lines_json: JSON.stringify(s.lines),
    metadata_json: JSON.stringify(s.metadata ?? {}),
    error_message: s.error_message ?? null,
  };
}

function saveMem(row: ShopOrderRecord) {
  mem().set(row.id, row);
  if (row.stripe_session_id) {
    mem().set(`session:${row.stripe_session_id}`, row);
  }
}

async function dbAvailable(): Promise<boolean> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`select 1 as ok`;
    return true;
  } catch {
    return false;
  }
}

/** Stripe metadata-safe chunks (≤450 chars each). */
export function orderToStripeMetadata(row: ShopOrderRecord): Record<string, string> {
  const snap: Snapshot = {
    id: row.id,
    email: row.email,
    status: row.status,
    subtotal_pence: row.subtotal_pence,
    shipping_pence: row.shipping_pence,
    total_pence: row.total_pence,
    shipping: JSON.parse(row.shipping_json) as ShippingRecord,
    lines: JSON.parse(row.lines_json) as OrderLineRecord[],
    metadata: JSON.parse(row.metadata_json || "{}") as Record<string, unknown>,
    stripe_session_id: row.stripe_session_id,
    printify_order_id: row.printify_order_id,
    error_message: row.error_message,
    created_at: row.created_at,
  };
  // Drop heavy image URLs to keep under Stripe limits
  snap.lines = snap.lines.map((l) => ({
    ...l,
    imageSrc: l.imageSrc?.startsWith("http") ? undefined : l.imageSrc,
  }));
  const raw = JSON.stringify(snap);
  const meta: Record<string, string> = {
    orderId: row.id,
  };
  const chunk = 450;
  const parts = Math.ceil(raw.length / chunk);
  if (parts > 40) {
    // Fallback: minimal printify fulfilment payload only
    const minimal = {
      id: row.id,
      email: row.email,
      status: row.status,
      subtotal_pence: row.subtotal_pence,
      shipping_pence: row.shipping_pence,
      total_pence: row.total_pence,
      shipping: snap.shipping,
      lines: snap.lines.map((l) => ({
        key: l.key,
        productId: l.productId,
        slug: l.slug,
        name: l.name.slice(0, 80),
        variantId: l.variantId,
        variantLabel: l.variantLabel.slice(0, 60),
        unitPriceGBP: l.unitPriceGBP,
        quantity: l.quantity,
        sku: l.sku,
        printifyProductId: l.printifyProductId,
        printifyVariantId: l.printifyVariantId,
      })),
    };
    const mraw = JSON.stringify(minimal);
    for (let i = 0; i < Math.ceil(mraw.length / chunk); i++) {
      meta[`o${i}`] = mraw.slice(i * chunk, (i + 1) * chunk);
    }
    meta.parts = String(Math.ceil(mraw.length / chunk));
    return meta;
  }
  for (let i = 0; i < parts; i++) {
    meta[`o${i}`] = raw.slice(i * chunk, (i + 1) * chunk);
  }
  meta.parts = String(parts);
  return meta;
}

export function orderFromStripeMetadata(
  metadata: Record<string, string> | null | undefined,
): ShopOrderRecord | null {
  if (!metadata?.orderId && !metadata?.parts) return null;
  const parts = Number(metadata.parts || 0);
  if (!parts) return null;
  let raw = "";
  for (let i = 0; i < parts; i++) {
    raw += metadata[`o${i}`] ?? "";
  }
  if (!raw) return null;
  try {
    const snap = JSON.parse(raw) as Snapshot;
    const row = rowFromSnapshot(snap);
    saveMem(row);
    return row;
  } catch {
    return null;
  }
}

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
  const row = rowFromSnapshot({
    id: input.id,
    email: input.email,
    status: input.status,
    subtotal_pence: input.subtotalPence,
    shipping_pence: input.shippingPence,
    total_pence: input.totalPence,
    shipping: input.shipping,
    lines: input.lines,
    metadata: input.metadata,
    stripe_session_id: input.stripeSessionId ?? null,
  });
  saveMem(row);

  if (await dbAvailable()) {
    try {
      const { getSql } = await import("@/lib/db");
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
        on conflict (id) do nothing
      `;
    } catch (err) {
      console.warn("[orders] db insert failed, using memory/stripe", err);
    }
  }

  return row;
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
  let current = await getOrderById(id);
  if (!current) return null;

  const next: ShopOrderRecord = {
    ...current,
    status: patch.status ?? current.status,
    stripe_session_id:
      patch.stripe_session_id !== undefined
        ? patch.stripe_session_id
        : current.stripe_session_id,
    stripe_payment_intent:
      patch.stripe_payment_intent !== undefined
        ? patch.stripe_payment_intent
        : current.stripe_payment_intent,
    printify_order_id:
      patch.printify_order_id !== undefined
        ? patch.printify_order_id
        : current.printify_order_id,
    error_message:
      patch.error_message !== undefined
        ? patch.error_message
        : current.error_message,
    metadata_json: patch.metadata_json ?? current.metadata_json,
    updated_at: nowIso(),
  };
  saveMem(next);

  if (await dbAvailable()) {
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      await sql`
        update shop_orders set
          status = ${next.status},
          stripe_session_id = ${next.stripe_session_id},
          stripe_payment_intent = ${next.stripe_payment_intent},
          printify_order_id = ${next.printify_order_id},
          error_message = ${next.error_message},
          metadata_json = ${next.metadata_json},
          updated_at = CURRENT_TIMESTAMP
        where id = ${id}
      `;
    } catch (err) {
      console.warn("[orders] db update failed", err);
    }
  }

  return next;
}

export async function getOrderById(id: string) {
  const cached = mem().get(id);
  if (cached) return cached;

  if (await dbAvailable()) {
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      const rows = await sql<ShopOrderRecord>`
        select * from shop_orders where id = ${id} limit 1
      `;
      if (rows[0]) {
        saveMem(rows[0]);
        return rows[0];
      }
    } catch (err) {
      console.warn("[orders] db get failed", err);
    }
  }
  return null;
}

export async function getOrderByStripeSession(sessionId: string) {
  const cached = mem().get(`session:${sessionId}`);
  if (cached) return cached;

  if (await dbAvailable()) {
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      const rows = await sql<ShopOrderRecord>`
        select * from shop_orders where stripe_session_id = ${sessionId} limit 1
      `;
      if (rows[0]) {
        saveMem(rows[0]);
        return rows[0];
      }
    } catch (err) {
      console.warn("[orders] db get by session failed", err);
    }
  }
  return null;
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

export async function databaseStatus() {
  const url = Boolean(process.env.DATABASE_URL?.trim());
  if (!url) {
    return {
      configured: false,
      ok: false,
      mode: "memory+stripe" as const,
      message:
        "DATABASE_URL not set — orders use memory + Stripe metadata (works; add Neon for durable history)",
    };
  }
  try {
    const ok = await dbAvailable();
    return {
      configured: true,
      ok,
      mode: ok ? ("postgres" as const) : ("memory+stripe" as const),
      message: ok
        ? "Postgres connected"
        : "DATABASE_URL set but connection failed — using memory + Stripe",
    };
  } catch (err) {
    return {
      configured: true,
      ok: false,
      mode: "memory+stripe" as const,
      message: err instanceof Error ? err.message : "DB error",
    };
  }
}
