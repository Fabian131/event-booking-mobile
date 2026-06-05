# [EBM-09] feat(auth): implement user registration screen with client/server validation

---

### Ticket
**EBM-09**: Customer Registration Form

**Sub-Tasks:**
- EBM-09.1: Create the registration interface layout
- EBM-09.2: Add structural validation constraints and translation error messages
- EBM-09.3: Integrate the UI inputs with the authentication registration endpoint
- EBM-09.4: Set up integration test cases to verify successful account processing and proper rejection of misconfigured input fields

---

### Changes Implemented

#### API Contract
- Implements `api-contracts/register-user.yaml` (`POST /api/v1/auth/register`)

#### Types
- Created `src/types/auth.ts` with `RegisterRequest`, `UserResponse`, `LoginRequest`, `LoginResponse`, `FieldError`, `ValidationError`, `ErrorResponse`, `ApiError`, and `AuthUser`

#### Validators
- Created `src/utils/validators.ts` with `validateRegistrationForm()` that accumulates all client-side errors into `FieldError[]`
- 21 validation rules: first_name, last_name, email, phone, password (uppercase, lowercase, number, special char), confirmPassword
- Regex patterns match the API contract exactly (name allows hyphens/apostrophes, phone is exactly 8 digits, password requires all 4 character types)

#### Services
- Created `src/services/api.ts` — HTTP client with `fetch` wrapper, Bearer token support, typed error handling (`ApiError`)
- Created `src/services/storage.ts` — in-memory key-value store for auth tokens
- Created `src/services/auth.ts` — `authService.register()` and `authService.login()` integrating with the API

#### Context / State
- Created `src/context/AuthContext.tsx` — `AuthProvider` with `user`, `isAuthenticated`, `register()`, `login()`, `logout()`
- `register()` calls the API but does NOT auto-login (the endpoint returns no token; user logs in separately)

#### Components
- Created `src/components/ui/Input.tsx` — reusable text input with label, placeholder, error state (red border + message), and password visibility toggle (eye icon via `MaterialIcons`)
- Created `src/components/ui/Button.tsx` — reusable button with loading spinner (`ActivityIndicator`), primary/secondary variants, disabled state
- Created `src/components/ui/Loader.tsx` — full-screen loading indicator with optional message
- Created `src/components/ui/themed-text.tsx` — theme-aware text with `title`, `defaultSemiBold`, and `link` types
- Created `src/components/ui/themed-view.tsx` — theme-aware view container

#### Screen
- Rewrote `app/(auth)/register.tsx` — 6-field form (first_name, last_name, email, phone, password, confirmPassword)
- Keyboard-aware layout with `KeyboardAvoidingView` + `ScrollView`
- Client-side validation on submit with all errors displayed at once
- Server errors (422, 409) mapped to field-level UI
- Server errors (500, network) shown as red banner
- Loading state: button spinner + all inputs disabled
- On 201 success: redirects to Login screen via `router.replace()`

#### Infrastructure
- Created `src/config/api.ts` — auto-detects API base URL from Expo Constants (physical device) with fallback to localhost/10.0.2.2, supports `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_API_PORT` env vars
- Created `.env.example` with documented variables
- Wrapped `app/_layout.tsx` with `AuthProvider`
- Updated `app/index.tsx` to redirect based on `isAuthenticated` state (auth → tabs, no auth → login)
- Created `.github/workflows/ci.yml` — runs `expo lint` + `jest --ci --coverage` on push/PR to main/dev
- Updated `docs/modules/_template.md` to reflect frontend architecture (Expo React Native)
- Updated `docs/04-development/pr-template.md`, `pr-rejected.md`, `pr-approved.md` for frontend context

#### Tests
- Created `tests/validators.test.ts` — 25 unit tests covering all validation rules and edge cases
- Created `tests/register.test.tsx` — 7 integration tests: render, empty form submit, email format, password mismatch, valid submit, server 422 errors, network failure

---

### Modified Files

