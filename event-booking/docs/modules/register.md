# Module: User Registration

---

## General Information

- **Module Code**: `EVB-001`
- **API Contract**: `api-contracts/register-user.yaml`
- **Responsible**: Fabian Sanchez Salinas
- **Status**: Completed
- **Version**: `1.1.0`
- **Created**: `2026-06-05`
- **Last Updated**: `2026-06-05`

---

## Description

Registration screen that allows new customers to create an account by providing
their personal details (first name, last name, email, optional phone, and
password). Implements the `register-user.yaml` contract. Performs client-side
validation before submission, displays both client-side and server-side errors
per field, shows a loading indicator during the network request, and redirects
the user to the Login screen upon successful registration.

---

## API Contract

**File:** `api-contracts/register-user.yaml`

| Method | Route                    | Auth | Description               |
|--------|--------------------------|------|---------------------------|
| POST   | `/api/v1/auth/register`  | No   | Creates a new user account |

### Request Body

| Field        | Type   | Required | Constraints                                                              |
|--------------|--------|----------|--------------------------------------------------------------------------|
| `first_name` | string | Yes      | minLength: 2, maxLength: 50, letters + spaces + hyphens + apostrophes    |
| `last_name`  | string | Yes      | minLength: 2, maxLength: 50, letters + spaces + hyphens + apostrophes    |
| `email`      | string | Yes      | format: email, maxLength: 150, unique                                    |
| `phone`      | string | No       | minLength: 8, maxLength: 8, pattern: `^\d{8}$`, unique                   |
| `password`   | string | Yes      | minLength: 8, maxLength: 255, pattern: uppercase + lowercase + number + special character |

### Response (201 Created)

```json
{
  "id": "a1b2c3d4-...",
  "first_name": "Example",
  "last_name": "User",
  "email": "user@example.com",
  "phone": "12345678",
  "role": "customer",
  "is_active": true,
  "created_at": "2026-06-05T12:00:00Z",
  "updated_at": "2026-06-05T12:00:00Z"
}
```

### Response (422 Validation Error)

```json
{
  "error": "validation_error",
  "message": "One or more validation errors occurred",
  "details": [
    { "field": "first_name", "message": "First name can only contain letters" },
    { "field": "password", "message": "Password must contain at least one uppercase letter" },
    { "field": "password", "message": "Password must contain at least one lowercase letter" },
    { "field": "password", "message": "Password must contain at least one number" },
    { "field": "password", "message": "Password must contain at least one special character" }
  ]
}
```

### Response (409 Conflict)

```json
{
  "error": "validation_error",
  "message": "One or more validation errors occurred",
  "details": [
    { "field": "email", "message": "Email already registered" },
    { "field": "phone", "message": "Phone number already registered" }
  ]
}
```

---

## Architecture

### File Map

```
src/
├── types/
│   └── auth.ts                        # TypeScript interfaces: RegisterRequest, UserResponse,
│                                      #   FieldError, ValidationError, ApiError, LoginRequest,
│                                      #   LoginResponse, AuthUser
├── config/
│   └── api.ts                         # API base URL (auto-detects host via Expo Constants
│                                      #   or reads EXPO_PUBLIC_API_URL from .env)
├── utils/
│   └── validators.ts                  # validateRegistrationForm(): returns FieldError[]
├── services/
│   ├── api.ts                         # HTTP client: fetch wrapper, Bearer token, ApiError
│   ├── storage.ts                     # In-memory key-value storage for auth token
│   └── auth.ts                        # authService.register(), authService.login()
├── context/
│   └── AuthContext.tsx                # AuthProvider: user state, login, register, logout
├── components/
│   ├── ui/
│   │   ├── Input.tsx                  # Reusable input: label, placeholder, error state,
│   │   │                              #   password visibility toggle (MaterialIcons eye icon)
│   │   ├── Button.tsx                 # Reusable button: loading spinner, primary/secondary
│   │   │                              #   variants, disabled state
│   │   ├── Loader.tsx                 # Full-screen loading indicator with message
│   │   ├── themed-text.tsx            # Text with types: title, defaultSemiBold, link
│   │   └── themed-view.tsx            # View container with white background
│   └── domain/
│       ├── EventCard.tsx              # TODO stub (not used in this module)
│       └── ReservationItem.tsx        # TODO stub (not used in this module)
├── hooks/
│   ├── useEvents.ts                   # TODO stub (not used in this module)
│   ├── usePushNotifications.ts        # TODO stub (not used in this module)
│   └── useReservations.ts             # TODO stub (not used in this module)
app/
├── _layout.tsx                        # Root layout: wraps app with AuthProvider
├── index.tsx                          # Entry point: auth-based redirect (tabs vs login)
├── (auth)/
│   ├── _layout.tsx                    # Auth group layout: headerless stack navigator
│   ├── login.tsx                      # Login screen (wireframe, pending implementation)
│   └── register.tsx                   # Registration screen (this module)
└── (tabs)/
    └── ...
tests/
├── validators.test.ts                 # 25 unit tests for validation logic
└── register.test.tsx                  # 7 integration tests for registration screen
```

