## Context

The Nomado frontend currently uses a partial, ad-hoc shadcn setup: `button`, `dialog`, `input`, `badge`, and `skeleton` were manually scaffolded but the rest of the UI (cards, modals, headers, nav, form fields, toasts) is hand-rolled Tailwind with inline style overrides for colour. The `Button` component has been forked to add custom variants (`primary`, `cta`, `secondary`) using hard-coded hex/Tailwind colour names rather than CSS variables, meaning a palette swap requires hunting down every usage.

The new Nomado coastal palette (`#e0fbfc` → `#c2dfe3` → `#9db4c0` → `#5c6b73` → `#253237`) replaces the previous sky-blue/orange scheme. This design doc covers how to wire the palette into shadcn's CSS-variable theming layer and migrate every surface to a canonical shadcn component.

## Goals / Non-Goals

**Goals:**
- Every interactive or visual surface in the app is rendered with a shadcn component (no hand-rolled `<div className="bg-white rounded-2xl …">` standing in for a Card)
- Palette is expressed exclusively through CSS custom properties in `index.css`; no hex literals in component files
- `Button` reverts to the shadcn default variant set (`default`, `secondary`, `ghost`, `destructive`, `outline`); colour tokens drive appearance, not forked `cva` logic
- `design-system/design.md` is updated to document the shadcn-native approach and new palette

**Non-Goals:**
- Dark mode (not in scope for this change; CSS variable structure supports it in future)
- Redesigning UX flows, layouts, or information architecture
- Changes to backend, API, or Supabase schema
- Adding new features or pages

## Decisions

### D1: CSS Variable Palette Mapping

**Decision**: Map the Nomado coastal palette to shadcn's CSS variable names in `frontend/src/index.css` under `@layer base { :root { … } }`.

| CSS Variable | Hex | Role |
|---|---|---|
| `--background` | `#e0fbfc` | App background (Light Cyan) |
| `--card` | `#c2dfe3` | Card / surface background (Light Blue) |
| `--card-foreground` | `#253237` | Card text (Jet Black) |
| `--popover` | `#c2dfe3` | Popover / dropdown surface |
| `--popover-foreground` | `#253237` | Popover text |
| `--primary` | `#5c6b73` | Primary action (Blue Slate) |
| `--primary-foreground` | `#e0fbfc` | Primary button label |
| `--secondary` | `#9db4c0` | Secondary surface (Cool Steel) |
| `--secondary-foreground` | `#253237` | Secondary text |
| `--muted` | `#9db4c0` | Muted / placeholder surface |
| `--muted-foreground` | `#5c6b73` | Muted text |
| `--accent` | `#c2dfe3` | Accent / hover highlight |
| `--accent-foreground` | `#253237` | Accent text |
| `--destructive` | `#dc2626` | Danger (keep standard red) |
| `--border` | `#9db4c0` | Border colour |
| `--input` | `#9db4c0` | Input border |
| `--ring` | `#5c6b73` | Focus ring |
| `--foreground` | `#253237` | Default text (Jet Black) |

Values are expressed in HSL space for shadcn convention. A conversion pass will precede writing the file.

**Rationale**: Single source of truth — swap the `:root` block to retheme the entire app. Components remain unchanged.

**Alternatives considered**: Extending `tailwind.config` with named colours — works but requires referencing `text-nomado-primary` etc. everywhere; CSS variables propagate automatically through shadcn's component classes.

---

### D2: Full shadcn Component Installation

**Decision**: Run `npx shadcn@latest add --all` (or targeted adds) to scaffold all needed components into `frontend/src/components/ui/`. Components are source-copied, not runtime dependencies.

Components needed beyond current set:
- `card` — replaces hand-rolled trip cards, day sections, empty states
- `sheet` — replaces custom slide-over modals (segment modal, item form on mobile)
- `tabs` — replaces custom `SegmentNav` tab strip
- `dropdown-menu` — replaces custom action menus in `AppHeader` and `ItemCard`
- `avatar` — collaborator avatars
- `toast` / `sonner` — replace any inline error/success messages
- `select` — replaces custom dropdowns in forms
- `textarea` — item description field
- `label` — all form labels
- `separator` — visual dividers
- `alert` — error states (invite errors, 409 conflict)
- `tooltip` — icon button labels

