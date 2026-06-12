# Module: Create/Edit Event (Admin)

---

## General Information

- **Module Code**: `EBM-03` (create) · `EBM-05` (edit)
- **API Contracts**: `api-contracts/create-event.yaml` · `api-contracts/update-event.yaml`
- **Responsible**: Luis F Rosales Vargas, Abigail Ramírez Chavarría, Justin Moreira Matarrita
- **Status**: Completed
- **Version**: `1.1.0`
- **Created**: `2026-06-05`
- **Last Updated**: `2026-06-10`

---

## Description

Screens accessible only to authenticated users with the `business` role that
allow admins to create and update event information. The create screen collects
all required event information, validates it client-side, uploads an optional
image, and sends the payload to `POST /api/v1/events` as a
`multipart/form-data` request.

The edit screen receives an event ID from the route, fetches the existing entity
with `GET /api/v1/events/{event_id}`, pre-populates the same form structure,
reuses the creation validation constraints, requires an irreversible-action
native confirmation dialog, and sends changes to `PUT /api/v1/events/{event_id}`
as `multipart/form-data`.

On success each screen navigates back to the previous admin screen.
On a schedule conflict the backend returns a localized Spanish error banner.

---

## API Contracts

### Create Event

**File:** `api-contracts/create-event.yaml`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/v1/events` | Bearer (business) | Creates a new event with optional image upload |

### Request Body (`multipart/form-data`)

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string | Yes | min: 3, max: 64 characters |
| `description` | string | No | max: 255 characters |
| `max_capacity` | integer | Yes | min: 1, max: 9,999,999 |
| `category` | string | Yes | Enum: `sports`, `music`, `culture`, `gastronomy`, `wellness`, `education`, `other` |
| `date` | string (YYYY-MM-DD) | Yes | Must not be in the past |
| `start_time` | string (HH:MM:SS) | Yes | |
| `end_time` | string (HH:MM:SS) | Yes | Must be after `start_time` |
| `image` | file | No | max: 5 MB, image/* MIME type |

### Update Event

**File:** `api-contracts/update-event.yaml`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| PUT | `/api/v1/events/{event_id}` | Bearer (business) | Partially updates an existing event with optional image replacement |

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `event_id` | string (UUID) | Yes | Event identifier read from the route segment `[id]` |

#### Request Body (`multipart/form-data`)

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string | No | min: 3, max: 64 characters |
| `description` | string | No | max: 255 characters |
| `max_capacity` | integer | No | min: 1, max: 9,999,999 |
| `category` | string | No | Enum: `sports`, `music`, `culture`, `gastronomy`, `wellness`, `education`, `other` |
| `date` | string (YYYY-MM-DD) | No | Must not be in the past when provided |
| `start_time` | string (HH:MM:SS) | No | Used with `end_time` for schedule validation |
| `end_time` | string (HH:MM:SS) | No | Must be after `start_time` when both are provided |
| `image` | file | No | New event banner image; omitted when the existing remote URL is kept |
| `is_active` | boolean | No | Not exposed by the current mobile edit form |

### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Gran Concierto",
  "description": "Un evento espectacular",
  "image_url": "https://storage.example.com/events/image.jpg",
  "max_capacity": 500,
  "remaining_capacity": 500,
  "category": "music",
  "date": "2026-07-15",
  "start_time": "19:00:00",
  "end_time": "23:00:00",
  "is_active": true,
  "created_at": "2026-06-06T00:00:00Z",
  "updated_at": "2026-06-06T00:00:00Z"
}
```

### Response (422 Validation Error)

```json
{
  "error": "validation_error",
  "message": "One or more validation errors occurred",
  "details": [
    { "field": "title", "message": "..." },
    { "field": "max_capacity", "message": "..." }
  ]
}
```

### Response (409 Schedule Conflict)

```json
{
  "error": "schedule_conflict",
  "message": "An event already occupies this date and time slot",
  "details": [
    { "field": "schedule", "message": "An event already occupies this date and time slot" }
  ]
}
```

---

## Architecture

### File Map

```text
app/
|-- (admin)/
|   |-- _layout.tsx                   # Admin Stack guard + create/edit route registration
|   |-- index.tsx                     # Temporary create/edit navigation entry points
|   |-- create-event.tsx              # Create event screen
|   `-- edit-event/
|       `-- [id].tsx                  # Edit event screen (route ID pre-population)
src/
|-- components/
|   `-- ui/
|       |-- BottomModal.tsx          # Reusable bottom-sheet modal wrapper
|       |-- Button.tsx               # Primary submit/action button
|       |-- Input.tsx                # Labeled text input with error state
|       |-- JSDatePicker.tsx         # Pure-JS Day/Month/Year spinner
|       |-- JSTimePicker.tsx         # Pure-JS Hour/Minute spinner
|       |-- Loader.tsx               # Full-screen loader for edit pre-fetch
|       |-- UnitSpinner.tsx          # ▲/▼ increment/decrement control
|       |-- themed-text.tsx          # Shared text wrapper
|       `-- themed-view.tsx          # Shared view wrapper
|-- constants/
|   `-- ui.ts                        # EVENTS, ADMIN, ERRORS, VALIDATION, CATEGORY strings
|-- services/
|   |-- api.ts                       # HTTP client: postForm(), putForm(), auth token injection
|   `-- events.ts                    # eventsService.create(), update(), getById(), list()
|-- hooks/
|   |-- useEventDetail.ts            # Loads existing event data for edit pre-population
|   `-- useEvents.ts                 # Loads events for the temporary admin selector
|-- types/
|   |-- auth.ts                      # FieldError, ApiError
|   `-- events.ts                    # Event, EVENT_CATEGORIES, EventCategory
|-- utils/
|   `-- validators.ts                # validateCreateEventForm()
tests/
|-- Unit/create-event/
|   |-- TitleValidationUnitTest.ts
|   |-- CapacityValidationUnitTest.ts
|   |-- DateTimeValidationUnitTest.ts
|   `-- DescriptionValidationUnitTest.ts
|-- Feature/create-event/
|   |-- EmptySubmitFeatureTest.tsx
|   |-- ServerErrorFeatureTest.tsx
|   |-- ValidSubmitFeatureTest.tsx
|   |-- Server422ValidationFeatureTest.tsx
|   |-- NetworkErrorFeatureTest.tsx
|   `-- GenericServerErrorFeatureTest.tsx
|-- Feature/edit-event/
|   `-- EditEventFeatureTest.tsx
`-- Browser/create-event/
    `-- CreateEventFlowBrowserTest.tsx
```

