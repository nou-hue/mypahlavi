import {
  listPrintifyProducts,
  listPrintifyShops,
  printifyConfigured,
  getPrintifyProduct,
  resolvePrintifyShopId,
} from "@/lib/printify/client";
import {
  shopProducts,
  type ProductCategory,
  type ShopProduct,
} from "@/data/shop";

function slugify(title: string, id: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${base || "edition"}-${id.slice(0, 8)}`;
}

/** "Abstract Night Sky … | distressed moon" → clean display name */
function cleanTitle(title: string) {
  const primary = title.split("|")[0]?.trim() || title;
  return primary.replace(/\s{2,}/g, " ").trim();
}

function guessCategory(title: string): ProductCategory {
  const t = title.toLowerCase();
  if (/tee|t-shirt|shirt|hoodie|apparel|sweat/.test(t)) return "apparel";
  if (/mug|tote|poster|print|canvas|frame|mat|pad/.test(t)) return "print";
  if (/object|pin|sticker|candle/.test(t)) return "object";
  return "print";
}

const gradients = [
  "from-[#2a241e] via-[#4a3e34] to-[#14110e]",
  "from-[#1e1a16] via-[#3c342c] to-[#100e0c]",
  "from-[#1a2218] via-[#2e3c2a] to-[#0c100c]",
  "from-[#161412] via-[#2e2824] to-[#0a0908]",
];

function centsToGbp(cents: number) {
  return Math.round(cents) / 100;
}

export function mapPrintifyProduct(p: {
  id: string;
  title: string;
  description?: string;
  variants: Array<{
    id: number;
    sku: string;
    title: string;
    price: number;
    is_enabled: boolean;
  }>;
  images: Array<{ src: string; is_default: boolean }>;
}): ShopProduct {
  const enabled = p.variants.filter((v) => v.is_enabled);
  const variants = (enabled.length ? enabled : p.variants).map((v) => ({
    id: String(v.id),
    label: v.title || `Variant ${v.id}`,
    priceGBP: centsToGbp(v.price),
    sku: v.sku || `PFY-${v.id}`,
    printifyVariantId: v.id,
  }));

  const image =
    p.images.find((i) => i.is_default)?.src ?? p.images[0]?.src ?? undefined;

  const plain = (p.description ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const name = cleanTitle(p.title);
  const subtitle = p.title.includes("|")
    ? p.title.split("|").slice(1).join("|").trim()
    : "";

  return {
    id: `pfy-${p.id}`,
    slug: slugify(name, p.id),
    name,
    shortDescription:
      subtitle.slice(0, 140) ||
      plain.slice(0, 140) ||
      "Print-on-demand edition from the archive shop.",
    description:
      plain.slice(0, 800) ||
      "Produced on demand through Printify and shipped from their production network.",
    category: guessCategory(p.title),
    gradient: gradients[p.id.charCodeAt(0) % gradients.length]!,
    accentLabel: "Edition",
    materials: "As specified on product",
    fulfilment: "Printify · print on demand",
    featured: true,
    imageSrc: image,
    printifyProductId: p.id,
    variants,
  };
}

export async function getLiveCatalog(): Promise<{
  source: "printify" | "editorial";
  connected: boolean;
  shopId: string | null;
  shopTitle: string | null;
  products: ShopProduct[];
  message: string;
  error?: string;
}> {
  if (!printifyConfigured()) {
    return {
      source: "editorial",
      connected: false,
      shopId: null,
      shopTitle: null,
      products: shopProducts,
      message:
        "Printify not connected — showing editorial catalogue.",
    };
  }

  try {
    const shops = await listPrintifyShops();
    const shopId = await resolvePrintifyShopId();
    const shop = shops.find((s) => String(s.id) === String(shopId));
    const catalog = await listPrintifyProducts(1, 50);
    const live = catalog.data
      .filter((p) => p.visible !== false)
      .map(mapPrintifyProduct)
      .filter((p) => p.variants.length > 0);

    if (live.length === 0) {
      return {
        source: "editorial",
        connected: true,
        shopId,
        shopTitle: shop?.title ?? null,
        products: shopProducts,
        message: `Printify connected (“${shop?.title ?? shopId}”), but no published products yet.`,
      };
    }

    return {
      source: "printify",
      connected: true,
      shopId,
      shopTitle: shop?.title ?? null,
      products: live,
      message: `Connected · ${live.length} product${live.length === 1 ? "" : "s"}`,
    };
  } catch (err) {
    return {
      source: "editorial",
      connected: false,
      shopId: process.env.PRINTIFY_SHOP_ID?.trim() ?? null,
      shopTitle: null,
      products: shopProducts,
      message: "Printify error — showing editorial catalogue",
      error: err instanceof Error ? err.message : "Printify error",
    };
  }
}

export async function resolveProductForCheckout(input: {
  productId: string;
  variantId: string;
}): Promise<ShopProduct | null> {
  if (input.productId.startsWith("pfy-")) {
    const printifyId = input.productId.slice(4);
    try {
      const p = await getPrintifyProduct(printifyId);
      return mapPrintifyProduct(p);
    } catch {
      return null;
    }
  }

  const catalog = await getLiveCatalog();
  return (
    catalog.products.find(
      (p) => p.id === input.productId || p.slug === input.productId,
    ) ??
    shopProducts.find(
      (p) => p.id === input.productId || p.slug === input.productId,
    ) ??
    null
  );
}
