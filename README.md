# Sunflower Land — Resource Efficiency (FC/hour)

This minimal Next.js app ranks **Resources** (crops, animals, mining) by **FLOWER per hour**.
Formula: `FC/hour = LastSaleFLOWER / (DurationHours)`

- **No exchange** used. Prices are already in FLOWER.
- Duration values are editable at `src/data/durations.json`.
- Prices are fetched from either:
  1) `SUNFLOWER_API_BASE` (protected) using `SUNFLOWER_API_TOKEN` (Authorization: Bearer), expecting an array of `{ name, lastSaleFlower }`
  2) public fallback `SFL_WORLD_PRICES_URL` (default).

## Quick start

```bash
pnpm i   # or npm i / yarn
cp .env.example .env
# (optional) put your protected API base and token:
# SUNFLOWER_API_BASE=https://.../marketplace
# SUNFLOWER_API_TOKEN=YOUR_TOKEN
# You can also set NEXT_PUBLIC_BASE_URL for SSR fetch if deploying behind a domain.

pnpm dev
```

Open http://localhost:3000 — you'll see a sortable table with FC/hour.

## Notes
- Update `src/data/durations.json` with real in-game timers.
- Add more resources to the durations list; only items present in both durations and prices will be shown.
- Cache revalidation defaults to 15 minutes (`SFL_WORLD_CACHE_SECONDS`).

Security: never commit your real token. Use `.env` and rotate if exposed.