### Data Flow — Create

```text
Admin fills form (title, description, capacity, category, date, start_time, end_time, image)
    |
    v
handleSubmit() in app/(admin)/create-event.tsx
    |
    v
validateCreateEventForm(values)   <-- client-side validation
    |-- Error? --> show field-level errors below each selector/input, stop
    |
    v
Build FormData (multipart/form-data)
    |
    v
eventsService.create(FormData)  --> POST /api/v1/events (Bearer token)
    |
    v
.-----------------------------------------.
| 201  --> router.back()                   |
| 409  schedule conflict                   |
|       --> Spanish error banner           |
| 422  validation details                  |
|       --> per-field error text           |
| 500 / ApiError --> generic error banner  |
| TypeError (network) --> connection banner|
`-----------------------------------------`
```

### Data Flow — Edit

```text
Admin selects an event from the temporary selector or navigates to /(admin)/edit-event/[id]
    |
    v
EditEventScreen reads id with useLocalSearchParams()
    |
    v
useEventDetail(id) --> eventsService.getById(id) --> GET /api/v1/events/{id}
    |
    v
useEffect pre-populates title, description, capacity, category, date, times, image_url
    |
    v
Admin edits fields and taps "Guardar Cambios"
    |
    v
validateCreateEventForm(values)   <-- exact same structural constraints as create
    |-- Error? --> show field-level errors, stop
    |
    v
Alert.alert() irreversible transaction warning
    |-- Cancel --> no request
    |-- Confirm --> build FormData
    |
    v
eventsService.update(id, FormData) --> PUT /api/v1/events/{id} (Bearer token)
    |
    v
.------------------------------------------------.
| 200  --> success banner + router.back()          |
| 409  schedule conflict                           |
|       --> Spanish error banner                   |
| 422  validation details                          |
|       --> per-field error text                   |
| 500 / ApiError --> generic error banner          |
| TypeError (network) --> connection banner        |
`------------------------------------------------`
```

---

## Files

### Screen

#### Create — `app/(admin)/create-event.tsx`

| State | Description |
|-------|-------------|
| `title` | Event title input |
| `description` | Optional description input |
| `maxCapacity` | Max attendees as string (parsed on validation) |
| `category` | Selected category value |
| `date` | Selected event date (`Date \| null`) |
| `startTime` | Selected start time (`Date \| null`) |
| `endTime` | Selected end time (`Date \| null`) |
| `imageUri` | URI of selected image from gallery |
| `showAndroidDate/Start/End` | Controls Android native `DateTimePicker` visibility |
| `catModal / dateModal / startModal / endModal` | Controls iOS bottom-sheet modal visibility |
| `tmpDate / tmpStart / tmpEnd` | Temp values edited in iOS modals before confirmation |
| `errors` | `FieldError[]` from client validation or server `details[]` |
| `serverError` | Generic banner for schedule conflicts, network, or 500 errors |
| `loading` | Disables all inputs and shows button spinner during API call |

**Functions:**

| Function | Description |
|----------|-------------|
| `err(field)` | Returns error message for a given field |
| `setErrors([]); setServerError(''); setSuccess(false);` | Resets all error and success states inline before submit |
| `openDate/Start/End()` | Opens Android native picker or iOS modal based on `Platform.OS` |
| `pickImage()` | Launches image library picker via `expo-image-picker` |
| `handleSubmit()` | Validates, builds `FormData`, calls `eventsService`, handles response |

#### Edit — `app/(admin)/edit-event/[id].tsx`

The edit screen intentionally mirrors the create form instead of introducing a
separate UI abstraction. This keeps the validation, field order, selector
behavior, image picker, and error rendering identical for both admin flows.

| State | Description |
|-------|-------------|
| `id` | Route parameter from `useLocalSearchParams<{ id: string }>()` |
| `event` | Loaded by `useEventDetail(id)` before the form is shown |
| `initialized` | Prevents repeated pre-population after user edits local state |
| `imageChanged` | Tracks whether the user selected a new local image file |
| `title`, `description`, `maxCapacity`, `category`, `date`, `startTime`, `endTime` | Same field state as create, initialized from the loaded event |
| `imageUri` | Existing remote `image_url` for preview, or local file URI after replacement |
| `errors`, `serverError`, `success`, `loading` | Same error/success/loading state pattern as create |

