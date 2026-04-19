## ADDED Requirements

### Requirement: Dashboard layout — My Trips and Shared with Me
The system SHALL display the dashboard as two horizontally split sections: "My Trips" (top) and "Shared with Me" (bottom).

#### Scenario: Both sections rendered
- **WHEN** authenticated user navigates to the dashboard
- **THEN** system displays "My Trips" and "Shared with Me" sections side by side (desktop) or stacked (mobile)

---

### Requirement: Trip card display
The system SHALL display each trip as a card showing its cover image, title, destination, and date range.

#### Scenario: Trip card renders correctly
- **WHEN** a trip has a cover photo
- **THEN** the card displays the cover photo as the card background or header image, with trip title, destination, and formatted date range overlaid or below

#### Scenario: Trip card without cover photo
- **WHEN** a trip has no cover photo
- **THEN** the card displays a warm placeholder with the trip's initials or a default gradient

---

### Requirement: Create trip from dashboard
The system SHALL provide a prominent "Create Trip" button on the dashboard that opens the trip creation form.

#### Scenario: Create Trip button visible
- **WHEN** user views the dashboard
- **THEN** a "Create Trip" button is visible in the "My Trips" section

#### Scenario: Create Trip form opens
- **WHEN** user clicks "Create Trip"
- **THEN** system opens a modal or slide-over with fields: trip name, destination, start date, end date, cover photo (optional)

---

### Requirement: Empty state for new users
The system SHALL display a welcoming empty state when the user has no trips.

#### Scenario: Empty My Trips section
- **WHEN** user has no owned trips
- **THEN** system shows an empty state illustration with the message "Create your first trip" and a CTA button

#### Scenario: Empty Shared with Me section
- **WHEN** user has no shared trips
- **THEN** system shows a minimal empty state: "Trips shared with you will appear here"

---

### Requirement: Dashboard UI follows the Nomado design system
All dashboard components SHALL conform to `design-system/nomado/MASTER.md` and `design.md` Decision D8.

#### Scenario: Page background uses soft cream
- **WHEN** the dashboard is rendered
- **THEN** the page background is `#F5F0E1` (soft cream) with the warm radial gradient defined in MASTER.md

#### Scenario: Trip cards use glassmorphism style
- **WHEN** a trip card is rendered
- **THEN** it uses `backdrop-filter: blur(15px)`, `background: rgba(255,255,255,0.6)`, `border: 1px solid rgba(255,255,255,0.3)`, `border-radius: 16px`, and `box-shadow: 0 8px 32px rgba(44,26,14,0.08)`

#### Scenario: Section headings use Playfair Display
- **WHEN** "My Trips" and "Shared with Me" headings are rendered
- **THEN** they use `Playfair Display` serif font

#### Scenario: Create Trip button uses primary sage green
- **WHEN** the Create Trip button is rendered
- **THEN** it uses background `#5C7A5F`, white text, `border-radius: 10px`, and a 200ms hover darkening transition

#### Scenario: All clickable cards have cursor-pointer
- **WHEN** a trip card is rendered
- **THEN** it has `cursor-pointer` and a `translateY(-2px)` lift on hover with 200ms ease transition
