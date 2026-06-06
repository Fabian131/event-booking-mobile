# Module: Create Event (Admin)

---

## General Information

- **Module Code**: `EBM-03`
- **API Contract**: `api-contracts/create-event.yaml`
- **Responsible**: Luis F Rosales Vargas
- **Status**: Completed
- **Version**: `1.0.0`
- **Created**: `2026-06-05`
- **Last Updated**: `2026-06-06`

---

## Description

Screen accessible only to authenticated users with the `business` role that
allows admins to create a new event in the system. The form collects all
required event information, validates it client-side, uploads an optional
image, and sends the payload to `POST /api/v1/events` as a `multipart/form-data`
request.

On success the screen navigates back to the previous admin screen.
On a schedule conflict the backend returns a localized Spanish error banner.

---

## API Contract

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

### Response (201 Created)

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
  "error": "conflict",
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
|   `-- create-event.tsx              # Create event screen (this module)
src/
|-- services/
|   `-- eventService.ts              # eventService.createEvent(FormData)
|-- utils/
|   `-- validators.ts                # validateCreateEventForm()
|-- types/
|   `-- auth.ts                      # FieldError, ApiError
tests/
|-- Unit/create-event/
|   |-- TitleValidationUnitTest.ts
|   |-- CapacityValidationUnitTest.ts
|   `-- DateTimeValidationUnitTest.ts
|-- Feature/create-event/
|   |-- EmptySubmitFeatureTest.tsx
|   |-- ServerErrorFeatureTest.tsx
|   `-- ValidSubmitFeatureTest.tsx
`-- Browser/create-event/
    `-- CreateEventFlowBrowserTest.tsx
```

### Data Flow

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
eventService.createEvent(FormData)  --> POST /api/v1/events (Bearer token)
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

---

## Files

### Screen

**File:** `app/(admin)/create-event.tsx`

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
| `handleSubmit()` | Validates, builds `FormData`, calls `eventService`, handles response |

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

**File:** `src/services/eventService.ts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `eventService.createEvent(formData)` | `POST /api/v1/events` | Sends multipart request, returns `EventResponse` |

**HTTP Client:** `src/services/api.ts`

- Attaches `Authorization: Bearer <token>` automatically.
- Throws `ApiError` with `status` and `details` on non-2xx responses.

### Validators

**File:** `src/utils/validators.ts`

| Function | Description |
|----------|-------------|
| `validateCreateEventForm(values)` | Returns accumulated `FieldError[]` for all form fields |

**Fields validated:**

| Field | Rules |
|-------|-------|
| `title` | Required, min 3, max 64 characters |
| `description` | Optional, max 255 characters |
| `max_capacity` | Required, numeric, min 1, max 9,999,999 |
| `category` | Required, non-empty string |
| `date` | Required, must not be in the past (compared at midnight) |
| `start_time` | Required |
| `end_time` | Required, must be after `start_time` |

### Components (Inline — defined in create-event.tsx)

| Component | Description |
|-----------|-------------|
| `UnitSpinner` | Single ▲ value ▼ control. Reused by `JSDatePicker` and `JSTimePicker` |
| `JSDatePicker` | Day / Month / Year spinner using `UnitSpinner`. Enforces `minimumDate = today` |
| `JSTimePicker` | Hour (±1h) / Minute (±5m) spinner using `UnitSpinner` |
| `BottomModal` | Reusable bottom sheet wrapper: overlay + header with "Listo" button + children |

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
CreateEventScreen
`-- ThemedView
    |-- KeyboardAvoidingView
    |   `-- ScrollView
    |       |-- Header (ThemedText: title + subtitle)
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
    |           `-- Button (Crear Evento)
    |-- Modal (category)
    |   `-- BottomModal --> FlatList of CATEGORIES
    |-- Modal (date)
    |   `-- BottomModal --> JSDatePicker
    |-- Modal (start time)
    |   `-- BottomModal --> JSTimePicker
    `-- Modal (end time)
        `-- BottomModal --> JSTimePicker
```

### Visual States

| State | What the user sees |
|-------|--------------------|
| **Initial** | Empty form, all selectors show placeholder text, submit button active |
| **Client error** | Red border + error text below each invalid field/selector |
| **Schedule conflict** | Red banner: `Ya existe un evento programado en esta fecha y horario. Por favor selecciona otro.` |
| **Server validation (422)** | Per-field errors rendered from API `details[]` |
| **Loading** | Button shows spinner, all inputs/selectors disabled |
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
| Submit empty form | Feature | All 6 field errors shown, API not called |
| Schedule conflict (409) | Feature | Spanish error banner displayed |
| Valid data, API succeeds | Feature | `eventService.createEvent` called, `router.back()` invoked |
| Complete happy-path flow | Browser | Category modal → date modal → time modals → submit → API call → redirect |

---

## Tests

| Layer | Files | Coverage |
|-------|-------|----------|
| Unit | `tests/Unit/create-event/TitleValidationUnitTest.ts` | Title min/max/required rules |
| Unit | `tests/Unit/create-event/CapacityValidationUnitTest.ts` | Capacity range and NaN rules |
| Unit | `tests/Unit/create-event/DateTimeValidationUnitTest.ts` | Past date, end > start, category required |
| Feature | `tests/Feature/create-event/EmptySubmitFeatureTest.tsx` | All field errors on empty submit, API not called |
| Feature | `tests/Feature/create-event/ServerErrorFeatureTest.tsx` | Schedule conflict banner in Spanish |
| Feature | `tests/Feature/create-event/ValidSubmitFeatureTest.tsx` | API called + `router.back()` on success |
| Browser | `tests/Browser/create-event/CreateEventFlowBrowserTest.tsx` | Full form fill → modal interactions → API call → redirect |

### Commands

```bash
npx jest tests/Unit/create-event/
npx jest tests/Feature/create-event/
npx jest tests/Browser/create-event/
npx jest tests/Unit/create-event/ tests/Feature/create-event/ tests/Browser/create-event/
npx tsc --noEmit
npx expo lint
```

---

## Technical Notes

### Design Decisions

- **`multipart/form-data` instead of JSON:** The API contract requires form
  encoding to support the optional image file upload in the same request.

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
- The pure-JS time spinner increments minutes by 5 only; arbitrary minute values
  cannot be entered.
- The iOS modals dismiss by pressing "Listo" or tapping the overlay; there is no
  explicit "Cancelar" button.

---

## Changelog

### v1.0.0 — 2026-06-06

- Implemented `CreateEventScreen` with `multipart/form-data` submission.
- Added `eventService.createEvent()` in `src/services/eventService.ts`.
- Added `validateCreateEventForm()` in `src/utils/validators.ts`.
- Added past-date prevention (client-side `minimumDate` + JS validation).
- Fixed `max_capacity` database column: migrated from `SMALLINT` to `INTEGER`
  in the initial Alembic migration and the SQLAlchemy model.
- Fixed iOS compatibility: replaced `@react-native-picker/picker` and
  `DateTimePicker display="spinner"` with pure-JS modal-based pickers.
- Added Spanish translation for backend schedule-conflict error.
- Added full test suite: 3 Unit, 3 Feature, 1 Browser test files.

---

## Documentation Checklist

- [x] API contract file linked
- [x] File map reflects all created/modified files
- [x] Component tree shows screen hierarchy
- [x] All visual states documented (initial, error, loading, success)
- [x] All error messages mapped (client + server)
- [x] Test scenarios verified and passing
- [x] Design decisions explained
- [x] Changelog updated
- [ ] Screenshots added for each visual state

---

**Last updated**: `2026-06-06`
**Documented by**: `Luis F Rosales Vargas`
