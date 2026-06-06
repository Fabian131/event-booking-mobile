# Module: [MODULE NAME]

> Template for documenting frontend modules that implement API contracts.
> Copy this file and complete each section for your module.

---

## General Information

- **Module Code**: `EBM-[XXX]`
- **API Contract**: `api-contracts/[contract-file].yaml`
- **Responsible**: `[Developer name]`
- **Status**: Pending / In Development / Completed / Maintenance
- **Version**: `[e.g. 1.0.0]`
- **Created**: `[YYYY-MM-DD]`
- **Last Updated**: `[YYYY-MM-DD]`

---

## Description

[What does this screen/module do? What problem does it solve and what user
flow does it enable? Reference the original issue/requirement.]

**Example:**
> Registration screen that allows new customers to create an account by
> providing their personal details. Implements the `register-user.yaml` contract.
> On success, redirects the user to the Login screen.

---

## API Contract

**File:** `api-contracts/[contract-file].yaml`

| Method | Route                    | Auth | Description               |
|--------|--------------------------|------|---------------------------|
| POST   | `/api/v1/[route]`        | No   | [Description]             |
| GET    | `/api/v1/[route]`        | Yes  | [Description]             |

### Request Body

| Field        | Type   | Required | Constraints                          |
|--------------|--------|----------|--------------------------------------|
| `field_name` | string | Yes      | minLength: X, maxLength: Y, pattern  |
| `field_name` | string | No       | maxLength: Z, unique                 |

### Response (Success)

```json
{
  "id": "uuid",
  "field": "value"
}
```

### Response (Validation Error)

```json
{
  "error": "validation_error",
  "message": "One or more validation errors occurred",
  "details": [
    { "field": "field_name", "message": "Error description" }
  ]
}
```

---

## Architecture

### File Map

```
src/
├── types/
│   └── auth.ts                        # TypeScript interfaces (Request, Response, errors)
├── config/
│   └── api.ts                         # API base URL configuration
├── utils/
│   └── validators.ts                  # Client-side form validation logic
├── services/
│   ├── api.ts                         # HTTP client (fetch wrapper, token handling)
│   └── auth.ts                        # Auth-specific API calls (login, register)
├── context/
│   └── AuthContext.tsx                # Auth state management (user, login, register, logout)
├── components/
│   ├── ui/
│   │   ├── Input.tsx                  # Reusable input with label, error state, password toggle
│   │   ├── Button.tsx                 # Reusable button with loading spinner, variants
│   │   ├── Loader.tsx                 # Full-screen loading indicator
│   │   ├── themed-text.tsx           # Theme-aware text (title, defaultSemiBold, link)
│   │   └── themed-view.tsx           # Theme-aware view container
│   └── domain/
│       └── [DomainComponent].tsx      # Business-specific reusable components
├── hooks/
│   └── use[Xxx].ts                    # Custom hooks for data fetching or logic
app/
├── _layout.tsx                        # Root layout (providers, navigation config)
├── index.tsx                          # Entry point (auth redirect)
├── (auth)/
│   ├── _layout.tsx                    # Auth group layout (headerless stack)
│   ├── login.tsx                      # Login screen
│   └── register.tsx                   # Registration screen (this module)
└── (admin)/
    └── ...
tests/
└── [module].test.tsx                  # Integration tests for the screen
```

### Data Flow

```
User Input
    │
    ▼
Screen (form state: useState)
    │
    ▼
Client-side Validation (validators.ts)
    │──── Error? ──► Show field-level errors, stop
    │
    ▼
Service Layer (auth.ts → api.ts → fetch)
    │──── Loading: show ActivityIndicator
    │
    ▼
API (/api/v1/[route])
    │
    ▼
┌──────────────────────────────────────┐
│ 201 Success  →  Navigate to next screen
│ 422/409 Error →  Map details[] to field errors
│ 500 Error    →  Show generic error banner
│ Network Error→  Show connection error
└──────────────────────────────────────┘
```

---

## Files

### Screen

**File:** `app/(auth)/[screen].tsx`

| State          | Description                                      |
|----------------|--------------------------------------------------|
| Form fields    | `useState` for each input field                  |
| Field errors   | `useState<FieldError[]>` from client + server    |
| Server error   | `useState<string>` generic/non-field errors     |
| Loading        | `useState<boolean>` disables form during request |

