import { safeEqual } from "./rate-limit.server";

/**
 * Operator-only endpoints (integration diagnostics) require
 * `Authorization: Bearer <ADMIN_API_TOKEN>`. When ADMIN_API_TOKEN is unset the
 * endpoints are closed to everyone (fail closed).
 */
export async function isAdminRequest(request: Request): Promise<boolean> {
  const expected = process.env.ADMIN_API_TOKEN?.trim();
  if (!expected || expected.length < 24) return false;
  const header = request.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(header);
  if (!m) return false;
  return safeEqual(m[1].trim(), expected);
}