| File | Description |
|------|-------------|
| `src/types/auth.ts` | Created — all auth-related TypeScript interfaces |
| `src/config/api.ts` | Created — API base URL config with env var support |
| `src/utils/validators.ts` | Created — client-side form validation (21 rules) |
| `src/services/api.ts` | Created — HTTP client with fetch wrapper |
| `src/services/storage.ts` | Created — in-memory token storage |
| `src/services/auth.ts` | Created — auth API service (register, login) |
| `src/context/AuthContext.tsx` | Created — auth state management |
| `src/components/ui/Input.tsx` | Created — reusable input with error + password toggle |
| `src/components/ui/Button.tsx` | Created — reusable button with loading spinner |
| `src/components/ui/Loader.tsx` | Created — loading indicator component |
| `src/components/ui/themed-text.tsx` | Created — theme-aware text |
| `src/components/ui/themed-view.tsx` | Created — theme-aware view |
| `app/(auth)/register.tsx` | Rewritten — full registration screen |
| `app/_layout.tsx` | Updated — wrapped with AuthProvider |
| `app/index.tsx` | Updated — auth-based redirect (tabs vs login) |
| `.github/workflows/ci.yml` | Created — CI pipeline (lint + test) |
| `.env.example` | Created — env var documentation |
| `docs/modules/register.md` | Created — full module documentation |
| `docs/modules/_template.md` | Updated — adapted for frontend context |
| `docs/04-development/pr-template.md` | Updated — adapted for frontend context |
| `docs/04-development/pr-rejected.md` | Updated — adapted for frontend context |
| `docs/04-development/pr-approved.md` | Updated — adapted for frontend context |
| `package.json` | Updated — added test script + jest config |
| `tests/validators.test.ts` | Created — 25 unit tests |
| `tests/register.test.tsx` | Created — 7 integration tests |

---

### API Contract Reference

**File:** `api-contracts/register-user.yaml`

| Method | Route              | Auth | Description               |
|--------|--------------------|------|---------------------------|
| POST   | `/api/v1/auth/register` | No   | Creates a new user account |

---

### Technical Details

- **Reusable Input component**: Centralizes label, placeholder, error state (red border + message), password visibility toggle (eye icon), and disabled state in a single component. Used by both Register and Login screens.
- **Reusable Button component**: Handles `ActivityIndicator` spinner and disabled state internally via `loading` prop. Supports `primary` and `secondary` variants.
- **Two-layer validation**: Client validates structure/format immediately (rules match the API contract regex patterns). Server validates business rules (DNS, uniqueness) and returns all errors at once. Server `details[]` are merged into the same field-level UI as client errors.
- **Environment-driven config**: API URL auto-detected from Expo Go Metro connection. Overridable via `EXPO_PUBLIC_API_URL` in `.env`. Port configurable via `EXPO_PUBLIC_API_PORT`.
- **Spanish UI**: All labels, placeholders, error messages in Spanish to match the target audience.
- **No new dependencies**: All components use built-in React Native APIs + `@expo/vector-icons` (already installed). HTTP client uses native `fetch`.

---

### Important Notes

> **NOTE:** The `Input` component requires `@expo/vector-icons/MaterialIcons` (already a dependency). Tests mock this import to avoid the `expo-font`/`expo-asset` chain in the Jest environment.

> **WARNING:** `register()` in AuthContext does NOT set the user or store a token. The register endpoint does not return a JWT. The Login screen (EBM-10) handles authentication separately.

---

### UI Behavior

| State              | What the user sees                                              |
|--------------------|-----------------------------------------------------------------|
| **Initial**        | Empty form with 6 inputs, all fields ready, submit button active |
| **Client error**   | Red border on affected inputs, error text below each            |
| **Server error**   | Red banner (background: `#fdecea`, border: `#dc3545`) + per-field errors from `details[]` |
| **Loading**        | Button shows `ActivityIndicator` spinner, all inputs `editable={false}`, button opacity 0.5 |
| **Success**        | `router.replace('/(auth)/login')` — redirects to Login screen   |
| **Network error**  | Red banner: "No se pudo conectar con el servidor..."            |

---

