/**
 * Single source of truth for the site's public origin.
 *
 * Canonical host today: www.mypahlavi.com (the apex 308-redirects to www).
 * A move to the apex is pending a decision; when it is made, change this one
 * constant and every canonical link, og:url, sitemap entry and feed follows.
 * Never write the host as a literal anywhere else.
 */
export const SITE_URL = "https://www.mypahlavi.com";

/** Absolute URL on the canonical host. `path` must start with "/" (or be empty). */
export function absoluteUrl(path = "") {
  if (path && !path.startsWith("/")) throw new Error(`absoluteUrl: path must start with "/", got "${path}"`);
  return `${SITE_URL}${path === "/" ? "" : path}`;
}
