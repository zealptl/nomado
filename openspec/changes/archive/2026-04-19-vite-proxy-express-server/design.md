## Context

The backend is written as Vercel serverless functions (`backend/api/**/*.ts`). Each file exports a default `handler(req, res)` function using standard Node.js `IncomingMessage`/`ServerResponse` semantics — no Vercel-specific imports. In production, Vercel serves these alongside the static frontend from the same domain, so relative `/api/*` fetches work. Locally there is no server to handle those calls; `vercel dev` was the intended solution but fails with config errors that are difficult to stabilize.

## Goals / Non-Goals

**Goals:**
- `/api/*` calls work locally without `vercel dev` or any Vercel tooling
- Minimal new code — no framework beyond Express, no custom bundler
- Hot-reloading on backend file changes during development
- Existing handler files require zero modification

**Non-Goals:**
- Replicating Vercel edge-function behavior or middleware
- Production server — this is dev-only; production stays on Vercel serverless
- Full Vercel feature parity (env injection, build step, etc.)

## Decisions

### 1. Express over a raw `http.createServer`
Express handles body parsing (`express.json()`), `req.params` extraction, and method routing cleanly. The handlers already use `req.body`, `req.query`, and `res.status().json()` patterns that map directly to Express's compatible API. A raw server would require reimplementing all of that.

_Alternative considered_: Fastify — higher performance but requires adapter layer since handlers use Express-style `res.status().json()` not Fastify's reply API.

### 2. Filesystem-based route registration (no manual routing table)
`backend/server.ts` scans `backend/api/**/*.ts` at startup, converts file paths to Express routes (replacing `[param]` → `:param`, `index.ts` → the parent path), and registers each handler. This mirrors Vercel's file-based routing so new API files are automatically picked up with no server changes needed.

_Alternative considered_: A static route registry — would require updating two files every time a new handler is added.

### 3. `tsx` for TypeScript execution
`tsx` (esbuild-based) starts faster than `ts-node` and supports `--watch` for hot-reloading. No `tsconfig` changes needed.

_Alternative considered_: `ts-node` — slower cold start, requires `esm` loader flags for some module configurations.

### 4. Vite proxy for `/api/*`
The frontend uses relative `/api/*` paths. Adding a Vite proxy (`server.proxy`) transparently forwards those requests to `localhost:3001` — zero changes to frontend fetch code.

_Alternative considered_: Absolute URLs with env vars — would require modifying all `apiFetch` calls and managing `VITE_API_URL` across environments.

### 5. Remove `functions` block from `vercel.json`
The `functions` block with an empty object causes a Vercel validation error locally. Removing it entirely is safe — Vercel auto-detects TypeScript files in the `api/` directory (or `backend/api/` as configured via `outputDirectory`). Production behavior is unchanged.

## Risks / Trade-offs

- **Route ordering**: Specific routes (e.g., `/api/trips/:id/items/reorder`) must be registered before wildcard routes (e.g., `/api/trips/:id/items/:itemId`). The filesystem scan sorts by path depth and alphabetically, which naturally handles this — but is fragile if naming conventions change. → Mitigation: sort routes by segment count descending before registration, and document the convention.
- **Body parsing**: Express's `express.json()` middleware parses JSON bodies automatically. If a handler expects `req.body` to be pre-parsed (which Vercel does), this works correctly. Non-JSON content types are not handled. → Acceptable for current API surface (all endpoints use JSON).
- **`vercel dev` removed from launch.json**: If someone wants to run `vercel dev` manually, they can — the `vercel.json` changes don't break that path.

## Migration Plan

1. Install deps: `npm install --save-dev express @types/express tsx` in `backend/`
2. Create `backend/server.ts`
3. Add `"dev": "tsx --watch server.ts"` to `backend/package.json`
4. Add Vite proxy to `frontend/vite.config.ts`
5. Update `.vscode/launch.json` Backend to `npm run dev` from `backend/`
6. Remove `functions` block from `vercel.json`

No database migrations, no breaking API changes, no coordination needed. Rollback: revert the above files.
