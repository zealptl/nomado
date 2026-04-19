## ADDED Requirements

### Requirement: Express server serves backend API handlers on port 3001
`backend/server.ts` SHALL start an Express HTTP server on port 3001 that auto-registers all handlers found under `backend/api/` using filesystem-based routing.

#### Scenario: Server starts and handler is reachable
- **WHEN** `npm run dev` is run from `backend/`
- **THEN** the server starts on port 3001 and `GET /api/trips` returns a response from the trips handler

#### Scenario: File-based route with dynamic segment resolves correctly
- **WHEN** a request is made to `/api/trips/abc123`
- **THEN** the handler at `backend/api/trips/[id]/index.ts` is invoked with `req.params.id === "abc123"`

#### Scenario: Nested dynamic route resolves correctly
- **WHEN** a request is made to `/api/trips/abc123/items/xyz456`
- **THEN** the handler at `backend/api/trips/[id]/items/[itemId]/index.ts` is invoked with correct params

#### Scenario: Static segment takes priority over dynamic segment
- **WHEN** a request is made to `/api/trips/abc123/items/reorder`
- **THEN** the handler at `backend/api/trips/[id]/items/reorder.ts` is invoked, not the `[itemId]` handler

### Requirement: Vite proxy forwards frontend API calls to Express server
`frontend/vite.config.ts` SHALL configure a dev server proxy that forwards all `/api/**` requests to `http://localhost:3001`.

#### Scenario: Frontend fetch reaches backend handler
- **WHEN** the frontend calls `fetch("/api/trips")` during local development
- **THEN** the request is proxied to `http://localhost:3001/api/trips` and the response is returned to the caller

#### Scenario: Proxy preserves request method and body
- **WHEN** the frontend sends a `POST /api/trips` request with a JSON body
- **THEN** the proxied request to the Express server carries the same method and body

### Requirement: Backend dev script supports hot-reloading
The `"dev"` script in `backend/package.json` SHALL use `tsx --watch` so that changes to handler files restart the server automatically.

#### Scenario: Handler file change triggers restart
- **WHEN** a `.ts` file under `backend/api/` is saved during development
- **THEN** the Express server restarts and subsequent requests use the updated handler

### Requirement: JSON request bodies are parsed automatically
The Express server SHALL apply `express.json()` middleware globally so handler files receive a pre-parsed `req.body` object.

#### Scenario: Handler receives parsed body
- **WHEN** a `POST` request is made with `Content-Type: application/json` and a JSON body
- **THEN** `req.body` in the handler is a JavaScript object, not a raw string