**Functions:**

| Function | Description |
|----------|-------------|
| `parseDateFromString()` | Converts API `YYYY-MM-DD` date string into a local `Date` object |
| `parseTimeFromString()` | Converts API `HH:MM:SS` time string into a local `Date` object |
| `buildUpdateFields()` | Builds the textual fields shared by update FormData |
| `buildFormData()` | Builds `multipart/form-data`; appends `image` only when `imageChanged === true` |
| `handleSubmit()` | Runs the same `validateCreateEventForm()` checks, then opens the confirmation Alert |
| `doUpdate()` | Sends `eventsService.update(id, formData)` only after explicit confirmation |

#### Cross-Platform Picker Strategy

| Component | Android | iOS (Expo Go) |
|-----------|---------|----------------|
| **Category** | `Modal` + `FlatList` | `Modal` + `FlatList` (same) |
| **Date** | Native `DateTimePicker` dialog | `Modal` + `JSDatePicker` (pure JS ▲/▼ spinners) |
| **Start / End Time** | Native `DateTimePicker` dialog | `Modal` + `JSTimePicker` (pure JS ▲/▼ spinners) |

> **Why pure JS for iOS?**  
> `@react-native-community/datetimepicker` with `display="spinner"` inside a
> `Modal` renders as transparent/invisible in **Expo Go on iOS** due to a known
> issue with the native module in managed workflow. Pure-JS `UnitSpinner`
> components (`▲ value ▼`) are used instead and work on both platforms.
> `@react-native-picker/picker` was removed entirely for the same reason.

### Services

**File:** `src/services/events.ts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `eventsService.create(formData)` | `POST /api/v1/events` | Sends multipart request and returns `Event` |
| `eventsService.update(id, formData)` | `PUT /api/v1/events/{id}` | Sends multipart update request and returns `Event` |
| `eventsService.getById(id)` | `GET /api/v1/events/{id}` | Fetches the existing event for edit pre-population |

**File:** `src/services/api.ts`

| Method | Description |
|--------|-------------|
| `api.postForm()` | Sends `POST` requests with `FormData` without forcing a JSON `Content-Type` |
| `api.putForm()` | Sends `PUT` requests with `FormData` for event updates with optional image replacement |

**HTTP Client:** `src/services/api.ts`

- Attaches `Authorization: Bearer <token>` automatically.
- Throws `ApiError` with `status` and `details` on non-2xx responses.

### Validators

**File:** `src/utils/validators.ts`

| Function | Description |
|----------|-------------|
| `validateCreateEventForm(values)` | Returns accumulated `FieldError[]` for all create/edit form fields |

**Fields validated:**

| Field | Rules |
|-------|-------|
| `title` | Required, min 3, max 64 characters |
| `description` | Optional, max 255 characters |
| `max_capacity` | Required, numeric, min 1, max 9,999,999 |
| `category` | Required, valid enum: `sports`, `music`, `culture`, `gastronomy`, `wellness`, `education`, `other` |
| `date` | Required, must not be in the past (compared at midnight) |
| `start_time` | Required |
| `end_time` | Required, must be after `start_time` |

### Components

| Component | File | Description |
|-----------|------|-------------|
| `Input` | `src/components/ui/Input.tsx` | Labeled `TextInput` with error state; used for title, description, and capacity |
| `Button` | `src/components/ui/Button.tsx` | Primary action button with loading state |
| `Loader` | `src/components/ui/Loader.tsx` | Full-screen loader while edit fetches the existing event |
| `UnitSpinner` | `src/components/ui/UnitSpinner.tsx` | Single ▲ value ▼ control. Reused by `JSDatePicker` and `JSTimePicker` |
| `JSDatePicker` | `src/components/ui/JSDatePicker.tsx` | Day / Month / Year spinner using `UnitSpinner`. Enforces `minimumDate = today` |
| `JSTimePicker` | `src/components/ui/JSTimePicker.tsx` | Hour / Minute spinner (±1 min) using `UnitSpinner` |
| `BottomModal` | `src/components/ui/BottomModal.tsx` | Reusable bottom-sheet modal wrapper: overlay + header with "Listo" button + children |
| `ThemedText` | `src/components/ui/themed-text.tsx` | Shared text wrapper for title, labels, banners, and selector values |
| `ThemedView` | `src/components/ui/themed-view.tsx` | Shared view wrapper for form and screen containers |

---

## UI / UX

### Screenshots

> Screenshots not captured for this module. Verify each state manually on device.

| State | Screenshot |
|-------|------------|
| Initial (empty form) | Not captured |
| Field validation errors | Not captured |
| Category modal open | Not captured |
| Date modal open (iOS) | Not captured |
| Time modal open (iOS) | Not captured |
| Loading (submit) | Not captured |
| Schedule conflict error | Not captured |
| Success | Not captured |

### Component Tree

```text
CreateEventScreen / EditEventScreen
`-- ThemedView
    |-- KeyboardAvoidingView
    |   `-- ScrollView
    |       |-- Header (ThemedText: title + subtitle)
    |       |-- SuccessBanner (conditional)
    |       |-- ServerErrorBanner (conditional)
    |       `-- Form (ThemedView)
    |           |-- Input (title)
    |           |-- Input (description)
    |           |-- Input (max_capacity, numeric keyboard)
    |           |-- TouchableOpacity --> Category selector
    |           |-- TouchableOpacity --> Date selector
    |           |   `-- DateTimePicker (Android only, conditional)
    |           |-- TouchableOpacity --> Start time selector
    |           |   `-- DateTimePicker (Android only, conditional)
    |           |-- TouchableOpacity --> End time selector
    |           |   `-- DateTimePicker (Android only, conditional)
    |           |-- TouchableOpacity --> Image picker
    |           |-- Image preview (conditional)
    |           `-- Button (Crear Evento / Guardar Cambios)
    |-- Modal (category)
    |   `-- BottomModal --> FlatList of CATEGORIES
    |-- Modal (date)
    |   `-- BottomModal --> JSDatePicker
    |-- Modal (start time)
    |   `-- BottomModal --> JSTimePicker
    `-- Modal (end time)
        `-- BottomModal --> JSTimePicker

