/**
 * Maintenance switch for the shop database cut-over.
 *
 * `SHOP_READ_ONLY=true` stops every shop/circle write path so the old database
 * can be copied without new rows arriving. Checkout returns 503 (nothing is
 * charged), the Stripe webhook returns 503 so Stripe retries it after the
 * window, and the order page still reads but does not confirm/fulfil.
 * Unset or any other value: no effect (the default).
 */
export function shopReadOnly(): boolean {
  if (typeof process === "undefined") return false;
  return process.env.SHOP_READ_ONLY?.trim().toLowerCase() === "true";
}

export function shopReadOnlyResponse(): Response {
  return Response.json(
    {
      error:
        "The shop is paused for a few minutes of maintenance. Nothing has been charged. Please try again shortly.",
    },
    { status: 503, headers: { "Retry-After": "900", "Cache-Control": "no-store" } },
  );
}
