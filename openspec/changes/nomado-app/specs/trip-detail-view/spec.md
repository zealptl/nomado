## ADDED Requirements

### Requirement: Split panel layout
The system SHALL render the trip detail view as a fixed left panel (~280px) and a scrollable right panel on desktop. On mobile, the view SHALL collapse into two tabs: "Overview" and "Days".

#### Scenario: Desktop split panel
- **WHEN** user opens a trip on a desktop viewport (≥1024px)
- **THEN** left panel is fixed and visible alongside the scrollable right content panel

#### Scenario: Mobile tab layout
- **WHEN** user opens a trip on a mobile viewport (<1024px)
- **THEN** system shows two tabs: "Overview" (left panel content) and "Days" (right panel content)

---

### Requirement: Left panel — segment and day navigation
The system SHALL display a hierarchical list of segments and days in the left panel, grouped by segment.

#### Scenario: Segments and days listed
- **WHEN** user views the left panel
- **THEN** each segment is shown as a header with its days listed below it in chronological order

#### Scenario: Boundary day shown under two segments
- **WHEN** a day straddles two segment boundaries
- **THEN** it appears as the last item under the departing segment (with checkout badge) and the first item under the arriving segment (with checkin badge)

#### Scenario: Clicking a day scrolls to it
- **WHEN** user clicks a day in the left panel
- **THEN** the right panel smooth-scrolls to that day's section

#### Scenario: Active day highlighted
- **WHEN** user scrolls the right panel and a day's section enters the viewport
- **THEN** the corresponding day in the left panel is highlighted as active

---

### Requirement: Right panel — scrollable day timeline
The system SHALL display all days and their items in a single scrollable column in the right panel, organized by date.

#### Scenario: All days rendered in order
- **WHEN** user views the right panel
- **THEN** all calendar days within the trip date range are rendered in ascending date order, each showing its items

#### Scenario: Day header with filter pills
- **WHEN** user views a day section
- **THEN** the day header shows the date, day label, and filter pills for all tags present in that day's items

---

### Requirement: Per-day tag filter pills
The system SHALL display tag filter pills on each day header that filter that day's items.

#### Scenario: Tag pills shown for day
- **WHEN** a day has items with tags
- **THEN** pills for those tags are shown in the day header

#### Scenario: Filtering items by tag
- **WHEN** user clicks a tag pill
- **THEN** only items on that day matching the tag are shown; others are hidden

---

### Requirement: Add Item button per day
The system SHALL display an "Add Item" button on each day that opens the item creation form.

#### Scenario: Add Item button visible
- **WHEN** user views any day in the right panel
- **THEN** an "Add Item" button is visible for that day

#### Scenario: Add Item form scoped to day
- **WHEN** user clicks "Add Item" on a specific day
- **THEN** the item creation form opens pre-scoped to that day's date

---

### Requirement: Invite button for trip owner
The system SHALL display an "Invite" button in the trip detail view, visible only to the trip owner.

#### Scenario: Invite button visible to owner
- **WHEN** the authenticated user is the trip owner
- **THEN** an "Invite" button is visible in the trip header

#### Scenario: Invite button not visible to collaborators
- **WHEN** the authenticated user is a collaborator (not the owner)
- **THEN** no "Invite" button is shown

---

### Requirement: Trip detail view follows the Nomado design system
All trip detail view components SHALL conform to `design-system/nomado/MASTER.md` and `design.md` Decision D8.

#### Scenario: Left panel background uses glassmorphism
- **WHEN** the left panel is rendered
- **THEN** it uses `backdrop-filter: blur(15px)`, `background: rgba(255,255,255,0.6)`, and `border-right: 1px solid rgba(255,255,255,0.3)`

#### Scenario: Segment headers use Playfair Display
- **WHEN** a segment header is rendered in the left panel
- **THEN** it uses `Playfair Display` serif font with text color `#2C1A0E`

#### Scenario: Active day highlighted with sage green
- **WHEN** a day is active in the left panel
- **THEN** it is highlighted using sage green (`#5C7A5F`) as background tint or left border accent

#### Scenario: Day section headers use Playfair Display
- **WHEN** a day section header is rendered in the right panel
- **THEN** the date label uses `Playfair Display` and body text uses `Inter`

#### Scenario: Checkout and checkin badges use design tokens
- **WHEN** a checkout or checkin badge is rendered
- **THEN** it uses the pill style from MASTER.md: `border-radius: 999px`, sage green tint for checkin, muted terracotta (`#C67B5C`) tint for checkout

#### Scenario: All icons are SVG from Lucide React
- **WHEN** any icon is rendered in the trip detail view
- **THEN** it is an SVG icon from Lucide React — no emojis used

#### Scenario: Mobile tabs use Inter font and sage green active indicator
- **WHEN** the mobile tab bar is rendered
- **THEN** tabs use `Inter` font and the active tab is indicated with a sage green (`#5C7A5F`) underline or background
