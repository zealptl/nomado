## Why

Trip planning with friends is stuck in Google Docs — flat, unstructured, and overwhelming. Nomado replaces the shared doc with a simple, elegant collaborative itinerary planner that keeps information hidden until it's needed, so groups can plan trips together without the noise.

## What Changes

This is a greenfield application. All capabilities are new.

- New React Vite frontend with split-panel trip view and mobile tab layout
- New Node/TypeScript backend API (Vercel serverless functions)
- Supabase database for trips, segments, days, items, users, and collaborators
- Supabase Storage for trip cover images and item photos
- Google + Apple OAuth via Supabase Auth
- Invite-link-based collaboration with optimistic concurrency control on item edits

## Capabilities

### New Capabilities

- `auth`: Google and Apple sign-in via Supabase Auth. Session management and protected routes.
- `trip-management`: CRUD for trips. Each trip has a name, destination (high-level), date range, and a user-uploaded cover photo.
- `trip-segments`: City/location segments within a trip (e.g., "Barcelona", "Valencia"). Each segment has a title and date range. Days that fall on a segment boundary display checkout/checkin indicators in the left panel.
- `itinerary-items`: CRUD for itinerary items scoped to a calendar day. Fields: title, location (text), maps link (URL), time (optional single or range), description, photos (user uploads), tags. Items within a day are drag-and-drop reorderable. Versioning (updated_at) prevents stale writes by collaborators.
- `tags`: Default tag set (food, drinks, stay, activity, going out) ships with the app. Users can add custom tags scoped per trip. Tags are used as filter pills on the day detail view.
- `image-uploads`: Users upload photos from their device for trip cover images and per-item photos. Stored in Supabase Storage.
- `collaboration`: Trip owners generate a single invite link. Anyone with the link can join the trip as a full editor. Joined trips appear in the "Shared with Me" section of the dashboard. All collaborators can add, edit, and reorder items.
- `trip-dashboard`: Post-login home screen. Split horizontally into "My Trips" and "Shared with Me". Each trip shown as a card with cover image, title, destination, and date range. Empty state on first login with a "Create your first trip" prompt.
- `trip-detail-view`: The core planning UI. Left panel: hierarchical nav of segments and days, with checkout/checkin boundary indicators. A day can appear in two segments if it straddles a boundary. Right panel: full scrollable timeline of all days and their items. Clicking a day in the left panel smooth-scrolls to it. Per-day filter pills (tags) to show/hide item types.
- `landing-page`: Minimal gateway page. Beautiful visual, app name "Nomado", and two sign-in buttons (Google, Apple). No marketing content.

### Modified Capabilities

*(none — greenfield)*

## Impact

- **Frontend**: React + Vite, deployed to Vercel. No existing codebase.
- **Backend**: Node/TypeScript serverless functions, deployed to Vercel.
- **Database**: Supabase (Postgres). New project required.
- **Storage**: Supabase Storage buckets for cover images and item photos.
- **Auth**: Supabase Auth with Google OAuth and Apple OAuth providers.
- **Dependencies**: React, Vite, TypeScript, Supabase JS client, dnd-kit (drag and drop), Lucide React (icons), Tailwind CSS, Playfair Display + Inter (Google Fonts).