### Error Handling

| Error              | Trigger                                          | UI Feedback          |
|--------------------|--------------------------------------------------|----------------------|
| Empty required field | `first_name`, `last_name`, `email`, `password` empty | Field-level red text |
| Name with numbers  | Numbers in `first_name` or `last_name`           | Field-level red text |
| Invalid email      | Wrong format                                     | Field-level red text |
| Phone != 8 digits  | Phone length not 8 or non-digits                 | Field-level red text |
| Weak password      | Missing uppercase/lowercase/number/special char  | Field-level red text |
| Password mismatch  | `password !== confirmPassword`                   | Field-level red text |
| Server 422         | Backend validation failure                       | `details[]` per field |
| Server 409         | Duplicate email or phone                         | `details[]` per field |
| Server 500         | Unexpected server error                          | Generic error banner |
| Network            | `fetch` throws `TypeError`                       | Connection banner    |

---

### How to Test

1. Install dependencies:
   ```bash
   npm ci
   ```

2. Run lint:
   ```bash
   npx expo lint
   ```

3. Run tests:
   ```bash
   npx jest --ci
   ```

4. Start the app:
   ```bash
   npx expo start
   ```

5. Navigate to the registration screen and verify:
   - Empty form shows all 6 fields with labels and placeholders
   - Submitting empty form shows 5+ field-level validation errors
   - Invalid email ("notanemail") shows format error
   - Mismatched passwords show mismatch error
   - Password without special character shows "caracter especial" error
   - Valid submission calls the API and redirects to Login on success
   - Server errors render per-field from `details[]`
   - Network failure shows connection error banner

---

### Test Scenarios

#### Scenario 1: Render screen — PASS

**Given** App is loaded and navigates to Register  
**When** User views the registration screen  
**Then** 6 inputs (nombre, apellido, correo, telefono, contrasena, confirmar) and submit button are visible, plus login link

#### Scenario 2: Empty form submit — FAIL (client validation)

**Given** All fields are empty  
**When** User presses "Registrarse"  
**Then** 5+ field-level errors are displayed simultaneously (nombre obligatorio, apellido obligatorio, correo obligatorio, contrasena obligatoria, confirma tu contrasena)

#### Scenario 3: Invalid email — FAIL (client validation)

**Given** User enters "notanemail" as email, other fields valid  
**When** User presses "Registrarse"  
**Then** "Ingresa un correo electronico valido" error shown under email field

#### Scenario 4: Password mismatch — FAIL (client validation)

**Given** User enters different passwords (Test1234# vs Wrong5678#), other fields valid  
**When** User presses "Registrarse"  
**Then** "Las contrasenas no coinciden" error shown under confirm password field

#### Scenario 5: Valid form submit — PASS

**Given** All fields are valid (John, Doe, test@test.com, Test1234#)  
**When** User presses "Registrarse"  
**Then** `authService.register` is called with correct payload, loading spinner shown, redirect to Login on 201

#### Scenario 6: Server validation error — FAIL (server 422)

**Given** API returns 422 with `details: [{ field: "email", message: "Email domain does not exist" }]`  
**When** User submits valid form  
**Then** Server errors are rendered per-field from the `details[]` array

#### Scenario 7: Network failure — FAIL (network)

**Given** API is unreachable  
**When** User submits valid form  
**Then** Red banner: "No se pudo conectar con el servidor. Verifica tu conexion a internet."

---

### Checklist
- [x] Code compiles without TypeScript errors (`npx tsc --noEmit`)
- [x] Lint passes without errors (`npx expo lint`)
- [x] All tests pass (`npx jest --ci`) — **32/32 passing**
- [x] Commit standards followed (type, scope, descriptive)
- [x] API contract matches the implemented screen
- [x] Documentation updated (`docs/modules/register.md`)
- [x] No debug code, `console.log`, or hardcoded credentials
- [x] Components are reusable (Input, Button, etc. extracted)
- [x] Error messages use Spanish (matching target audience)
- [x] Loading states handled for async operations
- [x] No breaking changes to existing screens or navigation
