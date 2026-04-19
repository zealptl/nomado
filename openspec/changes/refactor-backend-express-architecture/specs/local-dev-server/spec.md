## MODIFIED Requirements

### Requirement: Express server serves backend API handlers on port 3001
`backend/server.ts` SHALL start an Express HTTP server on port 3001 that serves all API routes by explicitly mounting Express routers (not auto-registering handlers via filesystem scanning). Routes SHALL be registered using `app.use('/api', router)` with named router modules from `backend/routes/`.

#### Scenario: Server starts and route is reachable
- **WHEN** `npm run dev` is run from `backend/`
- **THEN** the server starts on port 3001 and `GET /api/trips` returns a response from the trips router

#### Scenario: Dynamic segment resolves correctly
- **WHEN** a request is made to `/api/trips/abc123`
- **THEN** the trips router handles it with `req.params.id === "abc123"`

#### Scenario: Nested dynamic route resolves correctly
- **WHEN** a request is made to `/api/trips/abc123/items/xyz456`
- **THEN** the items router handles it with `req.params.id === "abc123"` and `req.params.itemId === "xyz456"`

#### Scenario: Static segment takes priority over dynamic segment
- **WHEN** a request is made to `/api/trips/abc123/items/reorder`
- **THEN** the reorder handler is invoked, not the `/:itemId` handler

## REMOVED Requirements

### Requirement: File-based route auto-registration via filesystem scanning
**Reason**: Replaced by explicit Express router mounting. The `collectFiles` / `fileToRoute` dynamic loader in `server.ts` is removed as part of this refactor.
**Migration**: All routes are now explicitly registered in `backend/routes/` and mounted in `server.ts` via `app.use()`.
