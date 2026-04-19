## Why

The backend currently uses a Vercel-serverless-function pattern (one file per route, manual `req.method` dispatching, copy-pasted auth logic in every handler) that was adapted to run locally under Express but never properly restructured. This creates duplicated authentication code across 13+ handlers, no type safety on `req`/`res`, and a pattern unfamiliar to anyone writing standard Node.js backends.

## What Changes

- Replace the dynamic file-loader in `server.ts` with explicit Express routers mounted at `/api`
- Extract auth token validation into a shared `authenticate` middleware that attaches `req.user`
- Extract trip ownership/collaborator checks into a reusable `verifyTripAccess` middleware/helper
- Replace per-file `if (req.method === 'GET')` dispatching with `router.get()`, `router.post()`, etc.
- Introduce typed request interfaces (`AuthenticatedRequest`, resource DTOs) to replace `req: any` / `res: any`
- Organize code into `middleware/`, `routes/`, `controllers/`, and `types/` directories
- Keep `lib/supabase.ts` and `lib/helpers.ts` as-is — they're already well-scoped
- **BREAKING**: The file-per-route dynamic loader (`collectFiles` / `fileToRoute` / `app.all()`) is removed

## Capabilities

### New Capabilities

- `express-backend-architecture`: Structured Express server with routers, controllers, middleware, and TypeScript types replacing the current serverless-function-per-file pattern

### Modified Capabilities

- `local-dev-server`: The local dev server entrypoint (`server.ts`) changes from a dynamic file loader to an explicit router-mounting Express app — behavior is the same, structure is different

## Impact

- **Files removed**: All existing `backend/api/**/*.ts` handler files
- **Files replaced**: `backend/server.ts` rewritten as standard Express app
- **Files added**: `backend/middleware/`, `backend/routes/`, `backend/controllers/`, `backend/types/`
- **No API surface changes**: All routes, HTTP methods, and response shapes stay identical
- **Vercel compatibility**: A thin `api/index.ts` adapter exports the Express app for Vercel serverless deployment
- **Dependencies**: No new npm packages required — Express is already installed
