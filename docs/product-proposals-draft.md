# MyPahlavi — draft product proposals (NOT published)

Status: **proposal only**. Nothing here exists in Stripe or Printify, no prices are final,
and no catalogue entries were added. Prices are GBP, UK-delivered (shipping is absorbed into
retail price per `estimateShippingGBP`).

## Existing price anchors (`src/data/shop.ts`)

| Type | Existing | Price |
|---|---|---|
| Archival print | A3 / A2 / A1 | £46–48 / £68–72 / £110 |
| Tee | S–XL / 2XL | £36 / £38 |
| Long sleeve | S–XL | £42 |
| Hoodie | S–XL | £58 |
| Tote | one size | £28 |
| Mug | 11 oz / 15 oz | £18 / £22 |

## Print-resolution reality check (affects the *existing* catalogue too)

Long-side pixels ÷ long-side inches = effective dpi (aim for ≥150, ideally 200+).

- The `user-*.jpg` files are ~2000 px on the long side: A4 ≈ 170 dpi (ok), A3 ≈ 120 dpi (soft), A2 ≈ 85 dpi, A1 ≈ 60 dpi (poor).
  The existing `coronation-study-print` (1537×2000) and `garden-laughter-print` are therefore listed at A3/A2/A1 but should be capped at **A4/A3** unless higher-res scans are sourced.
- Wikimedia plates of 3500–3840 px (Shahbanu, Shah 1973, Reza Pahlavi cropped portraits) reach ~200 dpi at A2 and ~145 dpi at A1.
- Lineage portraits (600–900 px) only suit small formats (cards / A6–A5).

## Rights flags (must be cleared by the owner before any product is created)

- 34 of 54 gallery images are tagged `license: user-upload`; 20 are Wikimedia Commons / "see source". Commons files carry per-file licences (CC BY / CC BY-SA need attribution; some are US-govt public domain). Verify each before commercial merchandise.
- Likenesses of living people (Farah Pahlavi, Reza Pahlavi, Farahnaz, Leila-line family) on **apparel/mugs/totes** raise personality-rights risk; prints of historical plates are lower risk. Proposals below use prints for portraits and original artwork for objects/apparel.

## Proposals

| # | Title | Source asset | Printify product / size | Suggested GBP range | Rationale |
|---|---|---|---|---|---|
| 1 | Shahbanu of Iran — plate | `public/archive/farah-pahlavi/shahbanu-of-iran.jpg` (3840×4849) | Fine-art / matte poster A3, A2 (A1 optional) | A3 £46–52 · A2 £68–76 · A1 £105–115 | Highest-res portrait; mirrors existing A3/A2/A1 ladder. Commons — verify licence; subject is living. |
| 2 | Mohammad Reza Pahlavi, 1973 | `public/archive/mohammad-reza-shah/mohammad-reza-pahlavi-1973.jpg` (3644×5588) | Matte poster A3, A2, A1 | A3 £46–52 · A2 £68–76 · A1 £105–115 | Very high res (≈170 dpi at A1). Same ladder as coronation study. |
| 3 | Mohammad Reza Pahlavi, 1973 (II) | `public/archive/mohammad-reza-shah/mohammad-reza-pahlavi-in-1973.jpg` (3840×5217) | Matte poster A3, A2 | A3 £46–50 · A2 £68–72 | Alternate crop; ship only one of #2/#3 to avoid redundancy. |
| 4 | Tapiola, 1970 (landscape) | `public/archive/mohammad-reza-shah/shah-mohammed-reza-pahlavi-in-tapiola-finland-in-1970.jpg` (3840×2587) | Landscape matte poster A3, A2 | A3 £44–48 · A2 £66–72 | Only landscape in set; adds format variety. Commons — verify. |
| 5 | Kennedy welcome, 1962 | `public/archive/mohammad-reza-shah/kennedy-s-welcome-shah-of-iran-to-w-house-digital-file-from-original-item.jpg` (3840×2585) | Landscape matte poster A3, A2 | A3 £44–48 · A2 £66–72 | Likely US-govt public domain (cleanest rights). |
| 6 | Reza Shah — Woolf portrait, 1938 | `public/archive/reza-shah/reza-shah-woolf-portrait-1938.jpg` (1997×2400) | Matte poster A4, A3 (A3 ≈ 145 dpi) | A4 £26–32 · A3 £44–48 | Commons; resolution limits to A3. Entry-level print price point. |
| 7 | Crown Prince Reza — cropped portrait | `public/archive/reza-pahlavi/portrait-of-crown-prince-of-iran-reza-pahlavi-cropped.jpg` (3525×4680) | Matte poster A3, A2 | A3 £46–50 · A2 £68–72 | Living subject — confirm owner intent/rights first. |
| 8 | Lineage cards — Tadj ol-Molouk, Ali Reza (and set) | `public/archive/lineage-portraits/tadj-ol-molouk.jpg` (900×1238), `.../ali-reza.jpg` (800×1033) | Greeting card 5×7 in (single / set) | £4.50–6 each · set of 4 £16–20 | Only formats the low-res lineage art supports. Farahnaz / Leila / Shahnaz (≤800 px) need better scans first. New low-price entry point (nothing under £18 today). |
| 9 | Tehran Grid No. 01 | `public/editions/tehran-grid-01.svg` (on `v4/editorial-rebuild`; 1200×1600 vector) | Matte poster A3, A2 (rasterise to 300 dpi first) | A3 £42–48 · A2 £62–70 | Original studio artwork — no third-party rights, resolution-independent. Price at parity with photo prints. |
| 10 | Caspian Line No. 01 | `public/editions/caspian-line-01.svg` (V4) | Matte poster A3, A2 | A3 £42–48 · A2 £62–70 | As #9. |
| 11 | Garden Plan No. 01 | `public/editions/garden-plan-01.svg` (V4) | Matte poster A3, A2 | A3 £42–48 · A2 £62–70 | As #9. |
| 12 | Tehran Desk No. 01 | `public/editions/tehran-desk-01.svg` (V4; 1800×700 panoramic) | Desk mat (e.g. 31×15.5 in) | £26–34 | Designed for the format; accessory pricing between mug (£18–22) and tote (£28)/tee (£36). |
| 13 | Tehran Grid — tote | `public/editions/tehran-grid-01.svg` (V4) | Cotton tote, one size | £28–32 | Matches existing tote £28; original art, no likeness. |
| 14 | Caspian Line — mug | `public/editions/caspian-line-01.svg` (V4) | Ceramic mug 11 oz / 15 oz | £18–22 / £22–26 | Matches existing mug prices. |

## Recommended order of launch

1. Originals (#9–#14): zero rights risk, resolution-independent.
2. Public-domain/high-res plates (#5, #2, #1) after licence check.
3. Lineage cards (#8) once scan quality is confirmed.

## Before anything goes live

- Owner sign-off on subjects, titles and final prices.
- Margin check against Printify base cost + UK shipping (not looked up here — no Printify access in this review).
- Create products in Printify as unpublished, then map `printifyProductId` / `printifyVariantId`.
- Stripe: test-mode checkout end-to-end first.
