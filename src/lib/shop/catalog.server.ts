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

function cleanTitle(title: string) {
  const primary = title.split("|")[0]?.trim() || title;
  return primary.replace(/\s{2,}/g, " ").trim();
}

function guessCategory(title: string): ProductCategory {
  const t = title.toLowerCase();
  if (/tee|t-shirt|shirt|hoodie|apparel|sweat|long.?sleeve|crewneck/.test(t))
    return "apparel";
  if (
    /mug|tote|card|folio|pin|sticker|candle|desk.?mat|mouse.?pad|object/.test(t)
  )
    return "object";
  if (
    /\bposter\b|giclée|giclee|canvas (print|wall)|wall art|fine art|art print|museum print/.test(
      t,
    )
  )
    return "print";
  if (/\bprint\b/.test(t) && !/imprint|fingerprint|blueprint/.test(t))
    return "print";
  return "object";
}

/** Wall-art prints only are withheld. Apparel and objects remain. */
export function isShopVisible(p: ShopProduct): boolean {
  if (p.category === "print") return false;
  const t = `${p.name} ${p.shortDescription} ${p.description} ${p.accentLabel}`.toLowerCase();
  if (
    /wall art|art print|museum print|giclée|giclee|fine art paper|canvas wall|poster print|coronation study|northern light print|state portrait print/.test(
      t,
    )
  ) {
    return false;
  }
  return true;
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
  const category = guessCategory(p.title);

  const accent =
    category === "apparel"
      ? "Apparel"
      : category === "object"
        ? "Object"
        : "Edition";

  const slug = slugify(name, p.id);

  // Prefer short editorial copy over long marketplace descriptions
  let short =
    subtitle.slice(0, 140) ||
    plain.slice(0, 140) ||
    "Limited edition from the archive.";
  if (category === "apparel" && /hoodie/i.test(name)) {
    short = "Midweight hoodie · restrained monochrome graphic · made to order.";
  } else if (/desk mat|mouse pad/i.test(name)) {
    short = "Premium desk mat · archival illustration · physical object.";
  } else if (/canvas|lion/i.test(name)) {
    short = "Framed matte canvas · collectible wall piece · made to order.";
  }

  let description =
    plain.slice(0, 520) ||
    "Produced on demand and packed as a limited release.";
  description = description
    .replace(/Product features[\s\S]*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (description.length < 40) {
    description =
      plain.slice(0, 400) ||
      "Issued as a limited cultural object from the archive.";
  }

  return {
    id: `pfy-${p.id}`,
    slug,
    name,
    shortDescription: short,
    description,
    category,
    gradient: gradients[p.id.charCodeAt(0) % gradients.length]!,
    accentLabel: accent,
    materials:
      category === "apparel"
        ? "Premium textile · made to order"
        : "Finished piece · made to order",
    fulfilment: "Made to order",
    featured: true,
    // Original Printify product image only — never substitute assets
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
  const editorial = shopProducts.filter(isShopVisible);

  if (!printifyConfigured()) {
    return {
      source: "editorial",
      connected: false,
      shopId: null,
      shopTitle: null,
      products: editorial,
      message: "",
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
      .filter((p) => p.variants.length > 0)
      .filter(isShopVisible);

    if (live.length === 0) {
      return {
        source: "editorial",
        connected: true,
        shopId,
        shopTitle: shop?.title ?? null,
        products: editorial,
        message: "",
      };
    }

    return {
      source: "printify",
      connected: true,
      shopId,
      shopTitle: shop?.title ?? null,
      products: live,
      message: "",
    };
  } catch (err) {
    return {
      source: "editorial",
      connected: false,
      shopId: process.env.PRINTIFY_SHOP_ID?.trim() ?? null,
      shopTitle: null,
      products: editorial,
      message: "",
      error: err instanceof Error ? err.message : undefined,
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
