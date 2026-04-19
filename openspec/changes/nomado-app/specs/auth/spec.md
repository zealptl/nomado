## ADDED Requirements

### Requirement: Sign in with Google
The system SHALL allow users to authenticate using their Google account via Supabase Auth OAuth flow.

#### Scenario: Successful Google sign-in
- **WHEN** user clicks "Sign in with Google" on the landing page
- **THEN** system redirects to Google OAuth consent screen, then back to the app with a valid session

#### Scenario: First-time Google sign-in creates account
- **WHEN** a new user completes Google OAuth for the first time
- **THEN** system creates a user record in Supabase Auth and redirects to the dashboard

#### Scenario: Returning Google user
- **WHEN** a returning user completes Google OAuth
- **THEN** system restores their session and redirects to the dashboard

---

### Requirement: Sign in with Apple
The system SHALL allow users to authenticate using their Apple ID via Supabase Auth OAuth flow.

#### Scenario: Successful Apple sign-in
- **WHEN** user clicks "Sign in with Apple" on the landing page
- **THEN** system redirects to Apple authentication, then back to the app with a valid session

#### Scenario: First-time Apple sign-in creates account
- **WHEN** a new user completes Apple sign-in for the first time
- **THEN** system creates a user record and redirects to the dashboard

---

### Requirement: Protected routes
The system SHALL redirect unauthenticated users to the landing page when they attempt to access any protected route.

#### Scenario: Unauthenticated dashboard access
- **WHEN** an unauthenticated user navigates to `/dashboard` or any protected route
- **THEN** system redirects them to the landing page `/`

#### Scenario: Invite link with no session
- **WHEN** an unauthenticated user clicks an invite link
- **THEN** system redirects to the landing page with the invite token preserved in the URL so it can be processed after login

---

### Requirement: Sign out
The system SHALL allow authenticated users to sign out, clearing their session.

#### Scenario: Successful sign-out
- **WHEN** user clicks the sign-out option
- **THEN** system clears the Supabase session and redirects to the landing page

---

### Requirement: Auth UI follows the Nomado design system
All auth-related UI components SHALL conform to `design-system/nomado/MASTER.md` and `design.md` Decision D8.

#### Scenario: Sign-in buttons use correct styles
- **WHEN** the sign-in buttons are rendered
- **THEN** they use Inter font, sage green (`#5C7A5F`) for the primary button background, `border-radius: 10px`, `transition: all 200ms ease`, and `cursor-pointer`

#### Scenario: Sign-out button uses SVG icon
- **WHEN** a sign-out icon is displayed
- **THEN** it is an SVG icon from Lucide React — no emojis used as icons

#### Scenario: Focus states visible on auth buttons
- **WHEN** a sign-in or sign-out button receives keyboard focus
- **THEN** a visible focus ring is displayed (minimum 3px offset, sage green tint)
