## ADDED Requirements

### Requirement: Authentication middleware validates JWT and attaches user
The `authenticate` middleware in `backend/middleware/auth.ts` SHALL extract the Bearer token from the `Authorization` header, verify it with Supabase, and attach the resolved `User` object to `req.user` before passing control to the next handler. If the token is missing or invalid it SHALL return 401.

#### Scenario: Valid token grants access
- **WHEN** a request is made with a valid `Authorization: Bearer <token>` header
- **THEN** `req.user` is populated with the authenticated user and `next()` is called

#### Scenario: Missing token returns 401
- **WHEN** a request is made with no `Authorization` header
- **THEN** the middleware returns `401 { error: 'Unauthorized' }` and the handler is never called

#### Scenario: Invalid token returns 401
- **WHEN** a request is made with an expired or malformed Bearer token
- **THEN** the middleware returns `401 { error: 'Unauthorized' }` and the handler is never called

### Requirement: Trip access middleware gates requests to owned or collaborated trips
The `verifyTripAccess` middleware in `backend/middleware/tripAccess.ts` SHALL look up the trip by `req.params.id`, check whether `req.user.id` is the owner or an active collaborator, attach `req.trip` and `req.isOwner` to the request, and call `next()`. If the trip does not exist or the user has no access it SHALL return 403.

#### Scenario: Owner gains access with isOwner true
- **WHEN** `req.user.id` matches `trip.owner_id`
- **THEN** `req.trip` is the trip record, `req.isOwner` is `true`, and `next()` is called

#### Scenario: Collaborator gains access with isOwner false
- **WHEN** `req.user.id` exists in `trip_collaborators` for the trip
- **THEN** `req.trip` is the trip record, `req.isOwner` is `false`, and `next()` is called

#### Scenario: Unauthorized user returns 403
- **WHEN** `req.user.id` is neither owner nor collaborator
- **THEN** the middleware returns `403 { error: 'Access denied' }`

### Requirement: requireOwner middleware enforces ownership
The `requireOwner` middleware SHALL check `req.isOwner` (set by `verifyTripAccess`) and return 403 if false.

#### Scenario: Non-owner is rejected
- **WHEN** `req.isOwner` is `false`
- **THEN** the middleware returns `403 { error: 'Only the trip owner can do this' }`

#### Scenario: Owner passes through
- **WHEN** `req.isOwner` is `true`
- **THEN** `next()` is called

### Requirement: Express routers dispatch by HTTP verb
Each resource group SHALL have an `express.Router()` in `backend/routes/` that uses `.get()`, `.post()`, `.patch()`, `.delete()` to register handlers — no `if (req.method === ...)` logic in controllers.

#### Scenario: GET and POST on same path go to different handlers
- **WHEN** `GET /api/trips` is received
- **THEN** `listTrips` controller is called, not `createTrip`

#### Scenario: Unsupported method returns 404/405
- **WHEN** `PUT /api/trips` is received (not registered)
- **THEN** Express returns its default 404, never reaching any controller

### Requirement: AuthenticatedRequest type provides typed req.user
`backend/types/index.ts` SHALL export an `AuthenticatedRequest` interface extending Express `Request` with a non-optional `user: User` field and an optional `trip` and `isOwner` field. All controller functions SHALL use this type instead of `any`.

#### Scenario: Controller accesses req.user without type assertion
- **WHEN** a controller function is typed as `(req: AuthenticatedRequest, res: Response)`
- **THEN** `req.user.id` is accessible without casting and TypeScript does not error

### Requirement: TypeScript interfaces cover all DB row shapes
`backend/types/index.ts` SHALL export interfaces for: `Trip`, `ItineraryItem`, `ItemPhoto`, `TripSegment`, `TripTag`, `TripCollaborator`, `TripInvite`. These SHALL match the column shapes returned by Supabase queries.

#### Scenario: Controller uses typed DB result
- **WHEN** a Supabase query returns a row
- **THEN** the result can be assigned to the corresponding interface without `as any` casting

### Requirement: Vercel adapter exports Express app for serverless deployment
`backend/vercel-adapter.ts` SHALL import the Express `app` from `server.ts` and export it as the default export, enabling Vercel to wrap it as a serverless function. The app SHALL NOT call `app.listen()` when imported this way.

#### Scenario: Vercel invokes the adapter
- **WHEN** Vercel routes a request to the adapter
- **THEN** the full Express app (with all routers and middleware) handles the request and returns a response

#### Scenario: Local dev server still starts normally
- **WHEN** `server.ts` is run directly via `tsx server.ts`
- **THEN** `app.listen(3001)` is called and the server accepts connections
