## ADDED Requirements

### Requirement: CSS variable palette defines all colours
All application colours SHALL be defined as CSS custom properties in `frontend/src/index.css` under `@layer base { :root { … } }` using the Nomado coastal palette. No component file SHALL contain hex colour literals or hard-coded Tailwind colour names (e.g. `bg-sky-500`).

#### Scenario: Background and card surfaces render with coastal palette
- **WHEN** any page loads
- **THEN** the page background displays Light Cyan (`#e0fbfc`) and card surfaces display Light Blue (`#c2dfe3`)

#### Scenario: Primary buttons use Blue Slate
- **WHEN** a `<Button>` with `variant="default"` is rendered
- **THEN** its background is Blue Slate (`#5c6b73`) and its label is Light Cyan (`#e0fbfc`)

#### Scenario: Text renders in Jet Black
- **WHEN** any body or heading text is rendered
- **THEN** the foreground colour is Jet Black (`#253237`)

---

### Requirement: Every UI surface uses a canonical shadcn component
All interactive or visual surfaces (cards, modals, navigation, form inputs, badges, toasts, dropdowns) SHALL be rendered using a shadcn/ui component sourced from `frontend/src/components/ui/`. Hand-rolled container `<div>` elements with card-like styling SHALL NOT remain in the codebase.

#### Scenario: Trip cards use shadcn Card
- **WHEN** the Dashboard renders a list of trips
- **THEN** each trip is displayed using `<Card>`, `<CardHeader>`, `<CardContent>`, and `<CardFooter>` from `@/components/ui/card`

#### Scenario: Modals use shadcn Dialog
- **WHEN** a user opens CreateTripModal, SegmentModal, ItemFormModal, or InviteModal
- **THEN** the modal is rendered using `<Dialog>`, `<DialogContent>`, `<DialogHeader>`, and `<DialogFooter>` from `@/components/ui/dialog`

#### Scenario: Segment navigation uses shadcn Tabs
- **WHEN** the TripDetailPage renders segment navigation
- **THEN** the navigation strip is rendered using `<Tabs>`, `<TabsList>`, and `<TabsTrigger>` from `@/components/ui/tabs`

#### Scenario: App header user menu uses shadcn DropdownMenu
- **WHEN** a user clicks their avatar or name in AppHeader
- **THEN** the user menu is rendered using `<DropdownMenu>` and its sub-components from `@/components/ui/dropdown-menu`

#### Scenario: Form fields use shadcn Input, Textarea, Select, Label
- **WHEN** any form is rendered (trip creation, item edit, segment edit)
- **THEN** text inputs use `<Input>`, multi-line fields use `<Textarea>`, select controls use `<Select>`, and every field has an associated `<Label>` from the shadcn ui library

---

### Requirement: Button component uses shadcn default variant set
The `Button` component SHALL use shadcn's canonical variant set (`default`, `secondary`, `ghost`, `destructive`, `outline`, `link`). Custom variants (`primary`, `cta`) SHALL be removed. Colour differentiation SHALL be achieved through CSS variable overrides, not forked `cva` configuration.

#### Scenario: Primary action buttons render with default variant
- **WHEN** a primary action button is rendered (e.g., "Create Trip", "Save", "Invite")
- **THEN** it uses `variant="default"` and inherits the `--primary` CSS variable for its background

#### Scenario: Destructive buttons use destructive variant
- **WHEN** a delete or danger action button is rendered
- **THEN** it uses `variant="destructive"` and renders with the destructive colour token

---

### Requirement: Design system documentation reflects shadcn-native pattern
The file `design-system/design.md` SHALL document the Nomado coastal palette CSS variable mapping, the shadcn component catalogue in use, and the rule that no hand-rolled card/modal/button components are permitted.

#### Scenario: Developer reads design.md to determine which component to use
- **WHEN** a developer needs to add a new UI surface
- **THEN** `design-system/design.md` provides the canonical shadcn component name and the CSS variable to use for colour

#### Scenario: design.md lists the full colour palette
- **WHEN** `design-system/design.md` is opened
- **THEN** the document contains a table mapping each palette name (Light Cyan, Light Blue, Cool Steel, Blue Slate, Jet Black) to its hex value and CSS variable name
