## Git Workflow (apply to every task group below)

Each task group below is its own feature branch, PR, and merge cycle:

1. `git checkout -b feat/<branch-name>` (branch name listed per group)
2. Implement all tasks in the group
3. `git add` and `git commit` with a descriptive message
4. `gh pr create` with a clear title and summary
5. Merge to `main` before starting the next group

---

## 1. Project Setup
**Branch:** `feat/project-setup`

- [x] 1.1 Initialise React + Vite + TypeScript frontend in `frontend/`
- [x] 1.2 Initialise Node + TypeScript backend for Vercel serverless functions in `backend/`
- [x] 1.3 Install frontend dependencies: `@supabase/supabase-js`, `@dnd-kit/core`, `@dnd-kit/sortable`, `lucide-react`, `tailwindcss`, `react-router-dom`
- [x] 1.4 Configure Tailwind with the Nomado design tokens: colors (`#F5F0E1`, `#5C7A5F`, `#C67B5C`, `#D4C4A8`, `#2C1A0E`, `#7C6A5A`), font families (`Playfair Display`, `Inter`)
- [x] 1.5 Add Google Fonts import for `Playfair Display` + `Inter` to `index.html`
- [x] 1.6 Create global CSS with glassmorphism card utility (`.glass-card`), button styles, input styles, and pill styles per `design-system/nomado/MASTER.md`
- [x] 1.7 Set up Supabase project (Auth, Postgres, Storage) and add environment variables to `.env.local`
- [x] 1.8 Create Supabase client singleton in `frontend/src/lib/supabase.ts`
- [x] 1.9 Configure `vercel.json` for monorepo deployment of frontend and backend
- [x] 1.10 Create PR and merge to `main`

---

## 2. Database Schema & RLS
**Branch:** `feat/database-schema`

- [x] 2.1 Create `profiles` table (`id` FK to auth.users, `full_name`, `avatar_url`)
- [x] 2.2 Create `trips` table (`id`, `owner_id`, `name`, `destination`, `start_date`, `end_date`, `cover_image_url`, `created_at`)
- [x] 2.3 Create `trip_segments` table (`id`, `trip_id`, `title`, `start_date`, `end_date`, `created_at`)
- [x] 2.4 Create `itinerary_items` table (`id`, `trip_id`, `date`, `title`, `location`, `maps_url`, `time_start`, `time_end`, `description`, `position` float, `tags` text[], `updated_at`, `created_at`)
- [x] 2.5 Create `item_photos` table (`id`, `item_id`, `storage_url`, `created_at`)
- [x] 2.6 Create `trip_collaborators` table (`id`, `trip_id`, `user_id`, `joined_at`)
- [x] 2.7 Create `trip_tags` table (`id`, `trip_id`, `name`) for custom per-trip tags
- [x] 2.8 Create `trip_invites` table (`id`, `trip_id`, `token`, `expires_at`, `created_at`)
- [x] 2.9 Write RLS policies: trip owner has full access; collaborators can read/write items and segments; no access for non-members
- [x] 2.10 Create Supabase Storage buckets: `trip-covers` (public) and `item-photos` (public)
- [x] 2.11 Set Storage policies: authenticated users can upload; public read access
- [x] 2.12 Create PR and merge to `main`

---

## 3. Authentication
**Branch:** `feat/auth`

- [ ] 3.1 Enable Google OAuth provider in Supabase Auth dashboard and configure redirect URL
- [ ] 3.2 Enable Apple OAuth provider in Supabase Auth dashboard and configure Apple Developer credentials
- [x] 3.3 Build `LandingPage` component: full-bleed warm cream background, centered glassmorphism panel, "Nomado" in Playfair Display, "Sign in with Google" and "Sign in with Apple" buttons (SVG brand icons, not emojis)
- [x] 3.4 Wire sign-in buttons to `supabase.auth.signInWithOAuth({ provider })` calls
- [x] 3.5 Create `AuthCallback` page at `/auth/callback` to handle OAuth redirect and session exchange
- [x] 3.6 Create `useAuth` hook that subscribes to `supabase.auth.onAuthStateChange`
- [x] 3.7 Create `ProtectedRoute` component that redirects unauthenticated users to `/`
- [x] 3.8 Redirect authenticated users away from `/` to `/dashboard`
- [x] 3.9 Add sign-out button in app header wired to `supabase.auth.signOut()`
- [ ] 3.10 Create PR and merge to `main`

---

## 4. Trip Management API
**Branch:** `feat/trip-management-api`

