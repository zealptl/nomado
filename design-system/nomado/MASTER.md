# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Nomado
**Updated:** 2026-04-20
**Design Pattern:** shadcn/ui Native — Nomado Coastal palette
**Category:** Collaborative Travel Itinerary Planner

---

## Core Rule

Every interactive or visual surface MUST use a canonical shadcn/ui component from `frontend/src/components/ui/`.
No hand-rolled card, modal, or button styling is permitted.
All colours MUST be expressed through the CSS custom properties below — no hex literals or hard-coded Tailwind colour names (e.g. `bg-sky-500`) in component files.

---

## Global Rules

### Colour Palette — Nomado Coastal

| Name | Hex | CSS Variable | Role |
|------|-----|--------------|------|
| Light Cyan | `#e0fbfc` | `--background` | App / page background |
| Light Blue | `#c2dfe3` | `--card` | Card / surface background |
| Cool Steel | `#9db4c0` | `--secondary`, `--muted` | Secondary surfaces, muted elements |
| Blue Slate | `#5c6b73` | `--primary`, `--muted-foreground` | Primary actions, active states |
| Jet Black | `#253237` | `--foreground`, `--card-foreground` | All body text |

**Derived tokens (also CSS variables):**

| CSS Variable | Role |
|---|---|
| `--primary-foreground` | Text on primary-coloured surfaces (`#e0fbfc`) |
| `--secondary-foreground` | Text on secondary surfaces (`#253237`) |
| `--accent` | Hover / highlight tint |
| `--accent-foreground` | Text on accent surfaces |
| `--destructive` | Danger / error (standard red, `hsl(0 84% 60%)`) |
| `--border` | All border colours |
| `--input` | Input border colour |
| `--ring` | Focus ring colour |

**Tailwind utilities** (generated via `@theme inline` in `index.css`):
Use `bg-background`, `text-foreground`, `bg-primary`, `text-primary`, `text-muted-foreground`, `border-border`, `bg-card`, `text-card-foreground`, `bg-accent`, `bg-destructive`, `text-destructive`, etc.

### Typography

- **Heading font:** Plus Jakarta Sans (`font-display` utility)
- **Body font:** Inter (`font-sans` utility)
- **Usage:** Apply `font-display` to all `<h1>`–`<h4>` and brand text. Body copy inherits `font-sans` from `body`.

### Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `0.5rem` | Small elements (badges, icon buttons) |
| `--radius-md` | `0.625rem` | Default inputs, tight components |
| `--radius-lg` | `0.75rem` | Cards, modals |
| `--radius-xl` | `1rem` | Large hero cards |

---

## shadcn Component Catalogue

All components are sourced from `frontend/src/components/ui/`. Install new components with `npx shadcn@latest add <name>`.

| Component | Import | Use for |
|---|---|---|
| `Button` | `@/components/ui/button` | All interactive buttons. Variants: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link` |
| `Card` | `@/components/ui/card` | Trip cards, day section wrappers, empty states |
| `Dialog` | `@/components/ui/dialog` | All modals (create trip, add item, segment, invite) |
| `Input` | `@/components/ui/input` | All text / date / time / url inputs |
| `Textarea` | `@/components/ui/input` (re-exported) | Multi-line text fields |
| `Label` | `@/components/ui/input` (re-exported) | All form labels |
| `Badge` | `@/components/ui/badge` | Tags, day count, checkout/checkin markers |
| `Skeleton` | `@/components/ui/skeleton` | Loading placeholders |
| `Avatar` | `@/components/ui/avatar` | User avatar in header |
| `DropdownMenu` | `@/components/ui/dropdown-menu` | Header user menu, item action menu |
| `Tabs` | `@/components/ui/tabs` | Mobile trip detail tab layout |
| `Separator` | `@/components/ui/separator` | Visual dividers in sidebar |
| `Alert` | `@/components/ui/alert` | Error states (invite errors, conflict warnings) |
| `Tooltip` | `@/components/ui/tooltip` | Icon button labels (copy button) |
| `Sheet` | `@/components/ui/sheet` | Mobile slide-over panels (future use) |
| `Progress` | `@/components/ui/progress` | Upload progress (future use) |
| `Sonner` | `@/components/ui/sonner` | Toast notifications (replaces inline toast divs) |
| `Select` | `@/components/ui/select` | Dropdown selects in forms |

### Button Variant Reference

| Variant | When to use |
|---|---|
| `default` | Primary action (create, save, invite, add) |
| `secondary` | Cancel, back, secondary action |
| `outline` | Upload triggers, dashed-border actions |
| `ghost` | Icon-only actions, navigation links |
| `destructive` | Delete, danger actions |
| `link` | Inline text links |

---

## Layout Patterns

### Desktop (≥ 1024px)
- Trip detail: fixed left sidebar (`w-72`) + scrollable main content
- Dashboard: responsive card grid (`minmax(260px, 1fr)`)

### Mobile (< 1024px)
- Trip detail: tab bar (Overview / Itinerary) switching between sidebar and main content

---

## Prohibited Patterns

- `style={{ color: '#hex' }}` — use CSS variable tokens instead
- `bg-sky-500`, `text-slate-900`, `border-orange-200` — use `bg-primary`, `text-foreground`, `border-border` etc.
- Hand-rolled `<div className="rounded-2xl bg-white ...">` acting as a Card — use `<Card>`
- Custom `cva` variant definitions outside of `button.tsx` or `badge.tsx`