Edit-only:
|-- Loader while useEventDetail(id) fetches the existing event
`-- Alert.alert confirmation before calling eventsService.update()
```

### Visual States

| State | What the user sees |
|-------|--------------------|
| **Initial** | Empty form, all selectors show placeholder text, submit button active |
| **Client error** | Red border + error text below each invalid field/selector |
| **Schedule conflict** | Red banner: `Ya existe un evento programado en esta fecha y horario. Por favor selecciona otro.` |
| **Server validation (422)** | Per-field errors rendered from API `details[]` |
| **Loading** | Button shows spinner, all inputs/selectors disabled |
| **Edit pre-loading** | Full-screen loader while the existing event is fetched by route ID |
| **Edit confirmation** | Native `Alert.alert` warns the transaction is irreversible; request only fires on explicit confirmation |
| **Network error** | Red banner: `No se pudo conectar con el servidor. Verifica tu conexión a internet.` |
| **Success** | `router.back()` — returns to previous admin screen |

---

## Error Handling

### Client-Side Errors

| Error | Trigger |
|-------|---------|
| `El título es obligatorio` | Empty `title` |
| `El título debe tener al menos 3 caracteres` | `title.length < 3` |
| `El título no puede exceder 64 caracteres` | `title.length > 64` |
| `La descripción no puede exceder 255 caracteres` | `description.length > 255` |
| `La capacidad máxima es obligatoria` | Empty `max_capacity` |
| `La capacidad debe ser al menos 1` | `max_capacity < 1` or NaN |
| `La capacidad no puede exceder 9999999` | `max_capacity > 9999999` |
| `La categoría es obligatoria` | No category selected |
| `La fecha es obligatoria` | No date selected |
| `La fecha no puede ser en el pasado` | Date is before today (midnight comparison) |
| `La hora de inicio es obligatoria` | No start time selected |
| `La hora de fin es obligatoria` | No end time selected |
| `La hora de fin debe ser posterior a la de inicio` | `end_time <= start_time` |

### Server-Side Errors

| Status | Trigger | UI Mapping |
|--------|---------|------------|
| `422` | Pydantic/business validation failure | Per-field errors from `details[]` |
| `409` `field: schedule` | Event already booked at that date/time | Red banner in Spanish (translated client-side) |
| `500` / unexpected `ApiError` | Unexpected backend failure | Generic red error banner |
| `TypeError` | Network unreachable | Red banner: `No se pudo conectar con el servidor.` |

> **Translation note:** The backend returns schedule conflicts in English
> (`"An event already occupies this date and time slot"`). The screen intercepts
> any error with `field === "schedule"` and replaces the message with the
> Spanish string before displaying it.

---

## Test Scenarios

| Scenario | Layer | Expected Result |
|----------|-------|-----------------|
| Empty title | Unit | `title` error returned |
| Title < 3 chars / > 64 chars | Unit | `title` error returned |
| Invalid capacity (0, NaN, > 9999999) | Unit | `max_capacity` error returned |
| Past date | Unit | `date` error returned |
| `end_time <= start_time` | Unit | `end_time` error returned |
| Empty description (optional) | Unit | No error, field is optional |
| Description > 255 chars | Unit | `description` error returned |
| Valid category | Unit | No error |
| Invalid category (not in enum) | Unit | `category` error returned |
| Today date (happy path) | Unit | No error |
| Submit empty form | Feature | All field errors shown, API not called |
| Schedule conflict (409) | Feature | Spanish error banner displayed |
| Server 422 validation | Feature | Server-side `details[]` rendered as field errors |
| Network error (TypeError) | Feature | Connection error banner displayed |
| Generic server error (500) | Feature | Unexpected error banner displayed |
| Valid data, API succeeds | Feature | `eventsService.create` called, success banner shown, `router.back()` invoked |
| Complete happy-path flow | Browser | Category modal → date modal → time modals → submit → API call → redirect |
| Edit route pre-populates fields | Feature | Existing values from `GET /api/v1/events/{id}` appear before editing |
| Edit confirmation cancel | Feature | User cancels `Alert.alert`; no `PUT` request is sent |
| Edit confirmation accept | Feature | User confirms `Alert.alert`; `eventsService.update()` sends `PUT multipart/form-data` |
| Edit update response image URL | Feature | Returned `Event.image_url` is stored for the preview after success |
| Edit without image replacement | Feature | Existing remote `image_url` is shown but not appended as a file |

---

## Tests

