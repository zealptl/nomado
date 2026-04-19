## Context

The backend started as Vercel serverless functions (one file per route, `export default handler`, manual `req.method` dispatching). A recent refactor added an Express dev server that dynamically loads these files via `app.all()` and simulates Vercel's `req.query` merging. The result works but has significant friction: auth logic is duplicated across 13 handler files, all request/response types are `any`, and the structure is unfamiliar to anyone writing standard Express backends.

Current file tree:
```
backend/
  api/
    trips/index.ts                    # GET list, POST create
    trips/[id]/index.ts               # GET, PATCH, DELETE
    trips/[id]/items/index.ts         # GET, POST
    trips/[id]/items/[itemId]/index.ts
    trips/[id]/items/reorder.ts
    trips/[id]/segments/index.ts
    trips/[id]/segments/[segId]/index.ts
    trips/[id]/tags/index.ts
    trips/[id]/tags/[tagId]/index.ts
    trips/[id]/invite/index.ts
    trips/[id]/invite/refresh.ts
    trips/shared.ts
    invite/accept.ts
  lib/supabase.ts
  lib/helpers.ts
  server.ts                           # dynamic file loader
```

## Goals / Non-Goals

**Goals:**
- Single `authenticate` middleware — no more auth duplication per handler
- Express `Router` per resource group — `router.get()` / `router.post()` replacing `if (req.method === ...)` 
- Typed `AuthenticatedRequest` extending Express `Request` so `req.user` is always available downstream
- TypeScript interfaces for all DB row shapes (Trip, ItineraryItem, TripSegment, etc.)
- Vercel compatibility — thin `api/index.ts` adapter that exports the Express app
- Zero API surface changes — same routes, HTTP methods, and response shapes

**Non-Goals:**
- Adding new routes or changing business logic
- Switching database or auth provider
- Adding request validation libraries (zod etc.) — out of scope for this refactor
- OpenAPI / Swagger generation

## Decisions

### 1. Directory structure

```
backend/
  middleware/
    auth.ts           # authenticate(req, res, next) — verifies JWT, attaches req.user
    tripAccess.ts     # verifyTripAccess(req, res, next) — owner/collaborator check, attaches req.trip
  routes/
    trips.ts          # /api/trips, /api/trips/:id
    items.ts          # /api/trips/:id/items, /api/trips/:id/items/:itemId, /api/trips/:id/items/reorder
    segments.ts       # /api/trips/:id/segments, /api/trips/:id/segments/:segId
    tags.ts           # /api/trips/:id/tags, /api/trips/:id/tags/:tagId
    invite.ts         # /api/trips/:id/invite, /api/trips/:id/invite/refresh, /api/invite/accept
    shared.ts         # /api/trips/shared
  controllers/
    tripsController.ts
    itemsController.ts
    segmentsController.ts
    tagsController.ts
    inviteController.ts
    sharedController.ts
  types/
    index.ts          # AuthenticatedRequest, DB row interfaces, DTO types
  lib/
    supabase.ts       # unchanged
    helpers.ts        # unchanged
  server.ts           # mounts routers, no dynamic loader
  vercel-adapter.ts   # exports app for Vercel (no listen())
```

**Why controllers separate from routes?** Routes wire HTTP verbs to handlers; controllers contain the actual logic. This makes it easy to test controllers independently without spinning up HTTP.

**Why `tripAccess` middleware separate from `auth`?** Not all trip routes need ownership/collaborator checks (e.g., `invite/accept` is public-ish). Keeping them separate lets routes opt in per-verb.

### 2. `AuthenticatedRequest` type

```ts
// types/index.ts
import { Request } from 'express';
import { User } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends Request {
  user: User;
  trip?: Trip;      // attached by tripAccess middleware when used
}
```

All controller functions are typed `(req: AuthenticatedRequest, res: Response) => Promise<void>`.

**Why extend Request rather than using generics?** Express's generic `Request<P, B, Q>` gets unwieldy with middleware-attached properties. A named interface is simpler and self-documenting.

### 3. Auth middleware

```ts
// middleware/auth.ts
export async function authenticate(req, res, next) {
  const token = getAuthToken(req);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const { data: { user } } = await createUserClient(token).auth.getUser();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  (req as AuthenticatedRequest).user = user;
  next();
}
```

Applied at the router level for all protected routes. `invite/accept` is the only route that doesn't use it (public endpoint).

### 4. Trip access middleware

```ts
// middleware/tripAccess.ts
export async function verifyTripAccess(req, res, next) {
  // reads req.params.id, attaches req.trip + req.isOwner
}
export async function requireOwner(req, res, next) {
  if (!req.isOwner) return res.status(403).json({ error: 'Only the trip owner can do this' });
  next();
}
```

Used on routes that need ownership/collaborator gating, reducing each controller to just the DB logic.

### 5. Vercel adapter

```ts
// vercel-adapter.ts
import app from './server';
export default app; // Vercel calls this as a serverless function
```

`vercel.json` rewrites `/api/(.*)` to this file. `server.ts` does NOT call `app.listen()` — that's only done in a separate `dev.ts` entrypoint (or inline with `if (require.main === module)`).

**Alternative considered:** Keep the current file-per-route structure and just add a middleware layer. Rejected — it doesn't solve the structural problem and requires more invasive changes to every handler file.

### 6. DB type interfaces

Defined in `types/index.ts` based on the Supabase tables already in use:

- `Trip` — matches `trips` table
- `ItineraryItem` — matches `itinerary_items` table (includes `item_photos` join shape)
- `TripSegment` — matches `trip_segments` table
- `TripTag` — matches `trip_tags` table
- `TripCollaborator` — matches `trip_collaborators` table
- `TripInvite` — matches `trip_invites` table

No Supabase-generated types — kept manual to avoid adding a codegen step to the workflow.

## Risks / Trade-offs

- **Vercel cold start** → The entire Express app becomes one serverless function. Cold starts are slightly slower than per-route functions. At current scale (personal/small team app) this is not a concern.
- **No middleware on `invite/accept`** → This route is intentionally public (accepts invite tokens). Must not accidentally add `authenticate` to it.
- **Cascading deletes in `tripsController.ts`** → The DELETE trip handler has complex multi-step cleanup (photos, storage, related records). This logic stays in the controller verbatim — not split across middleware.

## Migration Plan

1. Create new directory structure alongside existing `api/` directory
2. Implement middleware, types, controllers, routes one resource group at a time
3. Update `server.ts` to mount new routers instead of dynamic loader
4. Verify all routes work identically via manual testing + existing frontend
5. Delete old `api/` directory files
6. Add `vercel-adapter.ts` and update `vercel.json` if deploying to Vercel

Rollback: git revert — old files are deleted only after new structure is verified working.
