# Module: Authentication and Login

---

## General Information

- **Module Code**: `EBM-01`
- **API Contract**: `api-contracts/login-user.yaml`
- **Responsible**: Abigail Ramirez Chavarria
- **Status**: Completed
- **Version**: `1.2.0`
- **Created**: `2026-06-05`
- **Last Updated**: `2026-06-05`

---

## Description

Login screen that authenticates users with email and password, persists the
JWT session in secure storage, restores saved sessions on app startup, and
routes users by role:

- **business** users enter the admin stack (calendario, future event management).
- **customer** users enter a tabbed section (eventos disponibles, mis reservas).

Both roles share the same login form and session persistence; the only
difference is the post-login redirect and the layout that wraps each group.

---

## API Contract

**File:** `api-contracts/login-user.yaml`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/v1/auth/login` | No | Authenticates a user and returns a JWT plus compact user profile |

### Request Body

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Required |

### Response (200 OK)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "System",
    "role": "business"
  }
}
```

### Response (401 Unauthorized)

```json
{
  "error": "validation_error",
  "message": "Invalid email or password",
  "details": [
    { "field": "credentials", "message": "Invalid email or password" }
  ]
}
```

### Response (422 Validation Error)

```json
{
  "error": "validation_error",
  "message": "One or more validation errors occurred",
  "details": [
    { "field": "email", "message": "Email must be a valid email address" }
  ]
}
```

---

## Architecture

### File Map

```text
src/
|-- types/
|   `-- auth.ts                        # LoginRequest, LoginResponse, AuthenticatedUser, UserRole
|-- utils/
|   `-- validators.ts                  # validateLoginForm(), validateRegistrationForm()
|-- services/
|   |-- api.ts                         # HTTP client, async Bearer token persistence
|   |-- auth.ts                        # authService.login(), authService.register()
|   `-- storage.ts                     # SecureStore async wrapper
|-- context/
|   `-- AuthContext.tsx                # Session restore, role status, login, register, logout
|-- components/
|   `-- ui/
|       |-- Input.tsx                  # Labeled input, errors, password toggle
|       |-- Button.tsx                 # Loading submit button
|       |-- Loader.tsx                 # Session restoration loading state
|       |-- LogoutButton.tsx           # Reusable logout icon, calls AuthContext.logout
|       |-- icon-symbol.tsx            # SF Symbol to Material Icons mapping (includes logout)
|       |-- themed-text.tsx            # Theme-aware text component
|       `-- themed-view.tsx            # Theme-aware view container
app/
|-- _layout.tsx                        # Root layout: registers (auth), (admin), (customer) groups
|-- index.tsx                          # Entry redirect by restored role
|-- (auth)/
|   |-- _layout.tsx                    # Auth group layout (headerless stack)
|   |-- login.tsx                      # Login screen, bifurcates by role after authentication
|   `-- register.tsx                   # Registration screen
|-- (admin)/
|   |-- _layout.tsx                    # Admin stack layout, business-only guard
|   `-- index.tsx                      # Admin calendar (placeholder)
`-- (customer)/
    |-- _layout.tsx                    # Customer tabs layout, auth guard + business exclusion
    |-- index.tsx                      # Customer events (placeholder)
    `-- reservations.tsx               # Customer reservations (placeholder)
tests/
|-- Unit/login/
|-- Feature/login/
`-- Browser/login/
```

### Data Flow

```text
User enters email and password
    |
    v
handleLogin() in app/(auth)/login.tsx
    |
    v
validateLoginForm(values)
    |-- Client error -> show field errors, stop
    |
    v
useAuth().login(LoginRequest)
    |
    v
authService.login() -> POST /api/v1/auth/login
    |
    v
AuthContext stores auth_token and auth_user in SecureStore
    |
    |-- role business -> router.replace('/(admin)')     -> Admin Stack (calendario)
    |-- role customer -> router.replace('/(customer)') -> Customer Tabs (eventos + reservas)
