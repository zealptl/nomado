## ADDED Requirements

### Requirement: Add an item to a day
The system SHALL allow users to add a new itinerary item to a specific calendar day within a trip.

#### Scenario: Successful item creation
- **WHEN** user clicks "Add Item" on a day and submits the form with at least a title
- **THEN** system creates the item on that day and it appears in the day's item list

#### Scenario: Item form fields
- **WHEN** user opens the Add Item form
- **THEN** system presents fields for: title (required), location (text), maps link (URL), time (optional — single time or time range), description, photos (file upload), and tags

---

### Requirement: View items for a day
The system SHALL display all items for a day grouped and ordered by their position field.

#### Scenario: Items shown in order
- **WHEN** user views a day in the right panel
- **THEN** all items for that day are displayed in ascending position order

#### Scenario: Empty day
- **WHEN** a day has no items
- **THEN** system shows an empty state with an "Add Item" prompt

---

### Requirement: Edit an item
The system SHALL allow any trip collaborator to edit an existing item's fields.

#### Scenario: Successful edit
- **WHEN** user submits updated item fields
- **THEN** system saves the changes and updates the display immediately

#### Scenario: Stale write rejected
- **WHEN** user submits an edit but another collaborator has already updated the item since the user last loaded the page
- **THEN** system returns HTTP 409, displays "This item was updated by someone else. Please refresh.", and does not overwrite the newer version

---

### Requirement: Delete an item
The system SHALL allow any trip collaborator to delete an item from a day.

#### Scenario: Item deleted
- **WHEN** user confirms deletion of an item
- **THEN** system removes the item and its associated photos from Storage

---

### Requirement: Reorder items within a day via drag and drop
The system SHALL allow users to drag and drop items within a single day to reorder them.

#### Scenario: Item dragged to new position
- **WHEN** user drags an item and drops it at a new position within the same day
- **THEN** system updates the position field of the affected items and re-renders the list in the new order

#### Scenario: Cross-day drag is not supported
- **WHEN** user attempts to drag an item to a different day
- **THEN** the drag operation is constrained to within the same day only

---

### Requirement: Item versioning via updated_at
The system SHALL track the last-modified timestamp on every item and use it to detect concurrent edit conflicts.

#### Scenario: Version sent on update
- **WHEN** client submits an item update
- **THEN** client MUST include the updated_at timestamp it last received for that item

#### Scenario: Version mismatch returns 409
- **WHEN** the submitted updated_at does not match the stored updated_at
- **THEN** system returns HTTP 409 Conflict with a human-readable message

---

### Requirement: Item UI follows the Nomado design system
All item card and form components SHALL conform to `design-system/nomado/MASTER.md` and `design.md` Decision D8.

#### Scenario: Item cards use glassmorphism style
- **WHEN** an item card is rendered
- **THEN** it uses `backdrop-filter: blur(15px)`, `background: rgba(255,255,255,0.6)`, `border: 1px solid rgba(255,255,255,0.3)`, and `border-radius: 16px`

#### Scenario: Item card titles use Playfair Display
- **WHEN** an item title is rendered
- **THEN** it uses `Playfair Display` serif font with color `#2C1A0E`

#### Scenario: Item metadata uses Inter and muted text color
- **WHEN** item location, time, and description are rendered
- **THEN** they use `Inter` font with muted text color `#7C6A5A`

#### Scenario: Add Item and edit buttons use sage green
- **WHEN** the Add Item button or edit action is rendered
- **THEN** it uses sage green (`#5C7A5F`) as the primary color with 200ms transition

#### Scenario: Delete confirmation uses design-consistent modal
- **WHEN** user triggers item deletion
- **THEN** the confirmation modal uses `backdrop-filter: blur(20px)`, `background: rgba(255,255,255,0.85)`, and `border-radius: 20px`

#### Scenario: Form inputs follow MASTER.md input spec
- **WHEN** any item form input is rendered
- **THEN** it uses `border: 1px solid rgba(124,106,90,0.25)`, `border-radius: 10px`, `background: rgba(255,255,255,0.7)`, and focus ring `box-shadow: 0 0 0 3px rgba(92,122,95,0.15)`
