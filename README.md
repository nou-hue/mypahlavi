# mypahlavi.com

Independent archive of the **Pahlavi family** — gallery, lineage, library, limited editions shop.

**This is the single production site.** Do not create a second Vercel project.

| | |
|---|---|
| GitHub | https://github.com/nou-hue/mypahlavi |
| Vercel project | `noushinsteam/mypahlavi` |
| Production URL | https://mypahlavi.vercel.app |
| Custom domain | mypahlavi.com (attach in Vercel → Domains) |

Pushing to `main` deploys that Vercel project automatically.

## Local

```bash
npm install
npm run dev      # 0.0.0.0:8080
npm run build
npm run typecheck
```

## Shop (Printify + Stripe)

Set these on the **same** Vercel project (Settings → Environment Variables):

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
VITE_STRIPE_PUBLISHABLE_KEY=
PRINTIFY_API_TOKEN=
PRINTIFY_SHOP_ID=
DATABASE_URL=          # Neon recommended on Vercel
```

Stripe webhook endpoint (Production):

```
https://mypahlavi.vercel.app/api/shop/webhook
```

Event: `checkout.session.completed`

Inspect Printify products: `GET /api/shop/printify/products`  
Shop status: `GET /api/shop/status`

Map Printify product/variant IDs onto catalogue entries in `src/data/shop.ts` for auto-fulfilment.

## Sections

- **Gallery** — collection with captions
- **Lineage** — family tree (Fawzia, Soraya, Farah distinct)
- **Library** — essays & letters
- **Editions** — bag, Stripe checkout, Printify production
- **Patronage** — support tiers

## Domain

In Vercel project `mypahlavi` → Domains → add `mypahlavi.com` / `www`:

```
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```
