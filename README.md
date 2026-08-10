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
   `https://www.mypahlavi.com/api/shop/status`  
   should show `"database": { "ok": true, "provider": "neon", ... }`.

Also accepted env names (if you use Vercel Storage / Neon integration):  
`POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `NEON_DATABASE_URL`.

Local preview does **not** need Neon — it uses embedded PGLite automatically.

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
Catalog: `GET /api/shop/catalog`

## Sections

- **Gallery** — photographic archive
- **Century** — dynastic timeline
- **Library** — essays & documents
- **Vault** — rare / unpublished
- **Editions** — limited objects (Stripe + Printify)
- **The Circle** — patronage
