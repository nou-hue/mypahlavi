/**
 * Best-effort, in-memory fixed-window rate limiter for API routes (server-only).
 *
 * Serverless instances do not share memory, so this is a first line of defence
 * only (it stops naive floods and accidental loops per warm instance). Put a
 * Vercel Firewall / WAF rate-limit rule or a shared store in front of the routes
 * that spend money or send email (see SECURITY-HARDENING.md).
 */
type Bucket = { count: number; resetAt: number };

const buckets: Map<string, Bucket> =
  ((globalThis as Record<string, unknown>).__rateLimitBuckets as Map<string, Bucket>) ??
  new Map<string, Bucket>();
(globalThis as Record<string, unknown>).__rateLimitBuckets = buckets;

const MAX_BUCKETS = 5000;

export function clientIp(request: Request): string {
  const h = request.headers;
  const vercel = h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;
  const real = h.get("x-real-ip")?.trim();
  if (real) return real;
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || "unknown";
}

export type RateLimitOptions = { limit: number; windowMs: number };

/**
 * Returns a 429 Response when the caller is over the limit, otherwise null.
 * `name` namespaces the bucket so each route keeps its own budget.
 */
export function rateLimit(
  request: Request,
  name: string,
  { limit, windowMs }: RateLimitOptions,
): Response | null {
  const now = Date.now();
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    if (buckets.size > MAX_BUCKETS) buckets.clear();
  }
  const key = `${name}:${clientIp(request)}`;
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  existing.count += 1;
  if (existing.count <= limit) return null;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return Response.json(
    { error: "Too many requests. Please try again shortly." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" },
    },
  );
}

/** Constant-time string comparison for bearer tokens / shared secrets. */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const { timingSafeEqual, createHash } = await import("node:crypto");
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb) && a.length === b.length;
}