| Layer | Files | Coverage |
|-------|-------|----------|
| Unit | `tests/Unit/create-event/TitleValidationUnitTest.ts` | Title min/max/required rules |
| Unit | `tests/Unit/create-event/CapacityValidationUnitTest.ts` | Capacity range and NaN rules |
| Unit | `tests/Unit/create-event/DateTimeValidationUnitTest.ts` | Past date, end > start, category required, category enum, today date |
| Unit | `tests/Unit/create-event/DescriptionValidationUnitTest.ts` | Optional field: empty passes, >255 fails |
| Feature | `tests/Feature/create-event/EmptySubmitFeatureTest.tsx` | All field errors on empty submit, API not called |
| Feature | `tests/Feature/create-event/ServerErrorFeatureTest.tsx` | Schedule conflict banner in Spanish |
| Feature | `tests/Feature/create-event/ValidSubmitFeatureTest.tsx` | API called + success banner + `router.back()` on success |
| Feature | `tests/Feature/create-event/Server422ValidationFeatureTest.tsx` | Server-side field validation errors from `details[]` |
| Feature | `tests/Feature/create-event/NetworkErrorFeatureTest.tsx` | Network error banner on `TypeError` |
| Feature | `tests/Feature/create-event/GenericServerErrorFeatureTest.tsx` | Generic error banner on unexpected error |
| Feature | `tests/Feature/edit-event/EditEventFeatureTest.tsx` | Edit prefill, confirmation cancel/accept, update response image URL, schedule conflict, and 422 details |
| Browser | `tests/Browser/create-event/CreateEventFlowBrowserTest.tsx` | Full form fill → modal interactions → API call → redirect |

### Commands

```bash
npx jest tests/Unit/create-event/
npx jest tests/Feature/create-event/
npx jest tests/Feature/edit-event/
npx jest tests/Browser/create-event/
npx jest tests/Unit/create-event/ tests/Feature/create-event/ tests/Feature/edit-event/ tests/Browser/create-event/
npx tsc --noEmit
npx expo lint
```

---

## Technical Notes

### Design Decisions

- **`multipart/form-data` instead of JSON:** The API contract requires form
  encoding to support the optional image file upload in the same request.

- **Edit reuses create validation:** `validateCreateEventForm()` is used by both
  create and edit to enforce the same title, description, capacity, category,
  date, and non-overlap time constraints before calling the API.

- **Native irreversible confirmation:** Edit uses `Alert.alert()` before `PUT` so
  the user must explicitly confirm the transactional update after client-side
  validation succeeds.

- **Remote image URL is not re-uploaded:** The edit screen preloads `image_url`
  for preview, but tracks `imageChanged` separately. The `image` field is only
  appended to `FormData` when the user selects a new local file with
  `expo-image-picker`. This prevents treating an existing Cloudinary URL as a
  local mobile file upload.

- **Max capacity = 9,999,999 (INTEGER, not SMALLINT):** The database column was
  originally created as `SMALLINT` (max 32,767). The backend model and initial
  migration were updated to use PostgreSQL `INTEGER` to honour the business
  rule. The Pydantic schema enforces `le=9999999`.

- **No `@react-native-picker/picker` dependency:** The native Picker module is
  not bundled in Expo Go for iOS. A pure-JS bottom-sheet modal with `FlatList`
  is used for category selection on all platforms.

- **Pure-JS date/time pickers for iOS:** `DateTimePicker display="spinner"`
  renders as invisible inside a `Modal` in Expo Go on iOS. `JSDatePicker` and
  `JSTimePicker` — built with plain `View` and `TouchableOpacity` — bypass this
  limitation entirely while keeping Android on the native picker for a better UX.

- **Temp state for modal editing:** Date and time values are first stored in
  `tmpDate / tmpStart / tmpEnd`. They are only committed to the real state when
  the user presses "Listo", matching the expected UX of iOS-style pickers.

- **Past date prevention — two layers:** `minimumDate={new Date()}` restricts
  the Android native picker at the UI level. `validateCreateEventForm` also
  rejects past dates at the JS level as a safety net for any platform.

- **Schedule conflict translated client-side:** The backend always returns the
  error message in English. Rather than changing the backend contract, the screen
  intercepts errors with `field === "schedule"` and replaces the message with the
  correct Spanish string before displaying it.

### Known Limitations

- The image picker is limited to the device gallery (`launchImageLibraryAsync`);
  camera capture is not supported in this version.
- The iOS modals dismiss by pressing "Listo" or tapping the overlay; there is no
  explicit "Cancelar" button.
- The admin dashboard includes a temporary event selector to reach edit routes.
  It currently lists events through `useEvents()` and should be replaced by the
  final admin calendar/list interaction once that flow is implemented.

---

## Changelog

### v1.1.0 — 2026-06-09

- Added `EditEventScreen` at `app/(admin)/edit-event/[id].tsx`.
- Registered `edit-event/[id]` in the admin Stack layout.
- Added provisional admin dashboard selector to access edit routes from the UI.
- Added edit UI constants under `EVENTS` and temporary selector constants under `ADMIN`.
- Added `api.putForm()` and `eventsService.update(id, formData)` for `PUT /api/v1/events/{event_id}`.
- Reused create form inputs, selectors, image picker, and `validateCreateEventForm()` for edit.
- Added route-ID pre-population via `useEventDetail(id)` and `useLocalSearchParams()`.
- Added native irreversible confirmation with `Alert.alert()` before submitting changes.
- Added `imageChanged` guard so an existing Cloudinary URL is previewed but not re-uploaded unless the user picks a new local image.

