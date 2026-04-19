## ADDED Requirements

### Requirement: Upload trip cover photo
The system SHALL allow the trip owner to upload a cover photo for their trip from their device.

#### Scenario: Cover photo uploaded
- **WHEN** user selects an image file during trip creation or edit
- **THEN** system uploads the file to Supabase Storage and stores the public URL on the trip record

#### Scenario: File size limit enforced
- **WHEN** user selects a file larger than 5MB
- **THEN** system displays an error client-side and does not attempt the upload

#### Scenario: Cover photo displayed on dashboard
- **WHEN** user views the dashboard
- **THEN** each trip card displays the cover photo as a background or hero image

---

### Requirement: Upload photos to itinerary items
The system SHALL allow users to upload one or more photos from their device when creating or editing an itinerary item.

#### Scenario: Photos uploaded to item
- **WHEN** user attaches one or more image files to an item form and saves
- **THEN** system uploads each file to Supabase Storage and stores the URLs on the item record

#### Scenario: Photos displayed on item
- **WHEN** user views an item that has photos
- **THEN** photos are shown inline within the item card (collapsed by default, expandable)

#### Scenario: File size limit enforced on item photos
- **WHEN** user selects any photo larger than 5MB
- **THEN** system displays a client-side error for that file and skips it

#### Scenario: Photo deleted with item
- **WHEN** an item is deleted
- **THEN** system removes all associated photos from Supabase Storage

---

### Requirement: Image upload UI follows the Nomado design system
All upload and photo display components SHALL conform to `design-system/nomado/MASTER.md` and `design.md` Decision D8.

#### Scenario: Photo uploader uses glassmorphism container
- **WHEN** the photo uploader component is rendered
- **THEN** the drop zone or file picker area uses `background: rgba(255,255,255,0.6)`, `border: 1px dashed rgba(92,122,95,0.4)`, and `border-radius: 16px`

#### Scenario: Upload error message uses Inter and muted terracotta
- **WHEN** a file size error is displayed
- **THEN** the error text uses `Inter` font and muted terracotta (`#C67B5C`) color — no red

#### Scenario: Photo thumbnails use rounded corners
- **WHEN** uploaded photo thumbnails are displayed
- **THEN** they use `border-radius: 12px` and a `box-shadow: 0 4px 12px rgba(44,26,14,0.08)`

#### Scenario: Upload button uses sage green
- **WHEN** a "Choose photos" or upload trigger button is rendered
- **THEN** it uses the secondary button style from MASTER.md: `color: #5C7A5F`, `border: 1.5px solid #5C7A5F`, `border-radius: 10px`