### Data Flow

```
User fills form (6 fields)
    │
    ▼
Press "Registrarse"
    │
    ▼
handleRegister() in register.tsx
    │
    ├── clearErrors() resets all error states
    │
    ▼
validateRegistrationForm(values)
    │
    ├── Client error? → setErrors(fieldErrors) → red border + text per field
    │
    ▼ No client errors
authService.register(RegisterRequest)
    │
    ├── setLoading(true) → Button shows spinner, inputs disabled
    │
    ▼
api.post('/api/v1/auth/register', data)
    │
    ├── 201 → router.replace('/(auth)/login')
    │
    ├── 422/409 → throw ApiError with details[] → setErrors(details) + setServerError(message)
    │
    ├── 500 → throw ApiError → setServerError(message)
    │
    └── Network error → TypeError → setServerError("No se pudo conectar...")
    │
    ▼
setLoading(false) → Button restored, inputs enabled
```

---

## Files

### Screen

**File:** `app/(auth)/register.tsx`

| State          | Type                     | Description                                      |
|----------------|--------------------------|--------------------------------------------------|
| `firstName`    | `string`                 | First name input value                           |
| `lastName`     | `string`                 | Last name input value                            |
| `email`        | `string`                 | Email input value                                |
| `phone`        | `string`                 | Phone input value (optional)                     |
| `password`     | `string`                 | Password input value                             |
| `confirmPassword` | `string`              | Password confirmation input value                |
| `errors`       | `FieldError[]`           | Per-field errors from client + server validation |
| `serverError`  | `string`                 | Generic error message displayed in red banner    |
| `loading`      | `boolean`                | Disables form during API request                 |

**Functions:**

| Function              | Description                                                 |
|-----------------------|-------------------------------------------------------------|
| `getFieldError(field)`| Looks up and returns the error message for a given field    |
| `clearErrors()`       | Resets `errors` and `serverError` to empty                  |
| `handleRegister()`    | Orchestrates validation, API call, error handling, redirect |

**UI structure:**
- `KeyboardAvoidingView` wraps for iOS keyboard handling
- `ScrollView` with `keyboardShouldPersistTaps="handled"` for scrollable form
- Header: title "Crear Cuenta" + subtitle "Registrate para reservar eventos"
- Server error banner (conditional red box at top)
- 6 `Input` components with labels, placeholders, and error states
- 1 `Button` component for submission
- Footer: "Ya tienes cuenta? Inicia sesion" link to login

### Components

**Reusable UI components used:**

| Component     | File                                  | Key Props                                               |
|---------------|---------------------------------------|---------------------------------------------------------|
| `Input`       | `src/components/ui/Input.tsx`         | `label, error, secureTextEntry, editable, placeholder, keyboardType, autoCapitalize` |
| `Button`      | `src/components/ui/Button.tsx`        | `title, loading, onPress, variant, disabled`            |
| `ThemedText`  | `src/components/ui/themed-text.tsx`   | `type` ("title", "defaultSemiBold", "link"), `style`    |
| `ThemedView`  | `src/components/ui/themed-view.tsx`   | Standard `View` with `backgroundColor: '#fff'`          |