### v1.0.0 — 2026-06-06

- Implemented `CreateEventScreen` with `multipart/form-data` submission.
- Added `eventsService.create()` in `src/services/events.ts`.
- Added `validateCreateEventForm()` in `src/utils/validators.ts`.
- Added past-date prevention (client-side `minimumDate` + JS validation).
- Fixed `max_capacity` database column: migrated from `SMALLINT` to `INTEGER`
  in the initial Alembic migration and the SQLAlchemy model.
- Fixed iOS compatibility: replaced `@react-native-picker/picker` and
  `DateTimePicker display="spinner"` with pure-JS modal-based pickers.
- Added Spanish translation for backend schedule-conflict error.
- Added full test suite: 4 Unit, 6 Feature, 1 Browser test files.
- **QA review fixes:** Added auth guard to `(admin)` layout, corrected Spanish orthography (tildes/accents), fixed font weight consistency across labels, added success feedback banner, fixed `app.json` plugins (removed invalid `@react-native-community/datetimepicker`, added `expo-image-picker`), unified network error message, removed unused `@react-native-picker/picker` dependency, added category enum validation (`EVENT_CATEGORIES`), added image format validation (png/jpg/webp), typed `eventsService.create()` with `Event`, added accessibility labels to all selectors and image preview, added 3 feature tests (NetworkError, GenericServerError, Server422Validation), added 1 unit test (DescriptionValidationUnitTest), changed minute spinner to ±1.
- **Component extraction:** Moved `UnitSpinner`, `JSDatePicker`, `JSTimePicker`, and `BottomModal` from inline definitions to `src/components/ui/` for reuse by upcoming edit-event screen.

---

## Documentation Checklist

- [x] API contract files linked
- [x] File map reflects all created/modified files
- [x] Component tree shows screen hierarchy
- [x] All visual states documented (initial, error, loading, success)
- [x] All error messages mapped (client + server)
- [x] Test scenarios verified and passing
- [x] Design decisions explained
- [x] Changelog updated
- [ ] Screenshots added for each visual state

---

**Last updated**: `2026-06-10`
**Documented by**: `Luis F Rosales Vargas, Abigail Ramírez Chavarría`

---

# Module: Admin Event Detail

---

## General Information

- **Module Code**: `EBM-04`
- **API Contract**: `api-contracts/get-event-by-id.yaml`
- **Responsible**: Justin Moreira Matarrita
- **Status**: In Development
- **Version**: `1.0.1`
- **Created**: `2026-06-11`
- **Last Updated**: `2026-06-12`

---

## Description

Admin-facing read-only detail screen for a single event. Activated when a business user selects any event from the Admin dashboard (`/(admin)/index`), this screen surfaces every field returned by `GET /api/v1/events/{event_id}` — including live capacity — so that the administrator can audit the event before taking an action.

The screen is the **navigation hub** for admin event operations: the footer **Editar** button routes into the edit form (`/(admin)/edit-event/[id]`), and the footer **Ver Reservaciones** button will route into the reservations checklist once that screen is implemented (`/(admin)/events/[id]/reservations`).

Visual language mirrors the customer detail screen (`app/(customer)/events/[id].tsx`) — same hero image, InfoRow pattern, category badge, and color palette — maintaining consistency across roles.

---

## API Contract

**File:** `api-contracts/get-event-by-id.yaml`

| Method | Route                       | Auth | Description                  |
|--------|-----------------------------|------|------------------------------|
| GET    | `/api/v1/events/{event_id}` | No   | Fetch a single event by UUID |

### Path Parameters

| Parameter  | Type   | Required | Description       |
|------------|--------|----------|-------------------|
| `event_id` | string | Yes      | UUID of the event |

### Response (200 OK)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Summer Festival",
  "description": "Annual summer celebration with live music",
  "image_url": "https://cdn.example.com/events/summer-festival.jpg",
  "max_capacity": 500,
  "remaining_capacity": 342,
  "category": "music",
  "date": "2026-07-15",
  "start_time": "10:00:00",
  "end_time": "18:00:00",
  "is_active": true,
  "created_at": "2026-06-01T14:30:00+00:00",
  "updated_at": "2026-06-01T14:30:00+00:00"
}
```

### Response (Error)

| Status | Body                                                 | Scenario           |
|--------|------------------------------------------------------|--------------------|
| 404    | `{ "detail": "Event not found" }`                    | UUID doesn't exist |
| 500    | `{ "error": "internal_server_error", "message": … }` | Unexpected failure |

---

## Architecture

### File Map

```
src/
├── types/
│   └── events.ts                          # Event, EventCategory (reused, no changes)
├── services/
│   ├── api.ts                             # HTTP client (reused, no changes)
│   └── events.ts                          # eventsService.getById() (reused, no changes)
├── hooks/
│   └── useEventDetail.ts                  # Detail hook: event, loading, error (reused, no changes)
├── components/
│   ├── ui/
│   │   ├── InfoRow.tsx                    # Shared label/value row (extracted — used here and in customer detail)
│   │   ├── Button.tsx                     # Editar (secondary) and Ver Reservaciones footer CTAs
│   │   ├── EmptyState.tsx                 # Error / not-found state
│   │   ├── Loader.tsx                     # Full-screen loading spinner
│   │   ├── LogoutButton.tsx               # Layout-level header button (admin layout, unchanged)
│   │   ├── themed-text.tsx                # Typography
│   │   └── themed-view.tsx                # Root container
├── utils/
│   └── dateHelpers.ts                     # formatEventDate(), formatEventTime()
└── constants/
    └── ui.ts                              # ADMIN.DETAIL_*, EVENTS.DETAIL_*, CATEGORY.*