- [x] 4.1 Create `POST /api/trips` — create trip (name, destination, start_date, end_date, cover_image_url)
- [x] 4.2 Create `GET /api/trips` — list trips owned by the authenticated user
- [x] 4.3 Create `GET /api/trips/shared` — list trips where the user is a collaborator
- [x] 4.4 Create `GET /api/trips/:id` — get trip detail (validates owner or collaborator access)
- [x] 4.5 Create `PATCH /api/trips/:id` — update trip fields (owner only)
- [x] 4.6 Create `DELETE /api/trips/:id` — delete trip and cascade: segments, items, photos, collaborators, invites (owner only)
- [x] 4.7 Create PR and merge to `main`

---

## 5. Trip Dashboard UI
**Branch:** `feat/trip-dashboard-ui`

- [x] 5.1 Build `Dashboard` page layout with "My Trips" and "Shared with Me" sections split horizontally
- [x] 5.2 Build `TripCard` component: glassmorphism card with cover image, title, destination, formatted date range, `cursor-pointer`, 200ms hover lift
- [x] 5.3 Build empty state for "My Trips" with "Create your first trip" CTA
- [x] 5.4 Build empty state for "Shared with Me"
- [x] 5.5 Build `CreateTripModal` component: modal with name, destination, date range, and optional cover photo upload fields
- [x] 5.6 Wire `CreateTripModal` to `POST /api/trips` and refresh trip list on success
- [x] 5.7 Wire trip cards to navigate to `/trips/:id`
- [x] 5.8 Create PR and merge to `main`

---

## 6. Image Upload
**Branch:** `feat/image-uploads`

- [x] 6.1 Create `useImageUpload` hook: accepts a file, validates ≤5MB client-side, uploads to the specified Supabase Storage bucket, returns the public URL
- [x] 6.2 Wire cover photo upload in `CreateTripModal` to `trip-covers` bucket
- [x] 6.3 Create `PhotoUploader` component for item photos: multi-file picker, 5MB per-file validation, upload to `item-photos` bucket, display thumbnail previews
- [x] 6.4 Create PR and merge to `main`

---

## 7. Segments API
**Branch:** `feat/segments-api`

- [x] 7.1 Create `POST /api/trips/:id/segments` — create segment (title, start_date, end_date); validate dates fall within trip date range
- [x] 7.2 Create `GET /api/trips/:id/segments` — list segments for a trip
- [x] 7.3 Create `PATCH /api/trips/:id/segments/:segId` — update segment
- [x] 7.4 Create `DELETE /api/trips/:id/segments/:segId` — delete segment
- [ ] 7.5 Create PR and merge to `main`

---

## 8. Itinerary Items API
**Branch:** `feat/items-api`

- [ ] 8.1 Create `POST /api/trips/:id/items` — create item (date, title, location, maps_url, time_start, time_end, description, tags, position)
- [ ] 8.2 Create `GET /api/trips/:id/items` — list all items for a trip grouped by date
- [ ] 8.3 Create `PATCH /api/trips/:id/items/:itemId` — update item; require `updated_at` in body; return HTTP 409 if `updated_at` mismatch
- [ ] 8.4 Create `DELETE /api/trips/:id/items/:itemId` — delete item and associated photos from Storage
- [ ] 8.5 Create `PATCH /api/trips/:id/items/reorder` — accept ordered array of `{ id, position }` for a given date; update positions in a single transaction
- [ ] 8.6 Create PR and merge to `main`

---

## 9. Tags API
**Branch:** `feat/tags-api`

- [ ] 9.1 Create `GET /api/trips/:id/tags` — return default tags merged with custom trip tags
- [ ] 9.2 Create `POST /api/trips/:id/tags` — create a custom tag for a trip
- [ ] 9.3 Create `DELETE /api/trips/:id/tags/:tagId` — delete a custom tag (only if no items reference it)
- [ ] 9.4 Create PR and merge to `main`

---

## 10. Collaboration & Invite Links
**Branch:** `feat/collaboration`

- [ ] 10.1 Create `POST /api/trips/:id/invite` — generate a signed JWT invite token (7-day expiry), store in `trip_invites`, return the full invite URL
- [ ] 10.2 Create `POST /api/trips/:id/invite/refresh` — regenerate invite token (invalidates old one)
- [ ] 10.3 Create `POST /api/invite/accept` — validate invite token, check expiry, add user to `trip_collaborators` (idempotent), return trip ID
- [ ] 10.4 Build `InviteModal` component: shows copyable invite link, "Copy Link" button wired to clipboard API
- [ ] 10.5 Wire "Invite" button in trip header (owner only) to open `InviteModal`
- [ ] 10.6 Build `InviteAccept` page at `/invite/:token`: if authenticated call accept API then redirect to trip; if not authenticated redirect to `/` preserving token in query param
- [ ] 10.7 Handle invite token after post-login redirect in `AuthCallback`: check for `invite_token` query param and call accept API
- [ ] 10.8 Create PR and merge to `main`

