## 1. CSS Variables & Tailwind Config

- [x] 1.1 Convert Nomado coastal hex palette to HSL and write CSS custom properties in `frontend/src/index.css` under `@layer base { :root { … } }` (background, card, foreground, primary, secondary, muted, accent, destructive, border, input, ring, popover)
- [x] 1.2 Verify Tailwind v4 `@import "tailwindcss"` still works after CSS variable additions and that shadcn's `cn` utility resolves correctly

## 2. shadcn Component Installation

- [x] 2.1 Run `npx shadcn@latest init` to create/update `frontend/components.json` pointing at `frontend/src/components/ui/`
- [x] 2.2 Add missing shadcn components: `card`, `tabs`, `dropdown-menu`, `avatar`, `sonner`, `select`, `separator`, `alert`, `tooltip`, `sheet`, `progress`
- [x] 2.3 Verify all newly scaffolded components compile without TypeScript errors (`tsc --noEmit`)

## 3. Button Component

- [x] 3.1 Replace the custom `buttonVariants` fork in `frontend/src/components/ui/button.tsx` with shadcn's canonical variant set (`default`, `secondary`, `ghost`, `destructive`, `outline`, `link`)
- [x] 3.2 Update all usages of `variant="primary"` → `variant="default"` and `variant="cta"` → `variant="default"` across all component and page files
- [x] 3.3 Update `variant="danger"` → `variant="destructive"` across all usages

## 4. Leaf Components

- [x] 4.1 Refactor `TripCard.tsx` to use `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Badge` — remove all inline `style={}` colour overrides
- [x] 4.2 Refactor `ItemCard.tsx` to use `Card`, `CardContent`, `DropdownMenu` for action menu, `Badge` for tags
- [x] 4.3 Refactor `DaySection.tsx` to use `Card` wrapper and `Separator` for visual dividers
- [x] 4.4 Refactor `SegmentNav.tsx` to use `Tabs`, `TabsList`, `TabsTrigger` in place of the custom tab strip
- [x] 4.5 Refactor `AppHeader.tsx` to use `Avatar` for user avatar and `DropdownMenu` for the user menu

## 5. Modal Components

- [x] 5.1 Refactor `CreateTripModal.tsx` — `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `Input`, `Label`, `Button`
- [x] 5.2 Refactor `SegmentModal.tsx` — `Dialog`, `Input`, `Select`, `Label`, `Button`
- [x] 5.3 Refactor `ItemFormModal.tsx` — `Dialog`, `Input`, `Textarea`, `Select`, `Label`, `Button`; replace any custom tag-picker with `Badge` + `Button` toggle pattern
- [x] 5.4 Refactor `InviteModal.tsx` — already uses `Dialog`; update to use `Input`, `Label`, `Button` from updated library; add `Tooltip` on copy button
- [x] 5.5 Refactor `PhotoUploader.tsx` — use shadcn `Button` for upload trigger; add `Progress` if upload progress is shown

## 6. Pages

- [x] 6.1 Refactor `LandingPage.tsx` — replace all inline `style={{ background: … }}` with CSS variable classes; keep sign-in `Button` as `variant="default"`
- [x] 6.2 Refactor `Dashboard.tsx` — use `Tabs` / `TabsList` / `TabsTrigger` for My Trips / Shared Trips toggle; wrap empty states in `Card`
- [x] 6.3 Refactor `TripDetailPage.tsx` — verify it picks up refactored `SegmentNav` (Tabs) and modal components; add `Sheet` for mobile item form if needed
- [x] 6.4 Refactor `InviteAccept.tsx` — use `Card` for the accept prompt and `Alert` for error states

## 7. Design System Docs

- [x] 7.1 Update (or create) `design-system/design.md` with a "Nomado Coastal – shadcn Native" section: palette table (name → hex → CSS variable), full component catalogue, and the rule that no hand-rolled card/modal/button styling is permitted

## 8. Visual QA

- [x] 8.1 Start dev server (`npm run dev` in `frontend/`) and verify LandingPage renders correctly with new palette
- [x] 8.2 Verify Dashboard — trip cards, empty states, tabs, and header all display correctly
- [x] 8.3 Verify TripDetailPage — segment tabs, day sections, item cards, and modals all display correctly
- [x] 8.4 Verify all modal open/close flows (create trip, add item, edit segment, invite) work without regressions
- [x] 8.5 Verify no hard-coded hex colours remain in component files (`grep -r "#[0-9a-fA-F]\{3,6\}" frontend/src/components frontend/src/pages`)