**Functions:**

| Function              | Description                                     |
|-----------------------|-------------------------------------------------|
| `getFieldError(field)`| Returns error message for a given field         |
| `clearErrors()`       | Resets all error states                         |
| `handleSubmit()`      | Validates, calls API, handles response/error    |

### Components

**Reusable UI components used:**

| Component     | File                                  | Props                                               |
|---------------|---------------------------------------|-----------------------------------------------------|
| `Input`       | `src/components/ui/Input.tsx`         | `label, error, secureTextEntry, editable, ...`      |
| `Button`      | `src/components/ui/Button.tsx`        | `title, loading, disabled, variant, onPress`        |
| `ThemedText`  | `src/components/ui/themed-text.tsx`   | `type` (title, defaultSemiBold, link)               |
| `ThemedView`  | `src/components/ui/themed-view.tsx`   | Standard `View` with background                     |

**Domain-specific components used:**

| Component | File | Purpose |
|-----------|------|---------|
| - | - | - |

### Services

**Auth API calls:**

| Method                      | Endpoint                        | Description            |
|-----------------------------|---------------------------------|------------------------|
| `authService.register(req)` | `POST /api/v1/auth/register`    | Creates a new user     |

**HTTP Client:** `src/services/api.ts`
- Wraps native `fetch` with JSON serialization/deserialization
- Attaches `Authorization: Bearer <token>` header when available
- Throws `ApiError` with `status` and `details` on non-2xx responses

### Context

**File:** `src/context/AuthContext.tsx`

| Method                          | Description                              |
|---------------------------------|------------------------------------------|
| `register(RegisterRequest)`     | Calls auth service, throws on error      |
| `login(LoginRequest)`           | Authenticates, stores token, sets user   |
| `logout()`                      | Clears token and user state              |

**State:**

| Field           | Type            | Description                     |
|-----------------|-----------------|---------------------------------|
| `user`          | `AuthUser null` | Current logged-in user          |
| `isAuthenticated` | `boolean`     | Derived from `!!user`           |

### Types

**File:** `src/types/auth.ts`

| Type                | Description                                     |
|---------------------|-------------------------------------------------|
| `RegisterRequest`   | Shape of POST body sent to `/register`          |
| `UserResponse`      | User data returned on successful registration   |
| `FieldError`        | `{ field: string, message: string }`            |
| `ApiError`          | Custom error class with `status`, `details`     |
| `LoginRequest`      | Shape of POST body to `/login`                  |
| `LoginResponse`     | JWT token + user data returned from login       |

### Validators

**File:** `src/utils/validators.ts`

| Function                          | Description                                        |
|-----------------------------------|----------------------------------------------------|
| `validateRegistrationForm(values)` | Returns `FieldError[]` with all accumulated errors |

**Fields validated:**

| Field                | Rules                                                    |
|----------------------|----------------------------------------------------------|
| `first_name`         | Required, min 2, max 50, letters + spaces only           |
| `last_name`          | Required, min 2, max 50, letters + spaces only           |
| `email`              | Required, valid format, max 150                          |
| `phone`              | Optional, 7-15 digits only                               |
| `password`           | Required, min 8, must have uppercase + number            |
| `confirmPassword`    | Required, must match `password`                          |

### Config

**File:** `src/config/api.ts`
- Obtains API base URL dynamically:
  - Expo Go (physical device): extracts computer IP from `Constants.expoConfig.hostUri`
  - Emulator/Simulator fallback: `10.0.2.2:8000` (Android) / `localhost:8000` (iOS)

---

## UI / UX

### Screenshots

> Add screenshots showing each visual state.

| State     | Screenshot |
|-----------|------------|
| Initial   | [Add]      |
| Valid     | [Add]      |
| Errors    | [Add]      |
| Loading   | [Add]      |
| Success   | [Add]      |

### Component Tree

