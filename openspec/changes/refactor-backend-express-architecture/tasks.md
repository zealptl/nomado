## 1. Types and Shared Foundations

- [x] 1.1 Create `backend/types/index.ts` with `AuthenticatedRequest` interface (extends Express `Request` with `user: User`, optional `trip` and `isOwner`)
- [x] 1.2 Add DB row interfaces to `backend/types/index.ts`: `Trip`, `ItineraryItem`, `ItemPhoto`, `TripSegment`, `TripTag`, `TripCollaborator`, `TripInvite`

## 2. Middleware

- [x] 2.1 Create `backend/middleware/auth.ts` — `authenticate(req, res, next)` that extracts Bearer token, verifies with Supabase, attaches `req.user`, returns 401 on failure
- [x] 2.2 Create `backend/middleware/tripAccess.ts` — `verifyTripAccess(req, res, next)` that looks up trip by `req.params.id`, checks owner/collaborator, attaches `req.trip` and `req.isOwner`, returns 403 on failure
- [x] 2.3 Add `requireOwner(req, res, next)` to `backend/middleware/tripAccess.ts` — returns 403 if `req.isOwner` is false

## 3. Controllers

- [x] 3.1 Create `backend/controllers/tripsController.ts` — `listTrips`, `createTrip`, `getTrip`, `updateTrip`, `deleteTrip` (port logic from `api/trips/index.ts` and `api/trips/[id]/index.ts`)
- [x] 3.2 Create `backend/controllers/itemsController.ts` — `listItems`, `createItem`, `getItem`, `updateItem`, `deleteItem`, `reorderItems` (port from `api/trips/[id]/items/`)
- [x] 3.3 Create `backend/controllers/segmentsController.ts` — `listSegments`, `createSegment`, `updateSegment`, `deleteSegment` (port from `api/trips/[id]/segments/`)
- [x] 3.4 Create `backend/controllers/tagsController.ts` — `listTags`, `createTag`, `deleteTag` (port from `api/trips/[id]/tags/`)
- [x] 3.5 Create `backend/controllers/inviteController.ts` — `generateInvite`, `refreshInvite`, `acceptInvite` (port from `api/trips/[id]/invite/` and `api/invite/accept.ts`)
- [x] 3.6 Create `backend/controllers/sharedController.ts` — `getSharedTrip` (port from `api/trips/shared.ts`)

## 4. Routers

- [x] 4.1 Create `backend/routes/trips.ts` — mount `authenticate`, wire GET/POST `/` and GET/PATCH/DELETE `/:id` with appropriate middleware chain
- [x] 4.2 Create `backend/routes/items.ts` — mount `authenticate` + `verifyTripAccess`, wire GET/POST `/:id/items`, GET/PATCH/DELETE `/:id/items/:itemId`, POST `/:id/items/reorder`
- [x] 4.3 Create `backend/routes/segments.ts` — mount `authenticate` + `verifyTripAccess`, wire GET/POST `/:id/segments`, PATCH/DELETE `/:id/segments/:segId`
- [x] 4.4 Create `backend/routes/tags.ts` — mount `authenticate` + `verifyTripAccess`, wire GET/POST `/:id/tags`, DELETE `/:id/tags/:tagId`
- [x] 4.5 Create `backend/routes/invite.ts` — wire POST `/:id/invite` (auth + requireOwner), POST `/:id/invite/refresh` (auth + requireOwner), POST `/invite/accept` (no auth)
- [x] 4.6 Create `backend/routes/shared.ts` — wire GET `/trips/shared` (no auth or token-based)

## 5. Server Entrypoint

- [x] 5.1 Rewrite `backend/server.ts` — remove dynamic file loader (`collectFiles`, `fileToRoute`, `app.all`), mount all routers via `app.use('/api', ...)`, keep `app.listen(3001)` conditional on `require.main === module`
- [x] 5.2 Create `backend/vercel-adapter.ts` — imports `app` from `server.ts` and exports it as default (no `listen` call)

## 6. Cleanup and Verification

- [x] 6.1 Delete all files under `backend/api/` (the old handler files are fully replaced by controllers + routes)
- [x] 6.2 Smoke test all routes manually: trips CRUD, items CRUD, segments CRUD, tags CRUD, invite generate/accept
- [ ] 6.3 Verify frontend works end-to-end with the refactored backend (start both dev servers, exercise core flows in browser)
