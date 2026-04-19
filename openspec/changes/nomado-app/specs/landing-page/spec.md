## ADDED Requirements

### Requirement: Minimal gateway landing page
The system SHALL display a minimal, visually striking landing page with the app name and sign-in options.

#### Scenario: Landing page renders for unauthenticated users
- **WHEN** an unauthenticated user visits the root URL `/`
- **THEN** system displays the Nomado landing page with a full-bleed background visual, the app name "Nomado", and sign-in buttons

#### Scenario: Authenticated user bypasses landing page
- **WHEN** an authenticated user visits `/`
- **THEN** system redirects them to `/dashboard`

---

### Requirement: Sign-in options on landing page
The system SHALL display "Sign in with Google" and "Sign in with Apple" as the only call-to-action on the landing page.

#### Scenario: Two sign-in buttons visible
- **WHEN** user views the landing page
- **THEN** both "Sign in with Google" and "Sign in with Apple" buttons are displayed

#### Scenario: Sign-in buttons initiate OAuth
- **WHEN** user clicks either sign-in button
- **THEN** system initiates the corresponding Supabase OAuth flow

---

### Requirement: Landing page design
The system SHALL implement the landing page following the Nomado design system.

#### Scenario: Design system applied
- **WHEN** the landing page is rendered
- **THEN** it uses background color #F5F0E1 (soft cream), glassmorphism sign-in panel (backdrop-filter: blur(15px), rgba(255,255,255,0.6)), Playfair Display for the "Nomado" heading, sage green (#5C7A5F) as the primary accent, and Inter for all body text and buttons
