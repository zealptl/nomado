## Context

Nomado is a greenfield collaborative trip itinerary planner. There is no existing codebase. The stack is React + Vite (frontend), Node/TypeScript serverless functions (backend), and Supabase (Postgres + Auth + Storage), all deployed to Vercel.

The core design principle is **progressive disclosure** — information is hidden until needed, revealed via toggles, filters, and drill-down. This must drive every UI and API decision.

## Goals / Non-Goals

**Goals:**
- Working collaborative trip planner with auth, trip CRUD, itinerary item CRUD, invite-link collaboration, image uploads, and drag-and-drop reordering
- Desktop split-panel UI with mobile tab layout
- Optimistic concurrency control to prevent stale writes
- Clean design system: glassmorphism on warm cream base, sage green primary, Playfair Display + Inter

**Non-Goals:**
- Real-time collaboration (no WebSockets, no live cursors)
- Role-based permissions (viewer vs. editor) — all collaborators are full editors
- Notifications (email, push, or in-app)
- Native mobile apps
- Offline support

## Decisions

### D1: Supabase for Auth, Database, and Storage

**Decision**: Use Supabase for all three — Auth (Google + Apple OAuth), Postgres database, and Storage for images.

**Rationale**: Single vendor reduces integration surface. Supabase Auth handles OAuth provider flows out of the box. Row Level Security (RLS) policies on Postgres enforce data access at the DB layer. Storage integrates with the same auth tokens.

**Alternatives considered**:
- Separate auth provider (Auth0, Clerk): More flexible but extra vendor, extra cost, extra integration.
- Manual JWT + Postgres: Full control but significant auth plumbing.

---

### D2: Versioning via `updated_at` for Optimistic Concurrency

**Decision**: Each itinerary item carries an `updated_at` timestamp. On update, the client sends the `updated_at` it last saw. The API rejects the write if the stored `updated_at` is newer, returning HTTP 409 Conflict.

**Rationale**: Simple to implement, no additional schema columns needed, fits the async collaboration model. Users see a clear "this item was updated by someone else, please refresh" message.

**Alternatives considered**:
- Integer `version` field: Slightly more explicit but `updated_at` is already useful for display.
- Last-write-wins (no check): Risk of silently overwriting a collaborator's edit.

---

### D3: Invite Links as Signed Tokens

**Decision**: Invite links encode `tripId` in a short-lived signed token (JWT, 7-day expiry). When a user visits the link and logs in, the backend validates the token and inserts a `trip_collaborators` row.

**Rationale**: Avoids exposing raw UUIDs in shareable URLs. Token expiry limits exposure if a link leaks. The trip owner can regenerate a new token to invalidate old links.

**Alternatives considered**:
- Raw trip UUID in URL: Simpler but any guessable/leaked UUID grants access forever.
- Database-stored invite codes: More control (revoke anytime) but more complexity for v1.

---

### D4: Drag-and-Drop with dnd-kit

**Decision**: Use `@dnd-kit/core` and `@dnd-kit/sortable` for within-day item reordering. Order is stored as a float `position` field on each item, allowing insertion between items without renumbering.

**Rationale**: dnd-kit is accessible, framework-native (React), and has no jQuery dependency. Float positions (e.g., 1.0, 2.0 → insert at 1.5) avoid full-list rewrite on every drag.

**Alternatives considered**:
- `react-beautiful-dnd`: Unmaintained.
- Integer positions: Require renumbering all subsequent items on every drop.

---

### D5: Day as a Derived Concept

**Decision**: Days are not stored as rows in the database. They are derived from the trip's date range. Each itinerary item stores a `date` field (a calendar date). The frontend groups items by date to render days.

**Rationale**: Eliminates a "days" table and the sync complexity of keeping it aligned with the trip date range. Adding/extending a trip just changes start/end dates.

**Alternatives considered**:
- Explicit `days` table: More normalized but introduces sync overhead.

---

### D6: Segments with Boundary-Day Logic

**Decision**: A segment stores `{ title, start_date, end_date }`. A day is considered a "boundary day" if it equals the `end_date` of one segment AND the `start_date` of the next segment. The frontend renders it under both segments with checkout/checkin badges — no extra DB field needed.

---

### D7: Tags — Default + Per-Trip Custom

**Decision**: A `default_tags` list is hardcoded in the frontend (`food`, `drinks`, `stay`, `activity`, `going out`). Custom tags are stored in a `trip_tags` table scoped to a trip. Items reference tags by name string (not FK) to keep it simple.

**Rationale**: Avoids a tags normalization table for v1. Per-trip scope means custom tags don't bleed across trips.

---

### D8: Design System

All frontend work MUST follow the Nomado design system defined in `design-system/nomado/MASTER.md`. Key rules:

- **Colors**: Background `#F5F0E1` (soft cream), Primary `#5C7A5F` (sage green), Text `#2C1A0E` (deep warm brown)
- **Typography**: `Playfair Display` for all headings (h1–h4), `Inter` for body, inputs, buttons
- **Style**: Glassmorphism cards — `backdrop-filter: blur(15px)`, `background: rgba(255,255,255,0.6)`, `border: 1px solid rgba(255,255,255,0.3)`, `border-radius: 16px`
- **Light mode only** — no dark mode
- **Icons**: Lucide React only — no emojis as icons
- **Transitions**: 150–300ms ease-out on all interactive elements
- **Mobile**: Two tabs ("Overview" | "Days") — split panel collapses on mobile

Full spec: `design-system/nomado/MASTER.md`

---

### D9: Project Structure

```
nomado/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/       # supabase client, api helpers
│   │   └── types/
│   └── vite.config.ts
├── backend/           # Node/TypeScript serverless
│   ├── api/           # Vercel API routes
│   └── lib/           # supabase admin, helpers
├── design-system/
│   └── nomado/
│       └── MASTER.md
└── openspec/
```

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Apple Sign-In requires HTTPS + registered domain | Use Supabase's redirect URL in dev; configure custom domain before prod |
| Glassmorphism `backdrop-filter` not supported in all browsers | Use `@supports (backdrop-filter: blur(...))` with solid fallback |
| Float position field drifts to precision issues after many reorders | Normalize positions (reset to 1.0, 2.0, 3.0...) when gap < 0.001 |
| Invite token leaks grant trip edit access | 7-day expiry + owner can regenerate token to invalidate |
| Supabase RLS misconfiguration exposes data | Write RLS policies first, test with anon key before building UI |
| Image uploads — large files slow the app | Enforce 5MB limit client-side; use Supabase Storage transform for thumbnails |

## Open Questions

- Should the trip owner be able to remove a collaborator after they've joined? (Not in v1 scope, but worth noting for later)
- What happens to a trip when the owner deletes their account? (Defer to v2)
