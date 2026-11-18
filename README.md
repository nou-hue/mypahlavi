# mypahlavi.com

Independent archive — gallery, century, library, vault, editions, circle.

**This is the single production site.** Do not create a second Vercel project.

| | |
|---|---|
| GitHub | https://github.com/nou-hue/mypahlavi |
| Vercel project | `noushinsteam/mypahlavi` |
| Production URL | https://mypahlavi.vercel.app |
| Custom domain | mypahlavi.com |

Pushing to `main` deploys that Vercel project automatically.

## Local

```bash
npm install
npm run dev      # 0.0.0.0:8080
npm run build
npm run typecheck
```

## Neon (durable orders)

Orders need a real Postgres on Vercel. The app already uses Neon when
`DATABASE_URL` is set; migrations run on every deploy (`npm run build` →
`db:migrate`).

### One-time setup (≈2 minutes)

1. Open [console.neon.tech](https://console.neon.tech) → sign in → **New project**
   - Name: `mypahlavi`
   - Region: closest to your Vercel region (e.g. `eu-west` / London if you can)
2. Copy the **pooled** connection string (ends with `-pooler...neon.tech`, includes
   `?sslmode=require`).
3. Vercel → project **mypahlavi** → **Settings → Environment Variables**:
   - Key: `DATABASE_URL`
   - Value: paste the Neon pooled URL
   - Environments: **Production** (and Preview if you want preview deploys to use it)
4. **Redeploy** the latest production deployment (Deployments → ⋮ → Redeploy).
5. Confirm:  
   `curl -H "x-shop-admin-secret: $SHOP_ADMIN_SECRET" https://www.mypahlavi.com/api/shop/status`  
   should show `"database": { "ok": true, "provider": "neon", ... }`.

Also accepted env names (if you use Vercel Storage / Neon integration):  
`POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `NEON_DATABASE_URL`.

Local preview does **not** need Neon — it uses embedded PGLite automatically.

### Dedicated shop database (`SHOP_DATABASE_URL`)

The shop is moving off the Neon project it shares with CRD (clinical data).
The cut-over runbook is kept outside this public repo.

- `SHOP_DATABASE_URL` (pooled) and `SHOP_DATABASE_URL_UNPOOLED` (direct, for
  DDL) point at the shop's own database. When set they win over every name above.
- Until they are set, **production behaves exactly as before** (legacy names).
- **Preview/development** Vercel deployments ignore the legacy names (the Neon
  integration points them at a copy of the shared production database) and use
  PGLite. `npm run db:migrate` is skipped on every non-production Vercel build.
  To give previews a real database, set a preview-only `SHOP_DATABASE_URL` and
  `SHOP_ALLOW_PREVIEW_MIGRATIONS=true` for Preview.

## Shop (Printify + Stripe)

Set these on the **same** Vercel project (Settings → Environment Variables):

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
VITE_STRIPE_PUBLISHABLE_KEY=
PRINTIFY_API_TOKEN=
PRINTIFY_SHOP_ID=
DATABASE_URL=          # Neon pooled connection string
```

Stripe webhook endpoint (Production):

```
https://www.mypahlavi.com/api/shop/webhook
```

Event: `checkout.session.completed`

Shop status: `GET /api/shop/status`  
Public response is `{ "ok": boolean }` only (shop ready to take payments). Full
vendor/DB detail is returned only when the request carries the header
`x-shop-admin-secret: <SHOP_ADMIN_SECRET>`; set `SHOP_ADMIN_SECRET` in Vercel to
enable it (unset = detail disabled).  
Catalog: `GET /api/shop/catalog`

## Sections

- **Gallery** — photographic archive
- **Century** — dynastic timeline
- **Library** — essays & documents
- **Vault** — rare / unpublished
- **Editions** — limited objects (Stripe + Printify)
- **The Circle** — patronage
