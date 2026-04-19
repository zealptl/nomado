## Why

The backend API handlers (Vercel serverless functions in `backend/api/`) have no local dev server — `vercel dev` fails due to config incompatibilities, and the frontend's relative `/api/*` fetch calls 404 locally because Vite has no proxy configured. APIs only work in production.

## What Changes

- Add Vite proxy config forwarding `/api/*` → `http://localhost:3001` in `frontend/vite.config.ts`
- Add `express` and `tsx` as `devDependencies` in `backend/package.json`
- Create `backend/server.ts` — a minimal Express server that auto-registers all handlers from `backend/api/` by scanning the filesystem and converting `[param]` path segments to Express `:param` syntax
- Add `"dev": "tsx server.ts"` script to `backend/package.json`
- Update `.vscode/launch.json` Backend config to run `npm run dev` from `backend/`
- Remove broken `functions` block from `vercel.json` (production deployment unaffected — Vercel auto-detects `api/` handlers)

## Capabilities

### New Capabilities

- `local-dev-server`: Express server that serves all `backend/api/` handlers locally on port 3001 with filesystem-based routing matching Vercel's `[param]` convention

### Modified Capabilities

- none

## Impact

- `frontend/vite.config.ts` — adds `server.proxy` config
- `backend/package.json` — adds `express`, `@types/express`, `tsx` devDeps; adds `dev` script
- `backend/server.ts` — new file
- `vercel.json` — removes `functions` block (no production impact)
- `.vscode/launch.json` — updates Backend config to use `npm run dev`