---

## 11. Trip Detail View
**Branch:** `feat/trip-detail-view`

- [ ] 11.1 Build `TripDetailPage` layout: fixed left panel (280px) + scrollable right panel; on mobile render two tabs "Overview" / "Days"
- [ ] 11.2 Build `SegmentNav` component for left panel: segments as headers, days as links beneath each; render boundary days under two segments with checkout/checkin badges
- [ ] 11.3 Implement smooth-scroll to day on left panel day click using `scrollIntoView`
- [ ] 11.4 Implement active day highlight in left panel using `IntersectionObserver` on day section headers
- [ ] 11.5 Build `DaySection` component: day header with formatted date + tag filter pills + "Add Item" button, followed by item list
- [ ] 11.6 Build `ItemCard` component: compact view showing title, location, time, and tag pills; photos collapsed by default, expandable; edit and delete actions on hover/tap
- [ ] 11.7 Build `AddItemModal` / `EditItemModal`: form with all item fields (title, location, maps_url, time, description, tags, photos via `PhotoUploader`)
- [ ] 11.8 Wire `AddItemModal` to `POST /api/trips/:id/items`
- [ ] 11.9 Wire `EditItemModal` to `PATCH /api/trips/:id/items/:itemId` with `updated_at`; handle 409 with "Item was updated by someone else, please refresh" toast
- [ ] 11.10 Wire item delete to `DELETE /api/trips/:id/items/:itemId` with confirmation
- [ ] 11.11 Build `AddSegmentModal` / `EditSegmentModal` and wire to segment API
- [ ] 11.12 Create PR and merge to `main`

---

## 12. Drag and Drop Reordering
**Branch:** `feat/drag-and-drop`

- [ ] 12.1 Wrap each `DaySection` item list in `@dnd-kit/core` `DndContext` with `SortableContext`
- [ ] 12.2 Make each `ItemCard` a sortable item using `useSortable` hook
- [ ] 12.3 On drag end, compute new float positions (insert between adjacent items' positions) and call `PATCH /api/trips/:id/items/reorder`
- [ ] 12.4 Add position normalisation: if smallest gap between any two adjacent positions is < 0.001, reset all positions to 1.0, 2.0, 3.0...
- [ ] 12.5 Create PR and merge to `main`

---

## 13. Tag Filtering UI
**Branch:** `feat/tag-filtering`

- [ ] 13.1 Render tag pills in each `DaySection` header for all tags present in that day's items
- [ ] 13.2 Implement active/inactive pill toggle state per day (independent across days)
- [ ] 13.3 Filter displayed items in `DaySection` based on active pills (OR logic; show all if no pills active)
- [ ] 13.4 Create PR and merge to `main`

---

## 14. Polish & Accessibility
**Branch:** `feat/polish`

- [ ] 14.1 Audit all interactive elements for `cursor-pointer` and visible focus states
- [ ] 14.2 Add `aria-label` to all icon-only buttons
- [ ] 14.3 Verify all text meets 4.5:1 contrast ratio against backgrounds
- [ ] 14.4 Add `prefers-reduced-motion` media query to disable transitions/animations
- [ ] 14.5 Test glassmorphism fallback: add `@supports (backdrop-filter: blur(1px))` guard with solid `bg-white/90` fallback
- [ ] 14.6 Verify responsive layout at 375px, 768px, 1024px, 1440px
- [ ] 14.7 Verify no horizontal scroll on mobile viewports
- [ ] 14.8 Create PR and merge to `main`

---

## 15. Vercel Deployment
**Branch:** `feat/deployment`

- [ ] 15.1 Configure Vercel project with environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `INVITE_JWT_SECRET`)
- [ ] 15.2 Set Supabase Auth redirect URLs for the Vercel production and preview domains
- [ ] 15.3 Configure Apple OAuth with the production domain in Apple Developer Console
- [ ] 15.4 Deploy to Vercel and smoke-test full flow: sign in → create trip → add segment → add items → invite collaborator → collaborator edits items
- [ ] 15.5 Create PR and merge to `main`