**Rationale**: Using the official CLI ensures components are pinned to the correct Radix + Tailwind version and include accessibility primitives out of the box.

---

### D3: Button Variant Rationalisation

**Decision**: Delete the custom `buttonVariants` cva fork in `button.tsx`. Replace with shadcn's default variants, then override colours purely through CSS variables.

| Old variant | New variant |
|---|---|
| `primary` | `default` |
| `cta` | `default` + `data-cta` attribute for accent colour (or a single `cta` CSS class) |
| `secondary` | `secondary` |
| `ghost` | `ghost` |
| `danger` | `destructive` |
| `link` | `link` |

**Rationale**: Keeps the component aligned with shadcn updates; avoids maintaining a diverged cva config.

---

### D4: Component Migration Strategy

**Decision**: Migrate file by file, bottom-up (leaf components before pages).

Order:
1. `index.css` — CSS variables + Tailwind v4 config
2. `components/ui/*` — replace/add shadcn primitives
3. `components/AppHeader.tsx` → `NavigationMenu` or `header` + `Avatar` + `DropdownMenu`
4. `components/TripCard.tsx` → `Card`, `CardHeader`, `CardContent`, `CardFooter`, `Badge`
5. `components/DaySection.tsx` → `Card` + `Separator`
6. `components/ItemCard.tsx` → `Card` + `DropdownMenu`
7. `components/SegmentNav.tsx` → `Tabs`, `TabsList`, `TabsTrigger`
8. `components/InviteModal.tsx` → `Dialog` (already shadcn) + `Input` + `Button`
9. `components/SegmentModal.tsx` → `Dialog` + `Input` + `Select` + `Button`
10. `components/ItemFormModal.tsx` → `Dialog` + `Input` + `Textarea` + `Select` + `Label`
11. `components/CreateTripModal.tsx` → `Dialog` + `Input` + `Label` + `Button`
12. `components/PhotoUploader.tsx` → `Button` + shadcn `progress` (if needed)
13. `pages/LandingPage.tsx` → styled with CSS variables; `Button` for sign-in
14. `pages/Dashboard.tsx` → `Tabs` (my trips / shared), `Card` grid
15. `pages/TripDetailPage.tsx` → `Tabs` (via `SegmentNav`), `Sheet` for mobile forms
16. `pages/InviteAccept.tsx` → `Card` + `Alert`

---

### D5: design-system/design.md Update

**Decision**: Replace the "Open Sky" design system section with a "Nomado Coastal – shadcn Native" section documenting CSS variable names, palette, and component usage rules. The file lives at the repo root under `design-system/` (the existing path used by the nomado-app change).

## Risks / Trade-offs

- **Visual regression** → Mitigation: run the dev server and visually verify each page after migration; no automated snapshot tests exist yet
- **CTA orange loss** → The orange `cta` Button is prominent in the current design; the new palette has no orange. The `default` button in Blue Slate (`#5c6b73`) will serve as primary CTA — must verify it reads well as a call-to-action
- **shadcn Card background** → `--card: #c2dfe3` against `--background: #e0fbfc` is a subtle contrast; cards may need an explicit `border` to remain visually distinct
- **Tailwind v4 compat** → The project uses Tailwind v4's `@import "tailwindcss"` syntax; shadcn's generated code assumes v3-style config. Any `@apply` in scaffolded components must be verified against the v4 layer system

## Migration Plan

1. Run `npx shadcn@latest init` to generate / update `components.json` pointing at `frontend/src/components/ui/`
2. Run targeted `npx shadcn@latest add <component>` for each component listed in D2
3. Update `frontend/src/index.css` with CSS variable palette (HSL values)
4. Migrate components bottom-up per D4 order
5. Start dev server, verify each page visually
6. Update `design-system/design.md`

**Rollback**: Git revert — no database or API changes involved.

## Open Questions

- None — palette and component list are fully specified by the proposal.
