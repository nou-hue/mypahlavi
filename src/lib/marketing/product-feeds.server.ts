import { getLiveCatalog } from "@/lib/shop/catalog.server";

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

export async function buildPinterestFeed() {
  const catalog = await getLiveCatalog();
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
        `${ORIGIN}/editions/${encodeURIComponent(product.slug)}`,
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

export async function buildGoogleFeed() {
  const catalog = await getLiveCatalog();
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
        `${ORIGIN}/editions/${encodeURIComponent(product.slug)}`,
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
