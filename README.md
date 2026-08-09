# mypahlavi.com

Independent royal archive of the **Pahlavi family** — gallery, lineage, library, editions shop, and patronage.

Built with TanStack Start · React · Tailwind · ready for **Vercel**.

## Live repo

https://github.com/nou-hue/mypahlavi

## Deploy to Vercel (one-time)

1. Open [vercel.com/new](https://vercel.com/new)
2. **Import** the GitHub repo `nou-hue/mypahlavi`
3. Framework preset: leave default (Vite / Nitro)
4. Click **Deploy**
5. In Project → **Domains**, add `mypahlavi.com` (and `www`) and set DNS at your registrar:

```
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
```

Or from CLI (after `vercel login`):

```bash
vercel link
vercel --prod
```

## Local

```bash
npm install
npm run dev      # http://localhost:8080
npm run build
```

## Sections

- **Gallery** — framed archival plates + captions
- **Lineage** — interactive family tree
- **Library** — essays, letters, books
- **Shop / Editions** — Printify-ready cart + checkout
- **Patronage** — subscription tiers

## Notes

- Images live in `public/archive/`
- Shop is wired for Printify (connect API keys when ready)
