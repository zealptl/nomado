## ADDED Requirements

### Requirement: Create a trip
The system SHALL allow authenticated users to create a new trip with a name, destination, date range, and optional cover photo.

#### Scenario: Successful trip creation
- **WHEN** user submits the create trip form with name, destination, start date, and end date
- **THEN** system creates the trip, sets the current user as owner, and navigates to the trip detail view

#### Scenario: Missing required fields
- **WHEN** user submits the create trip form without name, destination, or dates
- **THEN** system displays inline validation errors and does not create the trip

#### Scenario: Cover photo upload on creation
- **WHEN** user attaches a cover photo during trip creation
- **THEN** system uploads the image to Supabase Storage and stores the URL on the trip record

---

### Requirement: View trip list on dashboard
The system SHALL display all trips owned by the current user in the "My Trips" section of the dashboard.

#### Scenario: Trips displayed as cards
- **WHEN** user views the dashboard
- **THEN** each owned trip is shown as a card with cover image, title, destination, and date range

#### Scenario: Empty state for new users
- **WHEN** user has no trips
- **THEN** system displays an empty state with a "Create your first trip" prompt

---

### Requirement: Open a trip
The system SHALL allow users to open a trip and navigate to its detail view.

#### Scenario: Trip opens from dashboard
- **WHEN** user clicks a trip card on the dashboard
- **THEN** system navigates to the trip detail view for that trip

---

### Requirement: Edit a trip
The system SHALL allow the trip owner to update the trip name, destination, date range, and cover photo.

#### Scenario: Successful trip edit
- **WHEN** trip owner submits updated trip details
- **THEN** system saves the changes and reflects them immediately in the UI

---

### Requirement: Delete a trip
The system SHALL allow the trip owner to delete a trip and all associated data.

#### Scenario: Trip deletion with confirmation
- **WHEN** trip owner confirms the delete action
- **THEN** system deletes the trip, all segments, all items, all photos, and all collaborator records, then redirects to the dashboard

---

### Requirement: Trip management UI follows the Nomado design system
All trip creation, edit, and deletion UI components SHALL conform to `design-system/nomado/MASTER.md` and `design.md` Decision D8.

#### Scenario: Create and edit trip modals use glassmorphism
- **WHEN** a trip creation or edit modal is rendered
- **THEN** it uses `backdrop-filter: blur(20px)`, `background: rgba(255,255,255,0.85)`, `border: 1px solid rgba(255,255,255,0.4)`, and `border-radius: 20px`

#### Scenario: Modal headings use Playfair Display
- **WHEN** a modal title ("Create Trip", "Edit Trip") is rendered
- **THEN** it uses `Playfair Display` serif font with color `#2C1A0E`

#### Scenario: Form inputs follow MASTER.md input spec
- **WHEN** trip name, destination, or date inputs are rendered
- **THEN** they use `border: 1px solid rgba(124,106,90,0.25)`, `border-radius: 10px`, `background: rgba(255,255,255,0.7)`, focus ring `box-shadow: 0 0 0 3px rgba(92,122,95,0.15)`

#### Scenario: Submit button uses sage green primary style
- **WHEN** the "Create Trip" or "Save" button is rendered
- **THEN** it uses `background: #5C7A5F`, white text, `border-radius: 10px`, 200ms hover transition

#### Scenario: Validation errors use Inter and muted terracotta
- **WHEN** an inline validation error is displayed
- **THEN** it uses `Inter` font and `color: #C67B5C` — no harsh red
