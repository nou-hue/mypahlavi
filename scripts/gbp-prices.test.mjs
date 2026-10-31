import assert from "node:assert/strict";
import { test } from "node:test";
import {
  GBP_PRICE_MAP_PENCE,
  gbpPricePence,
  productKey,
  variantKeyCandidates,
} from "../src/data/gbp-prices.ts";
import { mapPrintifyProduct } from "../src/lib/shop/catalog.server.ts";
import { priceCheckoutLine } from "../src/lib/shop/checkout-pricing.ts";
import {
  isPurchasable,
  shopProducts,
  startingPriceLabel,
  variantPriceLabel,
} from "../src/data/shop.ts";
import { poundsToPence } from "../src/lib/stripe/client.ts";

const HOODIE_ID = "6a78e64d335c253a4b030aa4";
const CANVAS_ID = "6a7aeeec78e78ae42d015e7b";
const DESKMAT_ID = "6a78e60ac169c5412b01ecc1";
const MUG_ID = "6a78dcf7e2315589c60c87e0";

/** Printify product shaped like the live API, with the bad USD-as-GBP numbers. */
function printify(id, title, variants) {
  return {
    id,
    title,
    description: "desc",
    images: [{ src: "https://img/x.png", is_default: true }],
    variants: variants.map(([vid, vtitle, cents]) => ({
      id: vid,
      sku: `sku-${vid}`,
      title: vtitle,
      price: cents,
      is_enabled: true,
    })),
  };
}

const liveHoodie = () =>
  printify(HOODIE_ID, "Abstract Night Sky graphic Hoodie", [
    [68860, "White / S", 10589],
    [68868, "White / M", 10589],
    [68876, "White / L", 10589],
    [68884, "White / XL", 10589],
    [68892, "White / 2XL", 12446],
    [71067, "White / 3XL", 12446],
  ]);
const liveCanvas = () =>
  printify(CANVAS_ID, "Mehr Persian Lion & Sun Canvas", [
    [244044, '30" x 40" (Vertical) / Natural / 1.25"', 16994],
    [107265, '30" x 40" (Vertical) / White / 1.25"', 16994],
    [107264, '30" x 40" (Vertical) / Espresso / 1.25"', 16994],
    [88303, '30" x 40" (Vertical) / Black / 1.25"', 16994],
  ]);

test("hoodie: £65 S–XL, £72 2XL–3XL, never the Printify cents value", () => {
  const p = mapPrintifyProduct(liveHoodie());
  const by = Object.fromEntries(p.variants.map((v) => [v.label, v.priceGBP]));
  assert.deepEqual(by, {
    "White / S": 65,
    "White / M": 65,
    "White / L": 65,
    "White / XL": 65,
    "White / 2XL": 72,
    "White / 3XL": 72,
  });
  assert.ok(p.variants.every((v) => v.currency === "GBP"));
  assert.ok(!p.variants.some((v) => v.priceGBP === 105.89 || v.priceGBP === 124.46));
});

test("canvas: £149 for every frame colour", () => {
  const p = mapPrintifyProduct(liveCanvas());
  assert.equal(p.variants.length, 4);
  assert.ok(p.variants.every((v) => v.priceGBP === 149));
  assert.ok(!p.variants.some((v) => v.priceGBP === 169.94));
});

test("unmapped Printify products (desk mat, mug) are price on request", () => {
  const mat = mapPrintifyProduct(
    printify(DESKMAT_ID, "Antique Double-Headed Horse Illustration Desk Mat", [
      [81075, '31.5" × 15.5"', 6386],
    ]),
  );
  const mug = mapPrintifyProduct(
    printify(MUG_ID, "Vintage Cat Engraving Metallic Mug", [
      [71936, "11oz / Silver", 3440],
    ]),
  );
  for (const p of [mat, mug]) {
    assert.ok(p.variants.every((v) => v.priceGBP === null));
    assert.ok(p.variants.every((v) => !isPurchasable(v)));
    assert.equal(startingPriceLabel(p), "Price on request");
    assert.equal(variantPriceLabel(p.variants[0]), "Price on request");
  }
});

test("unmapped variant of a mapped product (hoodie XS, unknown size) is hidden", () => {
  const p = mapPrintifyProduct(
    printify(HOODIE_ID, "Hoodie", [
      [1, "White / XS", 9999],
      [2, "White / 4XL", 9999],
      [3, "White / M", 9999],
    ]),
  );
  assert.deepEqual(
    p.variants.map((v) => v.priceGBP),
    [null, null, 65],
  );
});