```

### Session Restore

On `AuthProvider` mount, the context reads `auth_token` and `auth_user` from
SecureStore. A valid stored compact user sets `status` to `business` or
`customer`. Missing, malformed, or partial session data is cleared and the app
falls back to `guest`.

The root entry `app/index.tsx` redirects based on restored status:
- `isBusiness` → `/(admin)`
- `isAuthenticated` (customer) → `/(customer)`
- `isGuest` → `/(auth)/login`

### Route Guards

| Level | File | Rule |
|-------|------|------|
| Root entry | `app/index.tsx` | Wait restore, then redirect by role |
| Admin layout | `app/(admin)/_layout.tsx` | `!isBusiness` → login |
| Customer layout | `app/(customer)/_layout.tsx` | `!isAuthenticated` → login, `isBusiness` → admin |

---

## Files

### Screen

**File:** `app/(auth)/login.tsx`

| State | Description |
|-------|-------------|
| `email` | Email input value |
| `password` | Password input value |
| `errors` | Field errors from client or server validation |
| `serverError` | Banner error for credentials, network, or unexpected failures |
| `loading` | Disables inputs and shows button spinner during login |
| `showSuccess` | Registration success banner from `registered=true` query param |

**Functions:**

| Function | Description |
|----------|-------------|
| `getFieldError(field)` | Finds field-specific error text |
| `clearErrors()` | Clears field and banner errors before submit |
| `handleLogin()` | Validates input, calls auth context, routes by role |

### Components

**Reusable UI components used:**

| Component | File | Props / Usage |
|-----------|------|---------------|
| `Input` | `src/components/ui/Input.tsx` | `label`, `placeholder`, `error`, `editable`, `secureTextEntry` |
| `Button` | `src/components/ui/Button.tsx` | `title`, `loading`, `onPress`, disabled while loading |
| `ThemedText` | `src/components/ui/themed-text.tsx` | Title, body text, link text, and banner text |
| `ThemedView` | `src/components/ui/themed-view.tsx` | Screen and form containers |
| `Loader` | `src/components/ui/Loader.tsx` | Session restoration loading state in route guards |
| `LogoutButton` | `src/components/ui/LogoutButton.tsx` | Header-right logout icon in admin and customer layouts |
| `IconSymbol` | `src/components/ui/icon-symbol.tsx` | Tab bar icons and logout icon |
| `IconSymbol` | `src/components/ui/icon-symbol.tsx` | Tab bar icons for customer section |
| `HapticTab` | `src/components/ui/haptic-tab.tsx` | Haptic feedback on tab press |

**Domain-specific components used:**

| Component | File | Purpose |
|-----------|------|---------|
| - | - | No domain-specific component is required for this module |

### Services

**Auth API calls:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `authService.login(req)` | `POST /api/v1/auth/login` | Authenticates user credentials and returns token plus compact user |

**HTTP Client:** `src/services/api.ts`

- Wraps native `fetch` with JSON serialization/deserialization.
- Attaches `Authorization: Bearer <token>` when a saved token exists.
- Persists or clears `auth_token` asynchronously through `setToken()`.
- Throws `ApiError` with `status` and `details` on non-2xx responses.

**Secure Storage:** `src/services/storage.ts`

- Uses `expo-secure-store` for persistent auth data.
- Stores `auth_token` as a string.
- Stores `auth_user` with `JSON.stringify()` and restores it with `JSON.parse()`.

### Context

**File:** `src/context/AuthContext.tsx`

| Method | Description |
|--------|-------------|
| `login(LoginRequest)` | Authenticates, stores token/user, sets role status, returns compact user |
| `register(RegisterRequest)` | Calls registration service and throws on error |
| `logout()` | Clears memory state and stored session data |

**State:**

| Field | Type | Description |
|-------|------|-------------|
| `user` | `AuthUser null` | Current compact authenticated user |
| `status` | `loading`, `guest`, `business`, or `customer` | Session restoration and role state |
| `isAuthenticated` | `boolean` | True for `business` or `customer` |
| `isBusiness` | `boolean` | True only for authenticated business users |
| `isGuest` | `boolean` | True when no valid session exists |
| `isLoading` / `isRestoring` | `boolean` | True while restoring stored session data |

### Types

**File:** `src/types/auth.ts`

| Type | Description |
|------|-------------|
| `UserRole` | Allowed auth roles: `business` or `customer` |
| `AuthenticatedUser` | Compact user returned by login and stored locally |
| `LoginRequest` | Shape of POST body sent to `/api/v1/auth/login` |
| `LoginResponse` | JWT metadata plus `AuthenticatedUser` |
| `UserResponse` | Full user shape kept for `/api/v1/users/me` |
| `FieldError` | `{ field: string, message: string }` |
| `ApiError` | Custom error class with `status` and optional `details` |

### Validators

**File:** `src/utils/validators.ts`

| Function | Description |
|----------|-------------|
| `validateLoginForm(values)` | Returns `FieldError[]` for basic login validation |

**Fields validated:**

| Field | Rules |
|-------|-------|
| `email` | Required, valid email format |
| `password` | Required |

Login intentionally does not enforce registration password strength rules; the
backend handles invalid credentials.

### Config

**File:** `src/config/api.ts`

- Provides `API_BASE_URL` used by `authService.login()`.
- Supports Expo local development through the existing API configuration.

**File:** `app.json`

- Includes the `expo-secure-store` config plugin for native secure storage support.

---

## UI / UX

### Screenshots

> Screenshots were not captured for this issue. The table documents the expected
> states that QA should verify manually.

| State | Screenshot |
|-------|------------|
| Initial | Not captured |
| Client error | Not captured |
| Loading | Not captured |
| Invalid credentials | Not captured |
| Business success | Not captured |
| Customer success | Not captured |

### Component Tree

```text
LoginScreen
|-- ThemedView
|   `-- KeyboardAvoidingView
|       `-- ScrollView
|           |-- Header (ThemedText title + subtitle)
|           |-- SuccessBanner (conditional registered=true)
|           |-- ServerErrorBanner (conditional)
|           `-- Form
|               |-- Input (email)
|               |-- Input (password, secureTextEntry)
|               |-- Button (submit)
|               `-- Footer (Link to register)
```

### Visual States

| State | What the user sees |
|-------|--------------------|
| **Initial** | Email input, password input, submit button, register link |
| **Registered** | Green banner after successful registration redirect |
| **Client error** | Field-level error text for required or invalid values |
| **Server error** | Red banner and field errors when API returns validation details |
| **Loading** | Button spinner, disabled inputs, no duplicate submit |
| **Network error** | Red banner: `No se pudo conectar con el servidor. Verifica tu conexion.` |
| **Business success** | Redirected to `/(admin)` (admin calendar stack) |
| **Customer success** | Redirected to `/(customer)` (customer tabs with eventos + reservas) |
| **Logout** | Logout icon in header-right clears session and redirects to login |

---

## Error Handling

### Client-Side Errors

| Error | Trigger |
|-------|---------|
| `El correo electrónico es obligatorio` | Empty `email` |
| `Ingresa un correo electrónico válido` | Invalid email format |
| `La contraseña es obligatoria` | Empty `password` |

### Server-Side Errors

| Status / Error | Trigger | UI Mapping |
|----------------|---------|------------|
| `401` | Invalid credentials or inactive account | Red banner: `Credenciales inválidas. Verifica tu correo y contraseña.` |
| `422` | Backend validation failure | Field errors from `details[]` plus validation banner |
| `500` or unexpected `ApiError` | Unexpected backend failure | Generic red error banner |
| `TypeError` | Network request failed | Red banner: `No se pudo conectar con el servidor. Verifica tu conexión.` |

---

## Test Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| Render login screen | Email input, password input, submit button, and register link are visible |
| Submit empty form | Email and password required errors are displayed |
| Invalid email format | Email format error is displayed and API is not called |
| Invalid credentials | API 401 displays invalid credentials banner |
| Business login success | Calls `authService.login`, stores session, redirects to `/(admin)` |
| Customer login success | Calls `authService.login`, stores session, redirects to `/(customer)` |
| Network error | API unreachable shows connection error banner |
| Server 500 error | Generic unexpected error banner is displayed |
| Server 422 with details | Field-level errors from `details[]` plus validation banner |
| Login request loading | Inputs are disabled while the request is pending |
| Full browser login flow | Form fill, submit, API call, and role-based redirect all succeed |

---

## Tests

| Layer | Files | Coverage |
|-------|-------|----------|
| Unit | `tests/Unit/login/LoginValidationUnitTest.ts` | Pure login validation rules |
| Feature | `tests/Feature/login/*.tsx` | Render, empty submit, invalid credentials, business success, customer success, network error, server 500, server 422 |
| Browser | `tests/Browser/login/LoginFlowBrowserTest.tsx` | Full business login flow and loading state |

### Commands

```bash
npx jest tests/Unit/login/ tests/Feature/login/ tests/Browser/login/
npx tsc --noEmit
npx expo lint
npm test
```

---

## Technical Notes

### Design Decisions

- **Compact login user**: `LoginResponse.user` uses `AuthenticatedUser` because the login contract does not return full profile fields.
- **Secure session persistence**: `expo-secure-store` replaces memory storage so sessions survive app restarts.
- **Role-based routing**: business users enter the admin stack and customer users enter customer tabs. The login screen bifurcates with a simple `if/else` on the compact user role.
- **Admin is a Stack, not Tabs**: the admin calendar-centric flow (future: date tap, event list, create/edit, reservations) is navigated as a stack, not as tabs.
- **Customer is Tabs**: customers see eventos and reservas as top-level tabs.
- **Minimal login validation**: Login validates required fields and email format only; invalid credentials remain a backend concern.
- **Layered route guards**: the root entry, admin layout, and customer layout each enforce their own access rules.
- **Accessibility**: Button, Input, LogoutButton, and navigation Links expose `accessibilityRole` and `accessibilityState` so screen readers correctly identify interactive elements and their disabled states.
- **Dark mode logout icon**: LogoutButton receives `tintColor` from the navigation header, adapting to light and dark themes. Static hex colors are avoided.

### Known Limitations

- Customer home and reservations screens are placeholders; full event browsing and booking are future features.
- Admin calendar is a placeholder; full Google Calendar-style date navigation is pending.
- Stored sessions are restored locally; token freshness is not validated against `/api/v1/users/me` on startup.
- Screenshots were not captured as part of this documentation update.

---

## Important Notes

- Frontend must not edit `api-contracts/login-user.yaml`; contract changes must be requested in backend.
- `LoginResponse.user` uses `AuthenticatedUser`, not the full `UserResponse`.
- SecureStore stores only strings, so `auth_user` is persisted with `JSON.stringify()` and restored with `JSON.parse()`.
- The login screen does not reject any authenticated role; business and customer both receive valid redirects after login.

---

## Changelog

### v1.2.0 - 2026-06-05

- Applied correct Spanish orthography (diacritics, accents, opening question marks) across login and register screens.
- Added feature tests for network errors, server 500 errors, and server 422 validation with field details.
- Added `accessibilityRole` and `accessibilityState` to Button, Input, LogoutButton, and Link components.
- Made LogoutButton dark-mode compatible via navigation header `tintColor`.
- Renamed `CustomerDeniedFeatureTest` to `CustomerLoginSuccessFeatureTest`.
- Fixed "Restaurando sesión" typo across all layout guards.

### v1.1.0 - 2026-06-05

- Enabled dual business and customer login with role-based redirects.
- Added customer route group with eventos and reservas tabs.
- Converted admin layout from tabs to stack.
- Removed business-only rejection in favor of role-based routing.
- Updated root entry redirect to support restored customer sessions.
- Added reusable LogoutButton component with logout icon in admin and customer headers.

### v1.0.0 - 2026-06-05

- Documented business login implementation.
- Documented SecureStore session persistence and restoration.
- Documented business-only route behavior and login test coverage.

---

## Documentation Checklist

Before considering this document complete:

- [x] API contract file linked
- [x] File map reflects all created/modified files
- [x] Component tree shows screen hierarchy
- [x] All visual states documented (initial, error, loading, success)
- [x] All error messages mapped (client + server)
- [x] Test scenarios verified and passing
- [x] Screenshots section added with current capture status
- [x] Design decisions explained
- [x] Changelog updated

---

**Last updated**: `2026-06-05`
**Documented by**: `Abigail Ramirez Chavarria`
