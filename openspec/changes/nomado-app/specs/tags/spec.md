## ADDED Requirements

### Requirement: Default tags available on every trip
The system SHALL provide a fixed set of default tags available for all items on any trip: food, drinks, stay, activity, going out.

#### Scenario: Default tags shown in item form
- **WHEN** user opens the Add Item or Edit Item form
- **THEN** system displays the five default tags as selectable options

---

### Requirement: Custom tags per trip
The system SHALL allow users to create custom tags scoped to a specific trip.

#### Scenario: Custom tag created
- **WHEN** user types a new tag name in the tag input on the item form and confirms
- **THEN** system saves the tag to the trip_tags table for that trip and makes it selectable on any item within that trip

#### Scenario: Custom tags scoped to trip
- **WHEN** user views the item form for a trip
- **THEN** only custom tags belonging to that specific trip are shown alongside the default tags

#### Scenario: Custom tag not shared across trips
- **WHEN** user creates a custom tag on Trip A
- **THEN** that tag does NOT appear on Trip B

---

### Requirement: Filter items by tag
The system SHALL allow users to filter a day's items by tag using pill buttons displayed per day.

#### Scenario: Filter pill activates
- **WHEN** user clicks a tag pill on a day
- **THEN** system shows only items tagged with that tag for that day; items without the tag are hidden

#### Scenario: Multiple filters
- **WHEN** user clicks more than one tag pill
- **THEN** system shows items matching ANY of the selected tags (OR logic)

#### Scenario: Clear filter
- **WHEN** user clicks an active tag pill again
- **THEN** system deactivates that filter; if no filters are active, all items are shown

---

### Requirement: Tag pill UI follows the Nomado design system
All tag pill components SHALL conform to `design-system/nomado/MASTER.md` and `design.md` Decision D8.

#### Scenario: Inactive pill uses sage green tint
- **WHEN** a tag pill is rendered in its default (inactive) state
- **THEN** it uses `background: rgba(92,122,95,0.12)`, `color: #5C7A5F`, `border: 1px solid rgba(92,122,95,0.2)`, `border-radius: 999px`, `font-family: Inter`, `font-size: 12px`

#### Scenario: Active pill uses solid sage green
- **WHEN** a tag pill is toggled active
- **THEN** it transitions to `background: #5C7A5F`, `color: white` with a 150ms ease transition

#### Scenario: Pill hover state is visible
- **WHEN** user hovers over an inactive pill
- **THEN** the pill shows a subtle background darkening with `cursor-pointer` — no layout shift
