import { getLiveCatalog } from "@/lib/shop/catalog.server";
import type { ShopProduct } from "@/data/shop";

const ORIGIN = "https://www.mypahlavi.com";

function csv(value: string | number) {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function plain(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function productType(category: string) {
  if (category === "apparel") return "MyPahlavi > Editions > Apparel";
  if (category === "print") return "MyPahlavi > Editions > Prints";
  return "MyPahlavi > Editions > Objects";
}

async function getMarketingCatalog(): Promise<ShopProduct[] | null> {
  const catalog = await getLiveCatalog();
  if (!catalog.connected || catalog.source !== "printify") return null;

  const products = catalog.products.filter(
    (product) =>
      Boolean(product.printifyProductId) &&
      Boolean(product.imageSrc) &&
      product.variants.length > 0,
  );

  return products.length > 0 ? products : null;
}

export async function buildPinterestFeed(): Promise<string | null> {
  const products = await getMarketingCatalog();
  if (!products) return null;

  const header = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "price",
    "availability",
    "brand",
    "item_group_id",
    "product_type",
    "condition",
  ].join(",");

  const rows = products.flatMap((product) =>
    product.variants.map((variant) => {
      const title =
        product.variants.length > 1
          ? `${product.name} — ${variant.label}`
          : product.name;
      return [
        `${product.id}-${variant.id}`,
        title,
        plain(product.description || product.shortDescription),
        `${ORIGIN}/editions/${encodeURIComponent(product.slug)}?utm_source=pinterest&utm_medium=organic_shopping&utm_campaign=archive_objects`,
        product.imageSrc ?? "",
        `${variant.priceGBP.toFixed(2)} GBP`,
        "in stock",
        "MyPahlavi",
        product.id,
        productType(product.category),
        "new",
      ]
        .map(csv)
        .join(",");
    }),
  );

  return [header, ...rows].join("\n") + "\n";
}

export async function buildGoogleFeed(): Promise<string | null> {
  const products = await getMarketingCatalog();
  if (!products) return null;

  const header = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "availability",
    "price",
    "condition",
    "brand",
    "item_group_id",
    "product_type",
  ].join("\t");

  const rows = products.flatMap((product) =>
    product.variants.map((variant) => {
      const title =
        product.variants.length > 1
          ? `${product.name} — ${variant.label}`
          : product.name;
      return [
        `${product.id}-${variant.id}`,
        title,
        plain(product.description || product.shortDescription),
        `${ORIGIN}/editions/${encodeURIComponent(product.slug)}?utm_source=google&utm_medium=organic_shopping&utm_campaign=archive_objects`,
        product.imageSrc ?? "",
        "in_stock",
        `${variant.priceGBP.toFixed(2)} GBP`,
        "new",
        "MyPahlavi",
        product.id,
        productType(product.category),
      ].join("\t");
    }),
  );

  return [header, ...rows].join("\n") + "\n";
}
