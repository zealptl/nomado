## ADDED Requirements

### Requirement: Generate invite link
The system SHALL allow the trip owner to generate a shareable invite link for their trip.

#### Scenario: Invite link generated
- **WHEN** trip owner clicks the "Invite" button on a trip
- **THEN** system generates a signed JWT invite token (7-day expiry) and displays a copyable invite link

#### Scenario: Copy invite link
- **WHEN** user clicks "Copy link"
- **THEN** system copies the full invite URL to the clipboard

#### Scenario: Regenerate invite link
- **WHEN** trip owner regenerates the invite link
- **THEN** system issues a new token, invalidating the previous one

---

### Requirement: Join a trip via invite link
The system SHALL allow any user to join a shared trip by clicking an invite link.

#### Scenario: Authenticated user joins via invite link
- **WHEN** an authenticated user visits a valid invite link
- **THEN** system validates the token, adds the user to trip_collaborators, and redirects them to the trip detail view

#### Scenario: Unauthenticated user redirected to login
- **WHEN** an unauthenticated user visits an invite link
- **THEN** system redirects to the landing/login page with the invite token preserved in the URL

#### Scenario: User joins after login from invite link
- **WHEN** user completes login after being redirected from an invite link
- **THEN** system processes the preserved invite token, adds them as a collaborator, and redirects to the trip

#### Scenario: Expired invite token
- **WHEN** user visits an invite link with an expired token (>7 days)
- **THEN** system displays an "Invite link has expired. Ask the trip owner to share a new one." message

#### Scenario: Already a collaborator
- **WHEN** a user who is already a collaborator visits an invite link
- **THEN** system redirects them directly to the trip without creating a duplicate collaborator record

---

### Requirement: Shared trips appear in "Shared with Me"
The system SHALL display all trips a user has joined via invite link in the "Shared with Me" section of the dashboard.

#### Scenario: Joined trip appears in Shared with Me
- **WHEN** user has joined a trip via invite link
- **THEN** that trip appears in the "Shared with Me" section with the same card format as owned trips

---

### Requirement: Collaborators can edit a trip
The system SHALL allow all collaborators (owner + invited users) to add, edit, reorder, and delete items on a shared trip.

#### Scenario: Collaborator adds an item
- **WHEN** a collaborator adds an item to any day on a shared trip
- **THEN** system saves the item and associates it with that trip

#### Scenario: Non-collaborator cannot access trip
- **WHEN** a user who is neither the owner nor a collaborator attempts to access a trip URL
- **THEN** system returns a 403 and shows an "Access denied" message

---

### Requirement: Collaboration UI follows the Nomado design system
All invite and collaboration UI components SHALL conform to `design-system/nomado/MASTER.md` and `design.md` Decision D8.

#### Scenario: Invite modal uses glassmorphism style
- **WHEN** the InviteModal is rendered
- **THEN** it uses `backdrop-filter: blur(20px)`, `background: rgba(255,255,255,0.85)`, `border: 1px solid rgba(255,255,255,0.4)`, and `border-radius: 20px`

#### Scenario: Invite button uses sage green primary style
- **WHEN** the "Invite" button is rendered in the trip header
- **THEN** it uses `background: #5C7A5F`, white text, `border-radius: 10px`, and 200ms hover transition

#### Scenario: Copy link button uses secondary style
- **WHEN** the "Copy Link" button is rendered inside the modal
- **THEN** it uses the secondary button style: `color: #5C7A5F`, `border: 1.5px solid #5C7A5F`, `border-radius: 10px`

#### Scenario: Invite link input field follows MASTER.md input spec
- **WHEN** the invite URL is displayed in a text input
- **THEN** it uses `border: 1px solid rgba(124,106,90,0.25)`, `background: rgba(255,255,255,0.7)`, and `border-radius: 10px`
