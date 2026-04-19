## ADDED Requirements

### Requirement: Create a segment
The system SHALL allow users to add a named city/location segment to a trip with a start date and end date.

#### Scenario: Successful segment creation
- **WHEN** user submits a new segment with title, start date, and end date
- **THEN** system saves the segment and it appears in the left panel under the trip

#### Scenario: Segment dates must fall within trip dates
- **WHEN** user submits segment dates outside the trip's overall date range
- **THEN** system displays a validation error and does not create the segment

---

### Requirement: Display segments in left panel
The system SHALL display segments in the left panel as collapsible groups, each containing the days that fall within that segment's date range.

#### Scenario: Days listed under segment
- **WHEN** user views the trip left panel
- **THEN** each segment shows its title and lists all calendar days within its date range beneath it

#### Scenario: Boundary day appears under two segments
- **WHEN** a day equals the end_date of one segment AND the start_date of the next segment
- **THEN** that day appears as the last item in the first segment AND the first item in the second segment

---

### Requirement: Checkout and checkin indicators on boundary days
The system SHALL display a checkout badge on a boundary day in the departing segment and a checkin badge in the arriving segment.

#### Scenario: Checkout badge on last day of segment
- **WHEN** a day is the end_date of a segment and is also the start_date of the next segment
- **THEN** the day entry in the departing segment shows a "checkout" indicator

#### Scenario: Checkin badge on first day of next segment
- **WHEN** a day is the start_date of a segment and is also the end_date of the previous segment
- **THEN** the day entry in the arriving segment shows a "checkin" indicator

---

### Requirement: Edit and delete a segment
The system SHALL allow users to update or remove a segment.

#### Scenario: Segment title and dates updated
- **WHEN** user edits a segment's title or dates and saves
- **THEN** system updates the segment and re-derives boundary day indicators

#### Scenario: Segment deleted
- **WHEN** user deletes a segment
- **THEN** system removes the segment; items on days previously within that segment remain intact under their calendar dates

---

### Requirement: Segment UI follows the Nomado design system
All segment components in the left panel SHALL conform to `design-system/nomado/MASTER.md` and `design.md` Decision D8.

#### Scenario: Segment headers use Playfair Display
- **WHEN** a segment title is rendered in the left panel
- **THEN** it uses `Playfair Display` serif font, `font-weight: 600`, and text color `#2C1A0E`

#### Scenario: Day links use Inter and muted text color
- **WHEN** day entries are listed under a segment
- **THEN** they use `Inter` font with muted text color `#7C6A5A` and transition to `#2C1A0E` on hover

#### Scenario: Checkout badge uses muted terracotta
- **WHEN** a checkout badge is rendered
- **THEN** it uses pill style with `background: rgba(198,123,92,0.12)`, `color: #C67B5C`, `border-radius: 999px`

#### Scenario: Checkin badge uses sage green
- **WHEN** a checkin badge is rendered
- **THEN** it uses pill style with `background: rgba(92,122,95,0.12)`, `color: #5C7A5F`, `border-radius: 999px`

#### Scenario: Add segment button uses secondary style
- **WHEN** the "Add Segment" button is rendered
- **THEN** it uses the secondary button style from MASTER.md: `color: #5C7A5F`, `border: 1.5px solid #5C7A5F`, `border-radius: 10px`