app/
└── (admin)/
    ├── _layout.tsx                        # Stack — added "events/[id]" screen entry
    ├── index.tsx                          # Dashboard — now routes to events/[id] on select
    └── events/
        └── [id].tsx                       # AdminEventDetailScreen (this module)
```

### Data Flow

```
Admin selects event on dashboard (index.tsx)
    │
    ▼
router.push('/(admin)/events/:id')
    │
    ▼
AdminEventDetailScreen mounts
    │
    ▼
useEventDetail(id) — useEffect calls load()
    │
    ├── setLoading(true) → renders <Loader />
    │
    ▼
eventsService.getById(id)
    │
    ▼
api.get('/api/v1/events/:id')
    │
    ▼
┌────────────────────────────────────────────────────────┐
│ 200 OK      → setEvent(data) → render full detail view │
│ ApiError    → setError(err.message) → <EmptyState />   │
│ TypeError   → setError(ERRORS.NETWORK) → <EmptyState />│
└────────────────────────────────────────────────────────┘
    │
    ▼
setLoading(false)

Admin taps "Editar" (footer)
    │
    ▼
router.push('/(admin)/edit-event/:id')

Admin taps "Ver Reservaciones" (footer)
    │
    ▼
router.push('/(admin)/events/:id/reservations')
    └── Route not yet implemented → Expo Router unmatched screen
