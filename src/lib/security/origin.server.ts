/**
 * Canonical public origin for redirect URLs (Stripe success/cancel, etc.).
 *
 * Never trust a raw Host / X-Forwarded-Host header for URLs we hand to a
 * third party: only hosts on the allow-list below are echoed back, everything
 * else falls back to the production origin.
 */
const PRODUCTION_ORIGIN = "https://www.mypahlavi.com";

const ALLOWED_HOST =
  /^(?:(?:www\.)?mypahlavi\.com|mypahlavi(?:-[a-z0-9-]+)?\.vercel\.app|localhost(?::\d+)?|127\.0\.0\.1(?::\d+)?)$/i;

export function canonicalOrigin(request: Request): string {
  const configured = process.env.BETTER_AUTH_URL?.trim() || process.env.SITE_URL?.trim();
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      /* fall through */
    }
  }
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(",")[0]
    .trim();
  if (host && ALLOWED_HOST.test(host)) {
    const local = /^(localhost|127\.0\.0\.1)/i.test(host);
    return `${local ? "http" : "https"}://${host}`;
  }
  return PRODUCTION_ORIGIN;
}