**Password visibility toggle:**
The `Input` component detects the `secureTextEntry` prop and automatically renders an eye icon (`MaterialIcons`: `visibility` / `visibility-off`) as a `TouchableOpacity` positioned absolutely on the right side of the input. Tapping it toggles `showPassword` state, which controls whether `secureTextEntry` is passed to the underlying `TextInput`.

### Services

**Auth API calls:**

| Method                      | Endpoint                        | Returns        | Description            |
|-----------------------------|---------------------------------|----------------|------------------------|
| `authService.register(req)` | `POST /api/v1/auth/register`    | `UserResponse` | Creates a new user     |
| `authService.login(req)`    | `POST /api/v1/auth/login`       | `LoginResponse`| Authenticates user     |

**HTTP Client:** `src/services/api.ts`
- Wraps native `fetch` with `Content-Type: application/json`
- Reads auth token from storage and attaches `Authorization: Bearer <token>`
- Parses response JSON; on non-2xx, throws `ApiError` with `status`, `message`, and `details[]`
- Exports `setToken()` and `getToken()` for token management
- Provides `api.get()`, `api.post()`, `api.put()`, `api.patch()`, `api.delete()`

**Storage:** `src/services/storage.ts`
- Simple in-memory key-value store (`Map<string, string>`)
- `storage.set(key, value)`, `storage.get(key)`, `storage.remove(key)`, `storage.clear()`

### Context

**File:** `src/context/AuthContext.tsx`

| Method                          | Description                                                   |
|---------------------------------|---------------------------------------------------------------|
| `register(RegisterRequest)`     | Calls `authService.register()`. Throws `ApiError` on failure. Does NOT auto-login. |
| `login(LoginRequest)`           | Calls `authService.login()`, stores JWT token, sets user.     |
| `logout()`                      | Clears token via `setToken(null)`, clears user, clears storage. |

**State:**

| Field            | Type            | Description                     |
|------------------|-----------------|---------------------------------|
| `user`           | `AuthUser null` | `UserResponse` from API          |
| `isAuthenticated`| `boolean`       | Derived from `!!user`           |

**Note:** `register()` does not set the user or store a token because the register endpoint returns only user data (no token). The user must log in separately after registration, matching the redirect to the Login screen.

### Types

**File:** `src/types/auth.ts`

| Type                | Description                                                          |
|---------------------|----------------------------------------------------------------------|
| `RegisterRequest`   | `{ first_name, last_name, email, phone?, password }`                |
| `UserResponse`      | `{ id, first_name, last_name, email, phone, role, is_active, created_at, updated_at }` |
| `LoginRequest`      | `{ email, password }`                                               |
| `LoginResponse`     | `{ access_token, token_type, expires_in, user: UserResponse }`      |
| `FieldError`        | `{ field: string, message: string }`                                |
| `ValidationError`   | `{ error, message, details: FieldError[] }`                         |
| `ErrorResponse`     | `{ error, message, details?: Record<string, unknown> }`             |
| `ApiError`          | Custom `Error` subclass: `status`, `message`, `details?: FieldError[]` |
| `AuthUser`          | Type alias for `UserResponse`                                       |

### Validators

**File:** `src/utils/validators.ts`

| Function                          | Returns         | Description                                        |
|-----------------------------------|-----------------|----------------------------------------------------|
| `validateRegistrationForm(values)` | `FieldError[]`  | Accumulates all validation errors into one array   |

**Fields validated:**

| Field                | Rules                                                                                       |
|----------------------|---------------------------------------------------------------------------------------------|
| `first_name`         | Required, min 2 chars, max 50, letters + spaces + hyphens + apostrophes only (incl. accented) |
| `last_name`          | Required, min 2 chars, max 50, letters + spaces + hyphens + apostrophes only (incl. accented) |
| `email`              | Required, valid format, max 150 chars                                                       |
| `phone`              | Optional. If provided: exactly 8 digits                                                      |
| `password`           | Required, min 8 chars, max 255, uppercase + lowercase + number + special character           |
| `confirmPassword`    | Required, must match `password`                                                             |

