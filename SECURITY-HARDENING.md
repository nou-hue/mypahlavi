# Security hardening (sec/hardening-20261031) — DO NOT MERGE until reviewed

Draft PR produced by the 31 Oct 2026 security sweep. Nothing here has been deployed to production.

## Changes
- **Security headers** (Nitro route rules in `vite.config.ts`): HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP, an *enforced* minimal CSP (`frame-ancestors 'none'; base-uri; object-src; form-action`) and the full CSP as **Report-Only** first. Promote the Report-Only policy to enforcing after checking the preview for violations.
- **Source maps** explicitly disabled for production builds (`build.sourcemap=false`, Nitro `sourcemap=false`). Verified: no `.map` in `.vercel/output`.
- **Secret removed from code**: the hard-coded shared preview OAuth client secret in `src/lib/auth/preview.ts` is gone; it is read from `GROK_PREVIEW_CLIENT_SECRET` only. The old value is still in git history ⇒ **rotate it** (see report).
- **Fail-closed auth**: `requireUserId()` no longer falls back to the shared `dev-user` in a hosted runtime.
- **API routes**: rate limits on checkout / order lookup / status; `/api/shop/status` returns only `{stripe, printify, ready, mode, message}` publicly (shop ids, Neon host and upstream errors are operator-only via `Authorization: Bearer ADMIN_API_TOKEN`); `/api/shop/printify/products` is operator-only; order ids are now 80-bit random and an order that went through Stripe is only returned to the holder of its checkout `session_id`; Stripe success/cancel URLs use an allow-listed origin instead of the raw `Host` header; error messages from Stripe/Printify are no longer echoed to clients.
- `.gitleaks.toml` for local/CI scanning.

## Still needs a human / production approval
- Add `ADMIN_API_TOKEN` (random, ≥ 32 chars) in Vercel **only if** operator diagnostics are wanted.
- Preview deployments currently share production `DATABASE_URL`/`POSTGRES_*`/Stripe/Printify env entries (target `preview` + `production`). Scope them to Production only and give previews a Neon branch + Stripe test keys.
- Add a Vercel Firewall rate-limit rule for `/api/shop/checkout` and `/api/circle/checkout` (the in-memory limiter is per serverless instance).