```
RegisterScreen
├── KeyboardAvoidingView
│   └── ScrollView
│       ├── Header (ThemedText: title + subtitle)
│       ├── ServerErrorBanner (conditional)
│       ├── Form
│       │   ├── Input (first_name)
│       │   ├── Input (last_name)
│       │   ├── Input (email)
│       │   ├── Input (phone, optional)
│       │   ├── Input (password, secureTextEntry)
│       │   ├── Input (confirmPassword, secureTextEntry)
│       │   ├── Button (submit)
│       │   └── Footer (Link → login)
│       └──
```

### Visual States

| State          | What the user sees                                      |
|----------------|--------------------------------------------------------|
| **Initial**    | Empty form, all fields ready, submit button active     |
| **Client error** | Red border on affected inputs, error text below each  |
| **Server error** | Red banner above form + per-field errors if returned  |
| **Loading**    | Button shows spinner, all inputs disabled, button dimmed |
| **Network error** | Red banner: "No se pudo conectar..."                  |
| **Success**    | Redirect to Login screen automatically                 |

---

## Error Handling

### Client-Side Errors

| Error                                               | Trigger                          |
|-----------------------------------------------------|----------------------------------|
| "El nombre es obligatorio"                          | Empty `first_name`               |
| "El nombre debe tener al menos 2 caracteres"        | `first_name.length < 2`          |
| "El nombre solo puede contener letras"              | `first_name` contains numbers    |
| "Ingresa un correo electrónico válido"              | Invalid email format             |
| "La contraseña debe tener al menos 8 caracteres"    | `password.length < 8`            |
| "La contraseña debe contener al menos una mayúscula"| No uppercase letter              |
| "La contraseña debe contener al menos un número"    | No digit                         |
| "Las contraseñas no coinciden"                      | `password !== confirmPassword`   |

### Server-Side Errors

| Status | API Response `details[]`                  | UI Mapping                                |
|--------|-------------------------------------------|-------------------------------------------|
| 422    | `[{ field, message }]` (all accumulated)  | Per-field red border + error text         |
| 409    | `[{ field, message }]` (duplicates)       | Per-field red border + error text         |
| 500    | `{ error, message }`                      | Red banner: `message`                     |
| Network | `TypeError` thrown by `fetch`            | Red banner: "No se pudo conectar..."      |

---

## Test Scenarios

| Scenario                                          | Expected Result                                      |
|---------------------------------------------------|------------------------------------------------------|
| Render registration screen                        | All 6 inputs and submit button are visible           |
| Submit empty form                                 | 5+ field errors displayed                            |
| Invalid email ("notanemail")                      | Email format error shown                             |
| Password mismatch                                 | "Las contraseñas no coinciden" error                 |
| Valid form submission                             | `authService.register` called with correct payload   |
| Server returns 422 with field errors              | Per-field errors rendered from API `details`         |
| Server returns 409 (duplicate email/phone)        | Per-field errors rendered from API `details`         |
| Server returns 500                                | Generic error banner displayed                       |
| Network error / server unreachable               | "No se pudo conectar con el servidor..." banner      |
| Successful registration (201)                     | Redirect to Login screen                             |

---

## Technical Notes

### Design Decisions

- **[Reusable Input]**: The `Input` component centralizes label, error state, and password toggle, avoiding duplication across all forms in the app.
- **[Reusable Button]**: The `Button` component handles loading spinner and disabled state internally, keeping screens clean.
- **[Two-layer validation]**: Client validates showstoppers immediately (format, required, length). Server validates business rules (DNS, duplicates) and returns all errors at once, which are merged into the same field-level UI.
- **[Auto-detect API URL]**: The API config reads the computer's IP from Expo Constants on physical devices, so no manual IP config is needed per developer or per machine.

### Known Limitations

- [Limitation 1 and plan to resolve it]
- [Limitation 2]

---

## Changelog

### v1.0.0 — YYYY-MM-DD
- Initial implementation
- [Feature added]

---

## Documentation Checklist

Before considering this document complete:

- [ ] API contract file linked
- [ ] File map reflects all created/modified files
- [ ] Component tree shows screen hierarchy
- [ ] All visual states documented (initial, error, loading, success)
- [ ] All error messages mapped (client + server)
- [ ] Test scenarios verified and passing
- [ ] Screenshots added for each visual state
- [ ] Design decisions explained
- [ ] Changelog updated

---

**Last updated**: `[YYYY-MM-DD]`
**Documented by**: `[Name]`