**Regex patterns used:**
- Name: `` /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s\-']+$/ ``
- Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Phone: `/^\d{8}$/`
- Password uppercase: `/[A-Z]/`
- Password lowercase: `/[a-z]/`
- Password number: `/[0-9]/`
- Password special: `` /[!@#$%^&*(),.?":{}|<>\-_+=\[\]\/\\]/ ``

### Config

**File:** `src/config/api.ts`

API base URL is resolved at runtime with the following priority:

| Priority | Source                                  | Example                                    |
|----------|-----------------------------------------|--------------------------------------------|
| 1        | `EXPO_PUBLIC_API_URL` env var           | `http://192.168.1.100:8000`                |
| 2        | Expo Go Metro host (physical device)    | `http://<computer-ip>:<EXPO_PUBLIC_API_PORT or 8000>` |
| 3        | Platform fallback (emulator/simulator)  | `http://10.0.2.2:8000` or `http://localhost:8000` |

**Configuration via `.env`:**
```bash
# .env file
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000  # Override auto-detection
EXPO_PUBLIC_API_PORT=3000                       # Custom port (default: 8000)
```

`.env` is gitignored; use `.env.example` as a template.

### Entry Point

**File:** `app/index.tsx`

| Route decision          | Condition              |
|-------------------------|------------------------|
| `/(tabs)/` (Dashboard)  | `isAuthenticated` true |
| `/(auth)/login`         | `isAuthenticated` false |

Since token storage is in-memory (no persistence), the app always starts at Login.

---

## UI / UX

### Component Tree

```
RegisterScreen
└── KeyboardAvoidingView (behavior: padding/height)
    └── ScrollView (keyboardShouldPersistTaps: handled)
        ├── Header
        │   ├── ThemedText type="title"  → "Crear Cuenta"
        │   └── ThemedText               → "Registrate para reservar eventos"
        ├── ServerErrorBanner (conditional: serverError is set)
        │   └── ThemedText (red)         → serverError message
        ├── Form (gap: 16)
        │   ├── Input label="Nombre"           → first_name
        │   ├── Input label="Apellido"         → last_name
        │   ├── Input label="Correo electronico" → email (keyboard: email-address)
        │   ├── Input label="Telefono (opcional)" → phone (keyboard: phone-pad)
        │   ├── Input label="Contrasena"       → password (secureTextEntry, eye toggle)
        │   ├── Input label="Confirmar contrasena" → confirmPassword (secureTextEntry, eye toggle)
        │   ├── Button title="Registrarse"     → submit (loading spinner)
        │   └── Footer
        │       ├── ThemedText                → "Ya tienes cuenta? "
        │       └── Link href="/(auth)/login"  → "Inicia sesion"
```

### Visual States

| State              | What the user sees                                              |
|--------------------|-----------------------------------------------------------------|
| **Initial**        | Empty form with 6 inputs, all fields ready, submit button active |
| **Client error**   | Red border on affected inputs, error text (red, 13px) below each |
| **Server error**   | Red banner above form (background: `#fdecea`, border: `#dc3545`) + per-field errors if returned |
| **Loading**        | Button shows `ActivityIndicator` spinner, all inputs `editable={false}`, button opacity 0.5 |
| **Network error**  | Red banner: "No se pudo conectar con el servidor. Verifica tu conexion a internet." |
| **Success**        | `router.replace('/(auth)/login')` - redirects to Login screen automatically |

---

## Error Handling

### Client-Side Errors

All errors are accumulated and displayed simultaneously (matching the API contract behavior of returning all errors at once).

| Error message                                                   | Trigger                                            |
|-----------------------------------------------------------------|----------------------------------------------------|
| "El nombre es obligatorio"                                      | Empty `first_name`                                 |
| "El nombre debe tener al menos 2 caracteres"                    | `first_name.length < 2`                            |
| "El nombre no puede exceder 50 caracteres"                      | `first_name.length > 50`                           |
| "El nombre solo puede contener letras"                          | `first_name` contains numbers/symbols              |
| "El apellido es obligatorio"                                    | Empty `last_name`                                  |
| "El apellido debe tener al menos 2 caracteres"                  | `last_name.length < 2`                             |
| "El apellido no puede exceder 50 caracteres"                    | `last_name.length > 50`                            |
| "El apellido solo puede contener letras"                        | `last_name` contains numbers/symbols               |
| "El correo electronico es obligatorio"                          | Empty `email`                                      |
| "El correo no puede exceder 150 caracteres"                     | `email.length > 150`                               |
| "Ingresa un correo electronico valido"                          | Invalid email format                               |
| "El telefono debe tener exactamente 8 digitos"                  | `phone` length != 8 or contains non-digits         |
| "La contrasena es obligatoria"                                  | Empty `password`                                   |
| "La contrasena debe tener al menos 8 caracteres"                | `password.length < 8`                              |
| "La contrasena no puede exceder 255 caracteres"                 | `password.length > 255`                            |
| "La contrasena debe contener al menos una mayuscula"            | No uppercase letter in password                    |
| "La contrasena debe contener al menos una minuscula"            | No lowercase letter in password                    |
| "La contrasena debe contener al menos un numero"                | No digit in password                               |
| "La contrasena debe contener al menos un caracter especial"     | No special character in password                   |
| "Confirma tu contrasena"                                        | Empty `confirmPassword`                            |
| "Las contrasenas no coinciden"                                  | `password !== confirmPassword`                     |

### Server-Side Errors

| Status   | Condition                  | UI Mapping                                      |
|----------|----------------------------|-------------------------------------------------|
| 422      | Backend validation failure | `details[]` merged into field-level errors      |
| 409      | Duplicate email or phone   | `details[]` merged into field-level errors      |
| 500      | Unexpected server error    | Red banner with `ApiError.message`              |
| Network  | `fetch` throws `TypeError` | Red banner: "No se pudo conectar..."            |
| Unknown  | Any other error            | Red banner: "Ocurrio un error inesperado..."    |

---

## Test Scenarios

| # | Scenario                                    | Expected Result                                            | Status |
|---|---------------------------------------------|------------------------------------------------------------|--------|
| 1 | Render registration screen                  | 6 inputs, submit button, login link visible                | PASS   |
| 2 | Submit empty form                           | 5+ field-level error messages displayed                    | PASS   |
| 3 | Input "notanemail" as email                 | "Ingresa un correo electronico valido" error shown         | PASS   |
| 4 | Input mismatched passwords                  | "Las contrasenas no coinciden" error shown                 | PASS   |
| 5 | Fill all fields correctly and submit        | `authService.register` called with correct RegisterRequest | PASS   |
| 6 | Server returns 422 with field errors        | Per-field errors rendered from API `details[]`             | PASS   |
| 7 | Server unreachable / network error          | "No se pudo conectar con el servidor..." banner shown      | PASS   |

**Validation unit tests** (`tests/validators.test.ts`):

| # | Category         | Tests                                                                     |
|---|------------------|---------------------------------------------------------------------------|
| 1 | `first_name`     | Rejects empty, too short, with numbers; accepts accented, hyphens, apostrophes |
| 2 | `last_name`      | Rejects empty, too short, with numbers                                    |
| 3 | `email`          | Rejects empty, invalid format, missing domain                             |
| 4 | `phone`          | Accepts empty; rejects letters, too short, too long                        |
| 5 | `password`       | Rejects empty, too short, no uppercase, no lowercase, no number, no special char |
| 6 | `confirmPassword`| Rejects empty, mismatched                                                 |
| 7 | Multiple errors  | Returns 5+ errors at once for fully invalid form                          |

**Total:** 25 validator unit tests + 7 screen integration tests = **32 tests passing**

---

## Environment Configuration

### Required Files

| File            | Purpose                                              | Git Tracked |
|-----------------|------------------------------------------------------|-------------|
| `.env`          | Local environment variables (not committed)          | No          |
| `.env.example`  | Template documenting available variables             | Yes         |

### Available Variables

| Variable                  | Default  | Description                                    |
|---------------------------|----------|------------------------------------------------|
| `EXPO_PUBLIC_API_URL`     | auto     | Full API base URL (overrides auto-detection)   |
| `EXPO_PUBLIC_API_PORT`    | `8000`   | API port (used with auto-detected host)        |

---

## Technical Notes

### Design Decisions

- **Reusable Input component**: Centralizes label, placeholder, error state (red border + message), password visibility toggle, and disabled state. Avoids duplicating ~20 lines per input across all forms in the app.
- **Reusable Button component**: Handles loading spinner (`ActivityIndicator`) and disabled state internally via `loading` prop, keeping screen code focused on orchestration.
- **Two-layer validation (client + server)**: Client validates structure and format immediately for fast feedback. Server validates business rules (DNS, uniqueness, password strength) and returns all errors at once. Server errors are merged into the same field-level UI as client errors.
- **Auto-detect API base URL**: Reads the computer's IP from `Constants.expoConfig.hostUri` when running in Expo Go on a physical device. Can be overridden via `EXPO_PUBLIC_API_URL` in `.env`. Port defaults to 8000, configurable via `EXPO_PUBLIC_API_PORT`.
- **No auto-login on register**: The register endpoint does not return a JWT token. The API contract dictates a separate login step. The screen correctly redirects to Login instead of setting the auth state.
- **Spanish UI strings**: All labels, placeholders, error messages, and buttons use Spanish to match the target audience.
- **Accumulated error display**: Both client and server return all errors at once (not one at a time), matching the API contract specification. The `validateRegistrationForm` function returns `FieldError[]` and the API returns `details[]` in the same shape.
- **Environment-driven config**: API URL and port are configurable via `EXPO_PUBLIC_*` variables in `.env`, following Expo's public env var convention. No secrets or credentials are hardcoded in source files.

### Known Limitations

- Token storage uses an in-memory map (`storage.ts`), which does not persist across app restarts. When login is implemented, this should be migrated to `expo-secure-store` for encrypted persistence.
- `ThemedView` and `ThemedText` are currently hardcoded to light theme. Full dark mode support requires wiring the `ThemeContext` into these components.
- No password strength meter or visual feedback beyond the error message.

---

## Changelog

### v1.1.0 — 2026-06-05
- Aligned client-side validation with updated API contract:
  - Phone: changed from 7-15 digits to exactly 8 digits (`^\d{8}$`)
  - Password: added lowercase and special character requirements
  - Name: added support for hyphens (`-`) and apostrophes (`'`)
- Added `role` field to `UserResponse` type
- Added `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_API_PORT` env var support
- Created `.env.example` with documented variables
- Updated tests: 3 new validator tests (lowercase, special char, phone bounds), total 32 tests

### v1.0.0 — 2026-06-05
- Initial implementation of User Registration module
- Created `RegisterScreen` with 6-field form
- Implemented `validateRegistrationForm()` with 20+ validation rules
- Created reusable `Input` component (label, error state, password toggle)
- Created reusable `Button` component (loading spinner, disabled state, variants)
- Built HTTP client (`api.ts`) with Bearer token support
- Created `authService.register()` integrating with `POST /api/v1/auth/register`
- Built `AuthContext` with `register()`, `login()`, and `logout()`
- Added 25 unit tests for validators + 7 integration tests (32 total)
- Created CI workflow (`.github/workflows/ci.yml`)

---

## Documentation Checklist

- [x] API contract file linked
- [x] File map reflects all created/modified files
- [x] Component tree shows screen hierarchy
- [x] All visual states documented (initial, error, loading, success)
- [x] All error messages mapped (client + server)
- [x] Test scenarios verified and passing
- [ ] Screenshots added for each visual state
- [x] Design decisions explained
- [x] Environment configuration documented
- [x] Changelog updated

---

**Last updated**: `2026-06-05`
**Documented by**: Fabian Sanchez Salinas