```

---

## Files

### Screen

**File:** `app/(admin)/events/[id].tsx`

| State    | Description                                            |
|----------|--------------------------------------------------------|
| `event`  | `Event \| null` — populated by `useEventDetail`        |
| `loading`| `boolean` — shows `<Loader />` while fetching          |
| `error`  | `string \| null` — shows `<EmptyState />` on failure   |

**Functions:**

| Function                       | Description                                        |
|--------------------------------|----------------------------------------------------|
| `AdminEventDetailScreen()`     | Root component; orchestrates layout and navigation |

**Header:** `<Stack.Screen options={{ title: '' }} />` — clears the layout's default header title. The layout-level `LogoutButton` remains in the header unchanged across all admin screens.

### Components Used

| Component      | File                                  | Usage in this screen                              |
|----------------|---------------------------------------|---------------------------------------------------|
| `InfoRow`      | `src/components/ui/InfoRow.tsx`       | Label/value rows: date, times, capacity           |
| `Button`       | `src/components/ui/Button.tsx`        | Editar (secondary) and Ver Reservaciones footer CTAs |
| `EmptyState`   | `src/components/ui/EmptyState.tsx`    | Error and not-found states                        |
| `Loader`       | `src/components/ui/Loader.tsx`        | Loading state                                     |
| `ThemedText`   | `src/components/ui/themed-text.tsx`   | All text nodes                                    |
| `ThemedView`   | `src/components/ui/themed-view.tsx`   | Root container                                    |
| `Image`        | `expo-image`                          | Hero image (280 px, `contentFit="cover"`)         |

### Services

| Method                          | Endpoint                      | Description              |
|---------------------------------|-------------------------------|--------------------------|
| `eventsService.getById(id)`     | `GET /api/v1/events/{id}`     | Fetches full event object |

**HTTP Client:** `src/services/api.ts` — attaches no auth token (public endpoint).

### Hooks

| Hook                     | File                              | Returns                          |
|--------------------------|-----------------------------------|----------------------------------|
| `useEventDetail(id)`     | `src/hooks/useEventDetail.ts`     | `{ event, loading, error }`      |

### Types

| Type            | File                   | Used for                            |
|-----------------|------------------------|-------------------------------------|
| `Event`         | `src/types/events.ts`  | Shape of API response               |
| `EventCategory` | `src/types/events.ts`  | Category badge color/label lookup   |

### Constants

| Constant group   | File                     | Keys used                                                                |
|------------------|--------------------------|--------------------------------------------------------------------------|
| `ADMIN`          | `src/constants/ui.ts`    | `DETAIL_EDIT_BUTTON`, `DETAIL_RESERVATIONS_BUTTON`, `DETAIL_MAX_CAPACITY_LABEL` |
| `EVENTS`         | `src/constants/ui.ts`    | `DETAIL_LOADING`, `DETAIL_NOT_FOUND`, `DETAIL_DATE_LABEL`, `DETAIL_START_LABEL`, `DETAIL_END_LABEL`, `DETAIL_CAPACITY_LABEL` |
| `CATEGORY`       | `src/constants/ui.ts`    | `COLORS`, `LABELS`                                                       |

---

## UI / UX

### Screenshots

| State    | Screenshot |
|----------|------------|
| Loading  | [Add]      |
| Success  | [Add]      |
| Error    | [Add]      |

### Component Tree

```
AdminEventDetailScreen
├── Stack.Screen (title: '')
├── ThemedView (flex: 1, white)
│   ├── ScrollView
│   │   ├── Image (hero, 280px)
│   │   └── View (content: px 20, pt 20)
│   │       ├── View (titleRow)
│   │       │   ├── ThemedText (title, 28px bold)
│   │       │   └── View (category badge)
│   │       │       └── ThemedText (badge label)
│   │       ├── View (infoRows)
│   │       │   ├── InfoRow — Fecha
│   │       │   ├── Divider
│   │       │   ├── InfoRow — Hora de inicio
│   │       │   ├── Divider
│   │       │   ├── InfoRow — Hora de fin
│   │       │   ├── Divider
│   │       │   ├── InfoRow — Capacidad máxima
│   │       │   ├── Divider
│   │       │   └── InfoRow — Cupos disponibles
│   │       └── ThemedText (description, conditional)
│   └── View (footer, sticky, border-top)
│       ├── Button (Editar, secondary/outline, flex: 1)
│       └── Button (Ver Reservaciones, primary, flex: 1)
```

### Visual States

| State          | What the admin sees                                                                         |
|----------------|---------------------------------------------------------------------------------------------|
| **Loading**    | Full-screen spinner with "Cargando evento..."                                               |
| **Success**    | Hero image, title, category badge, 5 InfoRows, description (if present), two-button footer |
| **Not found**  | `⚠️` EmptyState with "Evento no encontrado"                                                |
| **Network**    | `⚠️` EmptyState with ERRORS.NETWORK message                                               |
| **Server error**| `⚠️` EmptyState with ApiError message                                                    |

---

## Error Handling

### Client-Side

No client-side validation (read-only screen).

### Server-Side

| Source          | Error type   | UI result                                        |
|-----------------|--------------|--------------------------------------------------|
| `ApiError`      | Any status   | `EmptyState` with `err.message`                  |
| `TypeError`     | Network down | `EmptyState` with `ERRORS.NETWORK`               |
| Fallback        | Unknown      | `EmptyState` with `ERRORS.EVENT_LOAD_ERROR`      |

---

## Test Scenarios

| Scenario                                              | Expected Result                                                   |
|-------------------------------------------------------|-------------------------------------------------------------------|
| Screen mounts with valid id                           | `eventsService.getById` called; all fields rendered               |
| Hero image present                                    | `expo-image` renders at 280px height                              |
| Hero image absent (`image_url: null`)                 | Image renders with `null` source (no crash)                       |
| Tap "Editar" footer button                            | `router.push('/(admin)/edit-event/:id')` called                   |
| Tap "Ver Reservaciones" footer button                 | `router.push` called with `/(admin)/events/[id]/reservations`     |
| `useEventDetail` returns error                        | `EmptyState` with error message rendered; no scroll content       |
| `useEventDetail` returns loading = true               | `<Loader message="Cargando evento..." />` rendered                |
| API returns 404                                       | `EmptyState` icon="⚠️" title="Evento no encontrado"              |
| Network unreachable (TypeError)                       | `EmptyState` with ERRORS.NETWORK message                          |

---

## Technical Notes

### Design Decisions

- **`remaining_capacity` is live-computed by the API**: The field reflects `max_capacity - sum(active reservations)` at request time. No client-side arithmetic is needed; the value displayed is always current.

- **Header unchanged across all admin screens**: iOS native-stack groups all content placed in `headerRight` into a single `UIBarButtonItem.customView`. Adding a second button to `headerRight` cannot be done without overriding the shared `LogoutButton` from the admin layout. Admin actions (Editar, Ver Reservaciones) are placed in the sticky footer to keep the shared header contract intact.

- **Reservations button navigates to an unmatched route**: `/(admin)/events/[id]/reservations` does not exist yet. Expo Router renders its built-in unmatched screen without crashing the app, and the native back button returns the admin to this detail screen. The route will resolve automatically once `EBM-05` (Reservations list) is implemented.

- **`InfoRow` extracted to `src/components/ui/InfoRow.tsx`**: Both the customer detail screen and this admin detail screen previously defined the same `InfoRow` subcomponent inline. It was extracted to a shared component to prevent visual divergence over time.

### Known Limitations

- "Ver Reservaciones" routes to an unmatched screen until `EBM-05` is shipped.

---

## Changelog

### v1.0.1 — 2026-06-12
- QA remediation: extracted `InfoRow` to shared component `src/components/ui/InfoRow.tsx`
- Replaced `ADMIN.DETAIL_AVAILABLE_LABEL` with `EVENTS.DETAIL_CAPACITY_LABEL` (removed duplicate constant)
- Added feature tests: `tests/Feature/events/AdminEventDetailFeatureTest.tsx`
- Corrected documentation to reflect actual implementation (5 InfoRows, footer buttons, no Status row)

### v1.0.0 — 2026-06-11
- Initial implementation
- Admin event detail screen: all fields, live capacity, category badge
- Footer Editar button wired to edit-event/[id]
- Footer Ver Reservaciones wired to future reservations route
- Admin dashboard now routes to detail screen on event selection

---

## Documentation Checklist

- [x] API contract file linked
- [x] File map reflects all created/modified files
- [x] Component tree shows screen hierarchy
- [x] All visual states documented (loading, error, success)
- [x] All error messages mapped (server + network)
- [x] Test scenarios listed
- [ ] Screenshots added for each visual state
- [x] Design decisions explained
- [x] Changelog updated

---

**Last updated**: `2026-06-12`
**Documented by**: Justin Moreira Matarrita