test("a renamed Printify title keeps its price (keyed by product id)", () => {
  const p = mapPrintifyProduct(printify(HOODIE_ID, "Totally New Title", [[1, "Black / L", 1]]));
  assert.equal(p.variants[0].priceGBP, 65);
});

test("an unknown Printify product id is never priced from Printify cents", () => {
  const p = mapPrintifyProduct(printify("deadbeef", "Mystery Hoodie", [[1, "White / M", 10589]]));
  assert.equal(p.variants[0].priceGBP, null);
});

test("approved wall-art ladders", () => {
  const price = (slug, id, label) => gbpPricePence({ slug }, { id, label });
  const sizes = { a3: "A3", a2: "A2", a1: "A1" };
  const expect = {
    "kennedy-welcome-1962-print": { a3: 4400, a2: 6600, a1: null },
    "mohammad-reza-pahlavi-1973-print": { a3: 4600, a2: 6800, a1: 10500 },
    "shahbanu-of-iran-print": { a3: 4600, a2: 6800, a1: 10500 },
    "tehran-grid-no-01": { a3: 4200, a2: 6400, a1: 9200 },
    "caspian-line-no-01": { a3: 4200, a2: 6400, a1: null },
  };
  for (const [slug, ladder] of Object.entries(expect)) {
    for (const [id, label] of Object.entries(sizes)) {
      assert.equal(price(slug, id, `${label} · x`), ladder[id], `${slug} ${id}`);
    }
  }
});

test("variant key matching: ids, labels, dimensions, ambiguity", () => {
  assert.ok(variantKeyCandidates({ id: "1", label: '30" x 40" (Vertical) / Natural' }).includes("30x40"));
  assert.ok(variantKeyCandidates({ id: "1", label: "White / 2XL" }).includes("2xl"));
  // Ambiguous label (two mapped sizes) must not guess a price.
  assert.equal(
    gbpPricePence({ printifyProductId: HOODIE_ID, slug: "h" }, { id: "9", label: "S / M" }),
    null,
  );
  assert.equal(productKey({ slug: "s", printifyProductId: "abc" }), "printify:abc");
  assert.equal(productKey({ slug: "s", printifyProductId: null }), "s");
});

test("map hygiene: integer positive pence; round-trips to the Stripe amount", () => {
  for (const [key, variants] of Object.entries(GBP_PRICE_MAP_PENCE)) {
    for (const [vk, pence] of Object.entries(variants)) {
      assert.ok(Number.isInteger(pence) && pence > 0, `${key}/${vk}`);
      assert.equal(poundsToPence(pence / 100), pence, `${key}/${vk} round trip`);
    }
  }
});

test("editorial catalogue is fully priced from the map (no unmapped surprises)", () => {
  for (const p of shopProducts) {
    for (const v of p.variants) {
      assert.equal(v.currency, "GBP");
      assert.equal(typeof v.priceGBP, "number", `${p.slug}/${v.id}`);
    }
  }
  const tee = shopProducts.find((p) => p.slug === "ivory-crest-tee");
  assert.deepEqual(tee.variants.map((v) => v.priceGBP), [36, 36, 36, 36, 38]);
});

test("checkout line price is server-side from the map and ignores the product's own price", () => {
  const product = mapPrintifyProduct(liveHoodie());
  const twoXl = product.variants.find((v) => v.label.endsWith("2XL"));
  // Even if a tampered/stale object claims another price, checkout re-derives it.
  const tampered = { ...twoXl, priceGBP: 1 };
  const r = priceCheckoutLine(product, tampered);
  assert.deepEqual(r, { ok: true, unitPence: 7200 });
  assert.equal(poundsToPence(r.unitPence / 100), 7200);

  const canvas = mapPrintifyProduct(liveCanvas());
  assert.deepEqual(priceCheckoutLine(canvas, canvas.variants[0]), { ok: true, unitPence: 14900 });

  const mug = mapPrintifyProduct(printify(MUG_ID, "Mug", [[1, "11oz / Silver", 3440]]));
  assert.deepEqual(priceCheckoutLine(mug, mug.variants[0]), { ok: false, reason: "price_on_request" });
});
