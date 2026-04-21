## Why

The current frontend uses a mix of hand-rolled Tailwind components and a small set of manually installed shadcn primitives, creating inconsistency in behaviour, accessibility, and visual language. Replacing every component with native shadcn library components and aligning the colour palette to the new Nomado coastal palette gives us a unified, accessible, maintainable design system in one pass.

## What Changes

- Install the full shadcn/ui component library (via `npx shadcn@latest add`) and configure it with the new CSS variable palette
- Replace every custom component in `frontend/src/components/` and `frontend/src/pages/` with the canonical shadcn equivalent (Card, Dialog, Sheet, Badge, Button, Input, Skeleton, Avatar, Tabs, Dropdown, Toast/Sonner, etc.)
- Remove all ad-hoc inline `style={{ … }}` colour overrides; colours are expressed exclusively through CSS variables mapped to the new palette
- Update `frontend/src/index.css` (or `globals.css`) to define the new Nomado coastal CSS variable set
  - `--background`: `#e0fbfc` (Light Cyan)
  - `--card`: `#c2dfe3` (Light Blue)
  - `--muted`: `#9db4c0` (Cool Steel)
  - `--foreground` / `--card-foreground`: `#253237` (Jet Black)
  - `--primary`: `#5c6b73` (Blue Slate)
  - `--primary-foreground`: `#e0fbfc`
- Update `design-system/design.md` (the project's living design reference) to document the shadcn-native pattern and new palette
- Remove the hand-rolled `buttonVariants` customisation — Button variants are mapped to shadcn's `default`, `secondary`, `ghost`, `destructive`, `outline` with colour token overrides only

**No breaking changes to routing, API contracts, or authentication.**

## Capabilities

### New Capabilities

- `shadcn-design-system`: Unified shadcn/ui component system with Nomado coastal colour palette — CSS variable theming, all app surfaces rendered with canonical shadcn components

### Modified Capabilities

- None — this is a pure UI layer change; no spec-level behaviour or API requirements change

## Impact

- **Files modified**: All `frontend/src/components/*.tsx`, all `frontend/src/pages/*.tsx`, `frontend/src/index.css`, `frontend/tailwind.config.*`, `frontend/components.json`, `design-system/design.md`
- **Dependencies added**: Full shadcn/ui suite (Radix UI primitives, lucide-react already present, class-variance-authority, clsx, tailwind-merge)
- **Dependencies removed**: None (shadcn components are copied into the repo, not a runtime dep)
- **APIs / backend**: Unaffected
