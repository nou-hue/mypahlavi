import { absoluteUrl } from "../lib/site-config.mjs";

/** Article + BreadcrumbList JSON-LD for an entry. Only emitted for published (indexable) pages. */
export function entryJsonLd(entry, path) {
  const url = absoluteUrl(path);
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.seoTitle ?? entry.title,
    description: entry.metaDescription ?? entry.standfirst,
    mainEntityOfPage: url,
    inLanguage: "en-GB",
    publisher: { "@type": "Organization", name: "MyPahlavi", url: absoluteUrl() },
    ...(entry.updated ? { dateModified: entry.updated } : {}),
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Archive", item: absoluteUrl("/archive") },
      { "@type": "ListItem", position: 2, name: "Entries", item: absoluteUrl("/archive/entries") },
      { "@type": "ListItem", position: 3, name: entry.title, item: url },
    ],
  };
  return [article, crumbs];
}
