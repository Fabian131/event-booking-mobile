# Module: Reservations

---

## General Information

- **Module Code**: `EBM-13`, `EBM-14`, `EBM-15`
- **API Contract**: `api-contracts/create-reservation.yaml`, `api-contracts/calendar-reservations.yaml`, `api-contracts/list-reservations.yaml`, `api-contracts/cancel-reservation.yaml`
- **Responsible**: Luis Alejandro Salazar Vargas
- **Status**: Completed
- **Version**: `1.3.0`
- **Created**: `2026-06-11`
- **Last Updated**: `2026-06-12`

---

## Description

Customer-facing reservation module with three features:

1. **Booking Form** (EBM-13): Allows authenticated users to secure tickets for a
   specific event. Implements `create-reservation.yaml`.

2. **Reservations Calendar** (EBM-14): Interactive monthly calendar view in the
   "Reservas" tab where customers can browse their own reservations by date.
   Reuses the `Calendar` component from the admin dashboard. Implements
   `calendar-reservations.yaml` and `list-reservations.yaml`.

3. **Cancel Reservation** (EBM-15): Allows customers to cancel a CONFIRMED
   reservation directly from the reservation card in the calendar list.
   A three-dot action button (⋯) opens an action sheet modal with a
   "Cancelar reserva" option, followed by a native `Alert.alert` confirmation
   dialog. On confirmation, calls `PATCH /api/v1/reservations/{id}/cancel`.
   The UI updates optimistically (status → CANCELLED) and the calendar date
   counts refresh automatically. Implements `cancel-reservation.yaml`.

The screen receives the `event_id` as a URL parameter from the event detail
screen (which enforces authentication via `AuthGuardModal`). On mount, it
fetches fresh event data via `useEventDetail` to obtain the current
`remaining_capacity`. The user selects a ticket quantity — capped between 1
and the live available capacity — optionally adds notes, and submits the
reservation. On success, a confirmation banner is shown briefly before
automatically navigating back to the event detail screen, which re-fetches
and displays the updated capacity.

Error responses from the backend (400 past event, 409 capacity conflict
or duplicate reservation) are intercepted and displayed as Spanish messages
rather than raw English backend strings or the generic "Errores de
validación" fallback.

---

## API Contract

### Create Reservation

**File:** `api-contracts/create-reservation.yaml`

| Method | Route                    | Auth | Description               |
|--------|--------------------------|------|---------------------------|
| POST   | `/api/v1/reservations`   | Yes  | Create a new reservation  |

### Calendar Reservations

**File:** `api-contracts/calendar-reservations.yaml`

| Method | Route                              | Auth | Description                             |
|--------|-------------------------------------|------|-----------------------------------------|
| GET    | `/api/v1/reservations/calendar`     | Yes  | Month dates with reservation counts     |

**Parameters:**

| Field   | Type    | Required | Constraints     |
|---------|---------|----------|-----------------|
| `year`  | integer | Yes      | 2000 - 2100     |
| `month` | integer | Yes      | 1 - 12          |

**Response (200):**

```json
{
  "data": [
    { "date": "2026-06-15", "count": 1 },
    { "date": "2026-06-20", "count": 2 }
  ],
  "year": 2026,
  "month": 6
}
```

### List Reservations

**File:** `api-contracts/list-reservations.yaml`

| Method | Route                    | Auth | Description                             |
|--------|--------------------------|------|-----------------------------------------|
| GET    | `/api/v1/reservations`   | Yes  | Customer's reservations, filterable by date |

**Parameters:**

| Field   | Type    | Required | Default    |
|---------|---------|----------|------------|
| `date`  | string  | No       | None       |
| `page`  | integer | No       | 1          |
| `limit` | integer | No       | 50         |

### Create Reservation Request Body

| Field            | Type    | Required | Constraints       |
|------------------|---------|----------|-------------------|
| `event_id`       | string  | Yes      | UUID of the event |
| `ticket_quantity`| integer | Yes      | min: 1, max: 100  |
| `notes`          | string  | No       | maxLength: 500    |

### Response (201 Created)

```json
{
  "id": "abc12345-e89b-12d3-a456-426614174000",
  "user_id": "user-uuid",
  "event_id": "123e4567-e89b-12d3-a456-426614174000",
  "event_title": "Summer Festival",
  "event_date": "2026-07-15",
  "event_start_time": "10:00:00",
  "event_end_time": "18:00:00",
  "ticket_quantity": 2,
  "status": "CONFIRMED",
  "notes": null,
  "user": {
    "user_id": "user-uuid",
    "user_name": "Jane Doe",
    "user_email": "jane.doe@example.com"
  },
  "created_at": "2026-06-11T14:30:00+00:00",
  "updated_at": "2026-06-11T14:30:00+00:00"
}
```

### Error Responses (Create)

| Status | Description                                                          | Screen Message (Spanish)                                       |
|--------|----------------------------------------------------------------------|----------------------------------------------------------------|
| 400    | Event is in the past or inactive                                     | "Este evento ya no está disponible para reservar."             |
| 401    | Unauthorized — missing or invalid token                              | API error message                                              |
| 404    | Event not found                                                      | API error message                                              |
| 409    | Capacity conflict (details[]) → duplicate reservation                | "Ya tienes una reserva activa para este evento."               |
| 409    | Capacity conflict (direct message) → exceeded remaining_capacity     | "La cantidad solicitada excede los cupos disponibles."         |
| 422    | Validation failed (e.g., ticket_quantity > 100)               | "Datos inválidos. Revisa la cantidad de entradas e intenta nuevamente." |
| 500    | Unexpected server error                                              | API error message                                              |

Note: 400 and 409 responses may arrive as FastAPI `validation_error` format
(`{ detail: [{ field, message }] }`) where the HTTP client converts the
`detail` array into `ApiError.details` and defaults the message to
"Errores de validación". The screen detects this pattern and substitutes
the appropriate Spanish constant rather than showing raw backend strings.

### Cancel Reservation

**File:** `api-contracts/cancel-reservation.yaml`

| Method | Route                                      | Auth | Description                     |
|--------|---------------------------------------------|------|---------------------------------|
| PATCH  | `/api/v1/reservations/{reservation_id}/cancel` | Yes  | Cancel a confirmed reservation  |

**Response (200):**

Returns the full `ReservationResponse` with `status: "CANCELLED"`.

### Error Responses (Cancel)

| Status | Description                     | Screen Message (Spanish)                     |
|--------|---------------------------------|----------------------------------------------|
| 400    | Reservation already cancelled   | API error message (banner)                   |
| 401    | Unauthorized — missing token    | API error message                            |
| 404    | Reservation not found           | "Esta reservación ya no existe."             |
| 500    | Unexpected server error         | API error message                            |

---

## Architecture

### File Map

```
src/
├── types/
│   └── reservations.ts                    # ReservationStatus, ReservationUserContext,
│                                          #   CreateReservationRequest, ReservationResponse,
│                                          #   ReservationSummary, ReservationsListParams,
│                                          #   PaginatedReservationsResponse
├── services/
│   └── reservations.ts                    # create(), getCalendarDates(), list()
├── hooks/
│   ├── useEventDetail.ts                  # (shared with events) re-fetches on screen focus
│   └── useReservationsCalendar.ts         # Calendar dates + reservations by day
├── components/
│   ├── domain/
│   │   ├── Calendar.tsx                   # Reused from admin dashboard (unchanged)
│   │   ├── EventCard.tsx                  # Time format changed to 12h (consistency)
│   │   └── ReservationCard.tsx            # Reservation list item with status, notes, and cancel actions
│   └── ui/
│       ├── Button.tsx                     # Submit button with loading spinner
│       ├── EmptyState.tsx                 # Sold out, error, success states
│       ├── Input.tsx                      # Notes field (multiline, maxLength)
│       ├── Loader.tsx                     # Event data loading indicator
│       ├── themed-text.tsx                # All screen text
│       └── themed-view.tsx                # Container views
├── constants/
│   └── ui.ts                              # BOOKING + CUSTOMER constants blocks
└── utils/
    └── dateHelpers.ts                     # formatEventDate(), formatTime(), formatTimeRange()
app/
└── (customer)/
    ├── events/
    │   ├── _layout.tsx                    # Stack: index, [id], book
    │   ├── [id].tsx                       # EventDetailScreen — "Reservar" → book
    │   └── book.tsx                       # BookScreen — reservation form (17 tests)
    └── reservations/
        ├── _layout.tsx                    # Stack: index (native header + logout)
        └── index.tsx                      # Calendar + reservation list
tests/
└── Feature/
    └── events/
        └── BookingFormFeatureTest.tsx     # 16 tests: form, stepper, submit, errors
```

### Data Flow

```
EventDetailScreen — user taps "Reservar" (authenticated)
    │
    ▼
router.push({ pathname: '/(customer)/events/book', params: { event_id } })
    │
    ▼
BookScreen mounts — useLocalSearchParams → event_id
    │
    ▼
useEventDetail(event_id) — useFocusEffect fetches fresh event data
    │
    ├── loading → <Loader message={BOOKING.LOADING} />
    ├── error   → <EmptyState icon="⚠️" />
    ├── remaining_capacity === 0 → <EmptyState icon="🎟️" title="Agotado" />
    │
    └── data loaded → form
        │
        ├── Quantity selector:
        │   ├── [−] button     → decrement (min: 1)
        │   ├── TextInput      → type directly (numeric, clamped on blur)
        │   └── [+] button     → increment (max: remaining_capacity)
        │
        ├── Optional notes (Input, multiline, maxLength: 500)
        │
        └── Button "Confirmar reserva" → handleSubmit()
            │
            ├── setSubmitting(true)
            ├── Inputs disabled, button shows ActivityIndicator
            │
            ▼
            reservationsService.create({ event_id, ticket_quantity, notes? })
            │
            ▼
            api.post('/api/v1/reservations', payload)
            │
            ▼
            ┌─────────────────────────────────────────────────────────────────┐
            │ 201 Created → setSuccess(true)                                   │
            │               → green banner "Reserva realizada con éxito..."     │
            │               → after 1.2s: router.back()                        │
            │                                                                  │
            │ 400 → setSubmitError(BOOKING.EVENT_UNAVAILABLE)                  │
            │        "Este evento ya no está disponible para reservar."         │
            │                                                                  │
            │ 409 + details[] → setSubmitError(BOOKING.DUPLICATE_ERROR)        │
            │        "Ya tienes una reserva activa para este evento."           │
            │                                                                  │
            │ 409 + message  → setSubmitError(BOOKING.CAPACITY_ERROR)          │
            │        "La cantidad solicitada excede los cupos disponibles."     │
            │                                                                  │
            │ 4xx/5xx     → setSubmitError(err.message)                        │
            │ Network     → setSubmitError(ERRORS.NETWORK)                      │
            │ Fallback    → setSubmitError(ERRORS.GENERIC)                      │
            └─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
                setSubmitting(false) → inputs re-enabled, error banner shown

Detail screen regains focus after router.back()
    │
    ▼
useFocusEffect retriggered → eventsService.getById(id)
    │
    ▼
Capacity display updated with fresh remaining_capacity

### Reservations Calendar Flow

```
Reservations Tab (customer) — app/(customer)/reservations/
    │
    ▼
_layout.tsx — Stack navigator
    │   headerTitle: "Mis Reservas", headerRight: LogoutButton
    ▼
index.tsx — CustomerReservationsScreen
    │
    ▼
useReservationsCalendar() hook
    │
    ├──► reservationsService.getCalendarDates(year, month)
    │     └──► GET /api/v1/reservations/calendar?year=&month=
    │           └──► calendarDates: CalendarDateItem[]
    │
    ├──► reservationsService.list({ date })
    │     └──► GET /api/v1/reservations?date=
    │           └──► dayReservations: ReservationSummary[]
    │
    ├──► reservationsService.cancel(reservationId)
    │     └──► PATCH /api/v1/reservations/{id}/cancel
    │           └──► Updates local state (status → CANCELLED)
    │           └──► Refreshes calendar dates silently
    │
    └──► State: { calendarDates, dayReservations, selectedDate,
                  currentYear, currentMonth, calendarLoading,
                  reservationsLoading, error, cancellingId,
                  selectDate, onMonthChange, onYearChange,
                  refresh, cancelReservation }

Cancel Flow (per card):
    ReservationCard (CONFIRMED + onCancel)
        │
        ├── User taps ⋯ → setMenuVisible(true)
        │
        ▼
    Action Sheet Modal (transparent overlay + centered card)
        │   Option: "Cancelar reserva" (red text)
        │   Overlay press dismisses
        │
        ▼
    Alert.alert — Native confirmation
        │   Title: "¿Cancelar reservación?"
        │   Message: "Esta acción es permanente. Los cupos se liberarán..."
        │   [No] (cancel style) → dismiss
        │   [Sí, cancelar] (destructive style) → onCancel()
        │
        ▼
    cancelReservation(reservationId)
        │   cancellingId = reservationId → spinner visible
        │
        ├──► reservationsService.cancel(id) → PATCH
        │     │
        │     ├── 200 → status = CANCELLED, calendar refreshed
        │     ├── ApiError (400/404) → error banner
        │     ├── TypeError → network error banner
        │     └── Generic → fallback error banner
        │
        ▼
    cancellingId = null → spinner hidden, card shows CANCELLED state

useFocusEffect → refresh() on every tab focus
```

---

## Files

### Screen — `app/(customer)/events/book.tsx`

| State          | Type                | Description                                      |
|----------------|---------------------|--------------------------------------------------|
| `event`        | `Event\|null`       | Fresh event data (fetched on mount + focus)      |
| `loading`      | `boolean`           | True while fetching event from API               |
| `error`        | `string\|null`      | Error message when event fetch fails             |
| `quantity`     | `number`            | Current ticket count (1..remaining_capacity)      |
| `quantityText` | `string`            | Text display value synced with quantity          |
| `notes`        | `string`            | Optional notes (max 500 chars)                   |
| `submitting`   | `boolean`           | True while POST is in flight                      |
| `submitError`  | `string\|null`      | Error message shown in error banner              |
| `success`      | `boolean`           | True when reservation was created successfully    |

**Functions:**

| Function                    | Description                                                |
|-----------------------------|------------------------------------------------------------|
| `clampQuantity(value)`      | Clamps a number between 1 and `Math.min(remaining_capacity, 100)` |
| `handleQuantityTextChange()`| Cleans non-digit chars, updates quantity + clamped text    |
| `handleQuantityTextBlur()`  | Clamps empty/invalid text to "1" on blur                   |
| `handleIncrement()`         | Increments quantity, capped at `remaining_capacity`         |
| `handleDecrement()`         | Decrements quantity, minimum 1                              |
| `handleSubmit()`            | Calls `reservationsService.create`, handles response/error; resets submitting in `finally` |
| `useEffect` (success timer) | Shows success banner 1.2s then calls `router.back()`       |

### Components

**Reusable UI components used:**

| Component     | File                                  | Props                                               |
|---------------|---------------------------------------|-----------------------------------------------------|
| `Button`      | `src/components/ui/Button.tsx`        | `title, loading, disabled, onPress`                 |
| `Input`       | `src/components/ui/Input.tsx`         | `label, placeholder, multiline, maxLength, editable`|
| `EmptyState`  | `src/components/ui/EmptyState.tsx`    | `icon, title, subtitle`                             |
| `Loader`      | `src/components/ui/Loader.tsx`        | `message`                                           |
| `ThemedText`  | `src/components/ui/themed-text.tsx`   | `type` (title, defaultSemiBold)                     |
| `ThemedView`  | `src/components/ui/themed-view.tsx`   | Standard `View` with background                     |

**Domain-specific components used:**

| Component | File | Purpose |
|-----------|------|---------|
| `Calendar` | `src/components/domain/Calendar.tsx` | Monthly calendar with dots (reused from admin) |
| `ReservationCard` | `src/components/domain/ReservationCard.tsx` | Compact card with status, time, quantity, notes |

### Services

**Reservation API calls:**

| Method                               | Endpoint                            | Description              |
|--------------------------------------|-------------------------------------|--------------------------|
| `reservationsService.create(d)`      | `POST /api/v1/reservations`         | Creates a new reservation|
| `reservationsService.getCalendarDates(y, m)` | `GET /api/v1/reservations/calendar` | Month dates with counts  |
| `reservationsService.list(params)`   | `GET /api/v1/reservations`          | Customer's reservations by date |
| `reservationsService.cancel(id)`     | `PATCH /api/v1/reservations/{id}/cancel` | Cancels a confirmed reservation |

**HTTP Client:** `src/services/api.ts`
- Wraps native `fetch` with JSON serialization/deserialization
- Attaches `Authorization: Bearer <token>` header when available
- Throws `ApiError` with `status` and `details` on non-2xx responses
- 6-second request timeout via `AbortController`
- FastAPI `detail[]` arrays are parsed into `ApiError.details`; missing
  `message` field defaults to "Errores de validación"

### Shared Dependencies

**Hook — `useEventDetail`** (`src/hooks/useEventDetail.ts`):
- Used to fetch fresh event data (especially `remaining_capacity`) on mount
- Uses `useFocusEffect` so data is re-fetched whenever the screen gains focus
- Returns `{ event, loading, error }`

**Hook — `useReservationsCalendar`** (`src/hooks/useReservationsCalendar.ts`):
- Centralizes calendar loading logic for the "Reservas" tab
- Fetches calendar dates (`getCalendarDates`) and reservations by day (`list`)
- Manages independent loading states: `calendarLoading`, `reservationsLoading`
- Provides `cancelReservation(reservationId)` which calls `reservationsService.cancel()`,
  optimistically updates local state (status → CANCELLED), and silently refreshes
  calendar dates (`.catch(() => {})` to prevent refresh errors from overwriting success state)
- Tracks cancellation progress via `cancellingId` state (set to reservation ID during API call,
  cleared to `null` in `finally`)
- Provides `refresh` for `useFocusEffect` auto-refresh
- Returns `{ calendarDates, dayReservations, selectedDate, currentYear,
  currentMonth, calendarLoading, reservationsLoading, error, cancellingId,
  selectDate, onMonthChange, onYearChange, refresh, cancelReservation }`

**Types — `src/types/events.ts`**:
- `Event` interface provides `remaining_capacity`, `title`, `date`,
  `start_time`, `end_time`, `category` used in the booking form card.
- `CalendarDateItem`, `CalendarDatesResponse` reused for reservations calendar.

### Types

**File:** `src/types/reservations.ts`

| Type                       | Description                                                                                   |
|----------------------------|-----------------------------------------------------------------------------------------------|
| `ReservationStatus`        | `'CONFIRMED' \| 'CANCELLED'`                                                                 |
| `ReservationUser`          | `{ user_id, user_name, user_email }`                                                          |
| `ReservationUserContext`   | Alias for `ReservationUser`                                                                   |
| `Reservation`              | `id, user_id, event_id, event_title, event_date, event_start_time, event_end_time, ticket_quantity, status, notes, user, created_at, updated_at?` |
| `CreateReservationRequest` | `{ event_id: string, ticket_quantity: number, notes?: string }`                                |
| `ReservationListResponse`  | `{ data: Reservation[], pagination: PaginationMeta }`                                         |
| `ReservationSummary`       | id, event_id, event_title, event_date, event_start_time, event_end_time, ticket_quantity, status, notes, user, created_at |
| `ReservationsListParams`   | `{ page?, limit?, date?, status? }`                                                            |
| `PaginatedReservationsResponse` | `{ data: ReservationSummary[], pagination: { page, limit, total, total_pages, has_next_page } }` |

### Constants

**File:** `src/constants/ui.ts` — `BOOKING` block

| Constant              | Value                                                                 |
|-----------------------|-----------------------------------------------------------------------|
| `TITLE`               | 'Reservar entradas'                                                   |
| `TICKETS_LABEL`       | 'Cantidad de entradas'                                                |
| `SUBMIT_BUTTON`       | 'Confirmar reserva'                                                   |
| `SUBMITTING`          | 'Procesando reserva...'                                               |
| `SUCCESS_TITLE`       | 'Reserva exitosa'                                                     |
| `SUCCESS_MESSAGE`     | 'Tu reserva ha sido creada con éxito.'                                |
| `BACK_BUTTON`         | 'Volver al evento'                                                    |
| `LOADING`             | 'Cargando información del evento...'                                  |
| `NOTES_LABEL`         | 'Notas adicionales (opcional)'                                        |
| `NOTES_PLACEHOLDER`   | 'Ej: Necesito acceso para silla de ruedas'                            |
| `SOLD_OUT`            | 'Agotado'                                                             |
| `SOLD_OUT_MESSAGE`    | 'Lo sentimos, ya no hay cupos disponibles para este evento.'          |
| `DUPLICATE_ERROR`     | 'Ya tienes una reserva activa para este evento.'                      |
| `CAPACITY_ERROR`      | 'La cantidad solicitada excede los cupos disponibles.'                |
| `EVENT_UNAVAILABLE`   | 'Este evento ya no está disponible para reservar.'                    |
| `VALIDATION_ERROR`    | 'Datos inválidos. Revisa la cantidad de entradas e intenta nuevamente.' |
| `SUCCESS_BANNER`      | 'Reserva realizada con éxito. Redirigiendo...'                        |

**File:** `src/constants/ui.ts` — `CUSTOMER` block (reservations calendar)

| Constant                        | Value                                              |
|---------------------------------|----------------------------------------------------|
| `RESERVATIONS_TITLE`            | 'Mis Reservas'                                     |
| `RESERVATIONS_EMPTY_TITLE`      | 'Selecciona un día'                                |
| `RESERVATIONS_EMPTY_SUBTITLE`   | 'Toca un día en el calendario para ver tus reservas'|
| `RESERVATIONS_NO_RESERVATIONS_TITLE` | 'Sin reservas'                                 |
| `RESERVATIONS_NO_RESERVATIONS_SUBTITLE` | 'No tienes reservas para este día'           |
| `RESERVATIONS_LOADING`          | 'Cargando reservas...'                             |
| `RESERVATIONS_FOR_DAY`          | 'Reservas del'                                     |
| `RESERVATIONS_HEADING`          | 'Reservas del día'                                 |
| `STATUS_CONFIRMED`              | 'Confirmada'                                       |
| `STATUS_CANCELLED`              | 'Cancelada'                                        |
| `TICKET_SINGULAR`                | 'entrada'                                          |
| `TICKET_PLURAL`                  | 'entradas'                                         |
| `CANCEL_ACTION`                | 'Cancelar reserva'                                 |
| `CANCEL_CONFIRM_TITLE`         | '¿Cancelar reservación?'                           |
| `CANCEL_CONFIRM_MESSAGE`       | 'Esta acción es permanente. Los cupos se liberarán y no podrás recuperar esta reservación.' |
| `CANCEL_CONFIRM_OK`            | 'Sí, cancelar'                                     |
| `CANCEL_CONFIRM_CANCEL`        | 'No'                                               |
| `CANCEL_ACCESSIBILITY`         | 'Acciones de la reservación'                       |

**File:** `src/constants/ui.ts` — `ERRORS` block (calendar additions)

| Constant                       | Value                                              |
|--------------------------------|----------------------------------------------------|
| `CALENDAR_RESERVATIONS_ERROR`  | 'No se pudieron cargar las reservas del día.'      |

---

## UI / UX

### Screenshots

> Add screenshots showing each visual state.

| State     | Screenshot |
|-----------|------------|
| Initial   | [Add]      |
| Sold out  | [Add]      |
| Typing    | [Add]      |
| Loading   | [Add]      |
| Success   | [Add]      |
| Error 400 | [Add]      |
| Error 409 | [Add]      |
| Error net | [Add]      |

### Component Tree

```
BookScreen
└── ThemedView (container, flex: 1, backgroundColor: #fff)
    ├── ScrollView
    │   ├── View (event summary card)
    │   │   │  ↳ borderLeftColor: categoryColor, #FAFBFC bg, rounded
    │   │   ├── View (cardHeader)
    │   │   │   ├── ThemedText (event.title, fontSize 18, fontWeight 700)
    │   │   │   └── View (categoryBadge, categoryColor bg)
    │   │   ├── View (cardDivider)
    │   │   ├── InfoRow "Fecha"             → formatEventDate()
    │   │   ├── InfoRow "Horario"           → "start_time - end_time"
    │   │   └── InfoRow "Cupos disponibles" → remaining_capacity
    │   ├── View (quantitySection)
    │   │   ├── ThemedText (label → "Cantidad de entradas")
    │   │   └── View (quantityRow)
    │   │       ├── TouchableOpacity [−]    → handleDecrement
    │   │       │  ↳ #E6F4F8 bg, #0a7ea4 border
    │   │       ├── TextInput (numeric)     → direct typing, clamped on blur
    │   │       │  ↳ #E6F4F8 bg, #0a7ea4 border, fontSize 22
    │   │       └── TouchableOpacity [+]    → handleIncrement
    │   │          ↳ #E6F4F8 bg, #0a7ea4 border
    │   ├── Input (notes, optional, multiline, maxLength: 500)
    │   └── ErrorBanner (conditional)
    │      ↳ #fdecea bg, #dc3545 border, centered text
    └── View (footer, sticky, white bg, borderTop)
        ├── (success) → View (successBanner)
        │   ↳ #d4edda bg, #28a745 border, centered text
        └── (!success) → Button "Confirmar reserva"
            ↳ loading spinner while submitting
```

### Visual States

| State                    | What the user sees                                                      |
|--------------------------|-------------------------------------------------------------------------|
| **Loading**              | Full-screen `Loader` with "Cargando información del evento..."          |
| **Error (fetch)**        | `EmptyState` with ⚠️ icon and error message                             |
| **Sold out**             | `EmptyState` with 🎟️ icon + "Agotado" + "Volver al evento" button      |
| **Form loaded**          | Event card, quantity selector (default: 1), notes field, submit button  |
| **Stepper increment**    | Quantity increased via [+] button or direct typing                      |
| **Stepper decrement**    | Quantity decreased via [−] button (min: 1)                              |
| **Typed value clamped**  | Value > remaining_capacity corrected to max on blur                     |
| **Submitting**           | Inputs disabled, button shows `ActivityIndicator`                       |
| **Success**              | Green banner "Reserva realizada con éxito. Redirigiendo..." (1.2s)      |
| **Error 400**            | Red banner: "Este evento ya no está disponible para reservar."          |
| **Error 409 (capacity)** | Red banner: "La cantidad solicitada excede los cupos disponibles."      |
| **Error 409 (duplicate)**| Red banner: "Ya tienes una reserva activa para este evento."            |
| **Error 422**            | Red banner: "Datos inválidos. Revisa la cantidad de entradas..."       |
| **Error server (4xx/5xx)**| Red banner with `ApiError.message`                                     |
| **Error network**        | Red banner: "No se pudo conectar con el servidor..."                    |

### Visual States — Reservations Calendar

| State                    | What the user sees                                                      |
|--------------------------|-------------------------------------------------------------------------|
| **Tab loaded**           | Calendar with today's month, no date selected, "Selecciona un día"     |
| **Calendar loading**     | Dots update in background, "Cargando..." overlay on calendar            |
| **Day selected**         | Slide-up animation shows ReservationCards for that date                 |
| **Reservations loading** | "Cargando reservas..." spinner in the bottom section                    |
| **No reservations**      | "Sin reservas" / "No tienes reservas para este día"                     |
| **Reservations found**   | List of ReservationCards (green CONFIRMED with ⋯, red CANCELLED + strikethrough)|
| **Action menu open**     | Centered modal card with "Cancelar reserva" in red text; tap overlay dismisses  |
| **Cancel confirmation**  | Native Alert.alert warning about permanent action                                 |
| **Cancelling**           | Inline red spinner next to ticket count; ⋯ button hidden                         |
| **Cancellation success** | Badge turns red "Cancelada", title gets strikethrough, calendar dots refresh      |
| **Cancel error (API)**   | Red banner with server-provided or localized error message                       |
| **Cancel error (404)**   | Red banner: "Esta reservación ya no existe."                                     |
| **Error**                | Red banner (`#fdecea` / `#dc3545`) with error message                   |
| **Dots**                 | 1-3 blue dots below dates with reservations (max 3 visually)            |
| **Today**                | Light blue circle around current day                                    |
| **Selected**             | Solid blue background on selected day (#0a7ea4)                         |

### ReservationCard Component

```
ReservationCard
└── View (borderLeftColor: green/red, borderRadius: 12, shadow)
    ├── View (titleRow)
    │   ├── ThemedText (event_title, defaultSemiBold)
    │   │  ↳ cancelled → line-through + gray color
    │   └── View (badgeRow)
    │       ├── View (statusBadge, green/red bg, borderRadius: 12)
    │       │  └── ThemedText ("Confirmada" / "Cancelada", white, 10px, bold)
    │       └── TouchableOpacity (menuButton, ⋯, conditional)
    │          ↳ visible only when CONFIRMED + onCancel prop + !cancelling
    │          ↳ accessibilityLabel: "Acciones para {event_title}"
    │          ↳ accessibilityRole: "button", hitSlop: 8
    ├── View (subtitleRow)
    │   ├── ThemedText (subtitle)
    │   │  ↳ "10:00 a.m. - 06:00 p.m. • 2 entradas"  (12h format via formatTime)
    │   └── ActivityIndicator (conditional, cancelling=true)
    │      ↳ testID: "cancelling-spinner", color: #dc3545
    ├── ThemedText (notes, conditional, italic, gray)
    └── Modal (action menu, transparent, animationType="fade")
       └── Pressable (overlay, dismisses on press)
           └── View (menuSheet, centered card, borderRadius 14)
               └── TouchableOpacity (menuItem)
                  ↳ ThemedText: "Cancelar reserva" (red, centered)
                  ↳ accessibilityRole: "button"
                  ↳ hitSlop: { top: 4, bottom: 4, left: 8, right: 8 }
                  ↳ onPress → setMenuVisible(false) → Alert.alert

Alert.alert (native confirmation)
  ↳ title: "¿Cancelar reservación?"
  ↳ message: "Esta acción es permanente. Los cupos se liberarán..."
  ↳ buttons: [{ text: "No", style: "cancel" }, { text: "Sí, cancelar", style: "destructive", onPress: onCancel }]
  ↳ cancelable: true
```

**Color accessibility:** CONFIRMED badge uses `#1e7e34` (dark green, 4.9:1 contrast on white = WCAG AA). CANCELLED badge uses `#dc3545` (red, 5.5:1 contrast on white).

---

## Error Handling

### Client-Side Validation

| Validation                        | Trigger                                     |
|-----------------------------------|---------------------------------------------|
| Quantity clamped to min 1         | Typing "0" or empty → resets to "1" on blur |
| Quantity capped at capacity + YAML max | Typing > remaining_capacity or > 100 → clamped on blur  |
| Non-digit characters stripped     | Typing letters/symbols → removed in onChange|
| Inputs disabled during submit     | `submitting === true` blocks all inputs      |
| Stepper buttons disabled at limit | [−] disabled when quantity <= 1; [+] when >= capacity |

### Server-Side Errors

| Status | API Response format                    | Screen displays                                         |
|--------|----------------------------------------|---------------------------------------------------------|
| 400    | `detail[{field, message}]` about past/inactive | "Este evento ya no está disponible para reservar."      |
| 409    | `detail[{field, message}]` duplicate   | "Ya tienes una reserva activa para este evento."         |
| 409    | Direct `message` about capacity        | "La cantidad solicitada excede los cupos disponibles."   |
| 422    | `detail[{field, message}]` validation  | "Datos inválidos. Revisa la cantidad de entradas e intenta nuevamente." |
| 500    | `{ error, message }`                   | `err.message`                                           |
| Network | `TypeError` thrown by `fetch`          | `ERRORS.NETWORK`                                        |
| Unknown | Any other error                        | `ERRORS.GENERIC`                                        |

### Cancel Reservation Errors

| Status | API Response format                         | Screen displays                                         |
|--------|---------------------------------------------|---------------------------------------------------------|
| 400    | `{ error: "already_cancelled", message }`   | `err.message` in red banner                             |
| 404    | `{ error: "not_found", message }`           | "Esta reservación ya no existe." in red banner          |
| 500    | `{ error, message }`                        | `err.message` in red banner                             |
| Network | `TypeError` thrown by `fetch`              | `ERRORS.NETWORK`                                        |
| Unknown | Any other error                             | `RESERVATIONS.CANCEL_ERROR` ("Error al cancelar la reservación") |
| Empty ID| Client-side guard: `cancelReservation('')`  | Returns `false` immediately, no API call, no error      |

**Race condition protection:** `fetchCalendarDates()` (triggered after cancel success) is wrapped in `.catch(() => {})` to prevent calendar refresh errors from overwriting the success state or showing a misleading error banner after a successful cancellation.

---

## Test Scenarios

### Feature Tests — `tests/Feature/events/BookingFormFeatureTest.tsx`

| # | Scenario                                                       | Expected Result                                                    |
|---|----------------------------------------------------------------|--------------------------------------------------------------------|
| 1 | Render booking form                                             | Title, capacity label, quantity input "1", submit button visible   |
| 2 | Increment quantity via [+]                                      | TextInput shows "2"                                                |
| 3 | Decrement quantity via [−]                                      | TextInput shows "1" (min)                                          |
| 4 | Type quantity directly ("5")                                    | TextInput shows "5"                                                |
| 5 | Type "99" when capacity=3, then blur                           | TextInput clamped to "3"                                           |
| 6 | Show sold out when remaining_capacity=0                         | "Agotado" title + "Volver al evento" button                        |
| 7 | Submit reservation successfully                                 | `reservationsService.create` called, success banner, `router.back()`|
| 8 | Network failure on submit                                       | Red banner with `ERRORS.NETWORK`                                   |
| 9 | 409 with direct message (capacity exceeded)                     | Red banner: "La cantidad solicitada excede los cupos disponibles." |
|10 | 409 with FastAPI `details[]` (duplicate)                        | Red banner: "Ya tienes una reserva activa para este evento."       |
|11 | 400 with FastAPI `details[]` (past event)                       | Red banner: "Este evento ya no está disponible para reservar."     |
|12 | Notes included in create payload                                | `reservationsService.create` called with `notes` field             |
|13 | Inputs disabled and spinner shown during submission             | Button shows `ActivityIndicator`, all inputs disabled              |
|14 | Event fetch failure                                             | `EmptyState` shown with ⚠️ icon                                     |
|15 | 422 validation error                                            | Red banner: Spanish `VALIDATION_ERROR` (not raw English)           |
|16 | 500 server error                                                | Red banner with `err.message`                                      |
|17 | Unexpected generic error                                        | Red banner: "Ocurrió un error inesperado..."                       |

Tests use `jest.useFakeTimers()` to control the success banner timeout
and `jest.mock('@react-navigation/native')` to provide a `useFocusEffect`
stub that behaves like `useEffect`.

**Total:** 17 tests passing

### Unit Tests — `tests/Unit/reservations/ReservationsCalendarUnitTest.ts`

| # | Scenario                                                       | Expected Result                                                    |
|---|----------------------------------------------------------------|--------------------------------------------------------------------|
| 1 | Fetch calendar dates on mount                                  | `getCalendarDates` called, dates loaded, `calendarLoading` = false |
| 2 | Calendar fetch fails                                           | `error` = `ERRORS.CALENDAR_LOAD_ERROR`                             |
| 3 | Fetch reservations by date and sort chronologically            | `list` called with date, results sorted by start_time              |
| 4 | Reservation list fetch fails                                   | `error` = `ERRORS.CALENDAR_RESERVATIONS_ERROR`                     |
| 5 | Month change clears selection and reservations                 | `selectedDate` = null, `dayReservations` = []                      |
| 6 | Year change clears selection and reservations                  | `selectedDate` = null, `dayReservations` = []                      |
| 7 | Cancel: status updated to CANCELLED                            | Target reservation has `status: "CANCELLED"`                       |
| 8 | Cancel: only target reservation affected                       | Other reservations remain `CONFIRMED`                              |
| 9 | Cancel: calendar dates refreshed after success                 | `getCalendarDates` called                                          |
|10 | Cancel: ApiError (400) sets error message                      | `error` = `err.message`, `cancellingId` = null                     |
|11 | Cancel: ApiError (404) sets localized message                  | `error` = "Esta reservación ya no existe."                         |
|12 | Cancel: TypeError (network) sets network error                 | `error` = `ERRORS.NETWORK`, `cancellingId` = null                  |
|13 | Cancel: generic error sets fallback                            | `error` = `RESERVATIONS.CANCEL_ERROR`, `cancellingId` = null       |
|14 | Cancel: clears previous error before new attempt               | First error set, second cancel clears it                           |
|15 | Cancel: returns `true` on success, `false` on failure          | Boolean return values verified                                     |
|16 | Cancel: CANCELLED status preserved after refresh               | Status remains CANCELLED in `dayReservations`                      |
|17 | Cancel: cancellingId null when idle and after operations       | `cancellingId` = null before and after cancel attempts             |
|18 | Cancel: empty reservationId guard clause                       | Returns `false`, no API call, `cancellingId` null                  |

### Feature Tests — `tests/Feature/Reservations/ReservationCardFeatureTest.tsx`

| # | Scenario                                                       | Expected Result                                                    |
|---|----------------------------------------------------------------|--------------------------------------------------------------------|
| 1 | Render event title                                             | Title visible                                                      |
| 2 | Render CONFIRMED status badge                                  | "Confirmada" badge visible                                         |
| 3 | Render CANCELLED status badge                                  | "Cancelada" badge visible                                          |
| 4 | Render ticket quantity with plural wording                     | "3 entradas"                                                       |
| 5 | Render ticket quantity with singular wording                   | "1 entrada"                                                        |
| 6 | Render time in 12h format                                      | "10:00 a.m. - 6:00 p.m."                                           |
| 7 | Render notes when provided                                     | Notes text visible                                                 |
| 8 | No notes when null                                             | Notes text absent                                                  |
| 9 | Strikethrough title for CANCELLED                               | CANCELLED badge present, title styled                              |
|10 | Three-dot button visible (CONFIRMED + onCancel)                | Button with accessibilityLabel rendered                            |
|11 | No three-dot button for CANCELLED                              | Button absent                                                      |
|12 | No three-dot button without onCancel                           | Button absent                                                      |
|13 | Tapping ⋯ opens action menu modal                              | "Cancelar reserva" text visible in modal                           |
|14 | Alert.alert triggered with correct params                      | Alert called with title, message, and button config                |
|15 | onCancel called on confirm press                               | `onCancel` invoked once                                            |
|16 | onCancel NOT called on cancel press                            | `onCancel` not invoked                                             |
|17 | Action menu closes on option tap                               | "Cancelar reserva" removed from screen                             |
|18 | ActivityIndicator visible when cancelling=true                 | Spinner found via `testID`                                         |
|19 | Three-dot button hidden when cancelling=true                   | Button absent from accessibility tree                              |

**Total:** 37 tests (18 unit + 19 feature) for reservations module

### Mocks

| Mock                          | Reason                                                          |
|-------------------------------|-----------------------------------------------------------------|
| `@/src/services/events`       | Control `getById` resolved/rejected values                      |
| `@/src/services/reservations` | Control `create` resolved/rejected values                       |
| `expo-image`                  | Native component unavailable in Jest                            |
| `expo-secure-store`           | Imported transitively by `api.ts` via `storage.ts`              |
| `expo-router`                 | `useLocalSearchParams`, `useRouter` unavailable outside Expo    |
| `@react-navigation/native`    | `useFocusEffect` requires navigation context; stubbed           |

---

## Technical Notes

### Design Decisions

- **Fresh capacity on mount**: The booking form receives only `event_id` as a
  URL parameter and fetches the event via `useEventDetail` on mount. This
  guarantees the `remaining_capacity` used for the quantity cap is the most
  current, rather than relying on stale data from the detail screen.

- **Editable numeric input with stepper**: The quantity selector uses a
  `TextInput` with `keyboardType="numeric"` flanked by stepper buttons.
  This allows both precise typing (for large quantities) and rapid
  increment/decrement. The value is clamped between 1 and
  `remaining_capacity` on blur.

- **Spanish error messages**: 400 and 409 errors from the backend may
  contain English strings or FastAPI detail arrays. The screen intercepts
  these and substitutes Spanish messages (`BOOKING.EVENT_UNAVAILABLE`,
  `BOOKING.DUPLICATE_ERROR`, `BOOKING.CAPACITY_ERROR`) rather than showing
  raw backend responses or the generic "Errores de validación".

- **Error banner matches system pattern**: The booking error banner uses
  `#fdecea` background, `#dc3545` border and text, matching the
  `create-event` and `edit-event` screens. Success banner uses
  `#d4edda` / `#28a745` pattern from the same screens.

- **Stepper colors match primary button**: The quantity input and stepper
  buttons use `#0a7ea4` (same as the "Confirmar reserva" button) for
  visual consistency.

- **`router.back()` instead of `router.replace()`**: After successful
  booking, `router.back()` simply pops the booking screen from the stack,
  returning to the already-mounted detail screen. Combined with
  `useFocusEffect` in `useEventDetail`, the detail screen re-fetches and
  shows updated capacity. This avoids duplicating the `[id]` screen in the
  stack, which previously caused stale data to appear when pressing the
  back button.

- **Event summary card with category accent**: The card shows the event
  title, category badge, date, time slot, and available capacity. A
  colored left border uses the category's assigned color for visual
  grouping.

- **YAML max: 100 enforced client-side**: `clampQuantity` caps at
  `Math.min(remaining_capacity, 100)`, matching the
  `create-reservation.yaml` contract's `ticket_quantity.maximum: 100`.
  Without this, users could select > 100 tickets for large events,
  causing a backend 422 rejection that previously displayed a raw
  English validation string. Now 422 also shows a Spanish message
  (`BOOKING.VALIDATION_ERROR`).

- **Submitting reset in `finally`**: `setSubmitting(false)` executes
  in a `finally` block so the submitting state is always reset — on
  success, error, and unexpected exceptions. Previously it was only
  called in `catch`, leaking a stale `submitting=true` state on the
  success path.

- **Accessibility attributes on stepper controls**: Both `−`/`+`
  `TouchableOpacity` buttons have `accessibilityRole="button"` and
  `accessibilityState={{ disabled }}`. The `TextInput` also receives
  `accessibilityState={{ disabled: submitting }}`. These enable screen
  readers to identify actionable elements and communicate disabled state.

- **Reservation status `PENDING` removed**: The backend no longer
  supports `PENDING` status; new reservations are created as
  `CONFIRMED`. The `ReservationStatus` type was reduced to
  `'CONFIRMED' | 'CANCELLED'`.

- **Calendar component reused from admin**: The `Calendar` component from
  the admin dashboard was reused without modification. It accepts
  `CalendarDateItem[]` (matching both events and reservations API
  responses) and renders dots based on the `count` field. The loading
  overlay text "Cargando..." is acceptable in both contexts.

- **Separate hook for reservations calendar**: `useReservationsCalendar`
  follows the same pattern as `useCalendarEvents` but calls
  `reservationsService.getCalendarDates` and `reservationsService.list`
  instead of the events endpoints. Independent loading states avoid
  blocking the calendar when fetching a day's reservations.

- **12-hour time format**: Both `ReservationCard` and `EventCard` (compact
  variant) now use `formatTime()` from `dateHelpers.ts` instead of
  `extractTime()`, displaying times as "10:00 AM" / "06:00 PM" for better
  readability. Changed in both components for consistency.

- **Native Stack header on "Reservas" tab**: Converted from a single-file
  route to a directory-based route with `_layout.tsx` + `index.tsx`,
  matching the "Eventos" tab pattern. The custom inline header (with
  `useSafeAreaInsets`) was removed — now handled by the Stack navigator
  with `headerTitle: "Mis Reservas"` and `headerRight: LogoutButton`.

- **No `console.error(e)` on network failures**: Removed raw error logging
  from both `useCalendarEvents` and `useReservationsCalendar` catch blocks.
  Errors are handled exclusively through the `error` state → red banner,
  preventing `TypeError: Network request failed` console dumps.

- **Max quantity validation before submit**: If the typed quantity exceeds
  `Math.min(remainingCapacity, 100)`, a red banner is shown with the max
  allowed instead of submitting. The quantity is auto-corrected in the
  input and the reservation is not sent until the user acknowledges.

- **Three-dot action menu (⋯) for cancel**: Following iOS/Android patterns,
  the cancel action is tucked behind a three-dot icon button rather than a
  visible text button. This prevents accidental taps on a destructive action.
  The action sheet modal uses a centered card pattern (not bottom sheet) to
  focus attention on the single destructive option.

- **Two-step confirmation for cancellation**: The flow requires two explicit
  user actions: (1) tap ⋯ → tap "Cancelar reserva" in the action sheet, then
  (2) confirm via native `Alert.alert`. This double opt-in aligns with the
  acceptance criteria's requirement for a "mandatory native validation dialog".

- **Optimistic UI with state reversion**: On successful cancel, the local
  reservation status changes to `CANCELLED` immediately without waiting for
  a full list re-fetch. The `ReservationStatus` type already supported `CANCELLED`
  (used by CANCELLED cards with strikethrough), so the existing UI handles the
  new state seamlessly.

- **Silent calendar refresh via `.catch()`**: After a successful cancel,
  `fetchCalendarDates()` refreshes the calendar dot counts. Errors from this
  refresh are silently caught (`.catch(() => {})`) to prevent them from
  overwriting the success state or misleading the user into thinking the
  cancellation failed when it actually succeeded.

- **Guard clause for empty reservationId**: `cancelReservation('')` returns
  `false` immediately without making an API call. This prevents unnecessary
  network requests for invalid IDs and avoids misleading error states.

- **`cancellingId` for per-card spinner**: Rather than a global loading flag,
  `cancellingId` tracks which specific reservation is being cancelled. This
  allows the three-dot button to hide and the spinner to show only on the
  affected card, avoiding a jarring full-list reload.

- **Optional props for backward compatibility**: `ReservationCard` accepts
  `onCancel` and `cancelling` as optional props. When omitted (e.g., reusing
  the component in the admin context), the three-dot button does not render,
  maintaining full backward compatibility with existing usage.

### Known Limitations

- The booking flow currently only supports creating a single reservation
  per event per user. Attempting a second reservation returns a 409 with a
  Spanish "duplicate" message.
- The quantity input `maxLength` is set to the character length of the
  remaining capacity. For very small capacities (1-9), this works
  correctly; for larger capacities, typing a multi-digit number that
  exceeds the limit character-by-character will have partial clamping.
- Real-time seat count updates are not implemented. The capacity displayed
  in the booking form is a point-in-time snapshot fetched on mount.

---

## Changelog

### v1.3.0 — 2026-06-12
- **New feature**: Cancel reservation (EBM-15) from customer booking list
  - Added three-dot action button (⋯) to `ReservationCard` for CONFIRMED reservations
  - Action sheet `Modal` with "Cancelar reserva" destructive option
  - Native `Alert.alert` confirmation dialog with permanent-action warning
  - Optimistic UI update: local status → CANCELLED on 200 response
  - Inline `ActivityIndicator` during cancellation (`testID="cancelling-spinner"`)
  - Calendar date counts auto-refresh after cancel (silent `.catch()` protection)
- Added `cancelReservation(reservationId)` method + `cancellingId` state to `useReservationsCalendar` hook
- Added `user_id: string` field to `Reservation` TypeScript interface
- Error handling: `ApiError` with status-based messages (404 → localized), `TypeError` (network), generic fallback
- Guard clause: `if (!reservationId) return false` prevents empty ID API calls
- Accessibility: `accessibilityRole="button"`, contextual `accessibilityLabel`, `hitSlop` ≥44pt
- WCAG AA: CONFIRMED badge color darkened to `#1e7e34` (contrast ratio 4.9:1)
- Added 6 `CUSTOMER` constants for cancel flow strings
- Added 18 cancel-specific tests (10 unit + 8 feature)
- Backend: `fetchCalendarDates` race condition fix + 404 localized message + email dispatch
- API contract: `api-contracts/cancel-reservation.yaml`

### v1.2.1 — 2026-06-12
- **QA fix**: Moved hardcoded `'entrada'`/`'entradas'` to `CUSTOMER.TICKET_SINGULAR`/`TICKET_PLURAL`
- **QA fix**: Removed `console.error(e)` from `useCalendarEvents` and `useReservationsCalendar` catch blocks
- **QA fix**: Added `hideLoadingOverlay` prop to `Calendar` — customer screen no longer shows redundant loading overlay
- **QA fix**: Changed `formatTime` from English AM/PM to Spanish `a.m.`/`p.m.` for locale consistency
- **QA fix**: Removed unused `CUSTOMER.RESERVATIONS_SUBTITLE` constant
- **QA fix**: Updated `useReservations.ts` TODO comment; deleted `ReservationItem.tsx` placeholder
- **QA fix**: Added 22 tests across 4 new test files (186 total):
  - `ReservationCardFeatureTest.tsx` — 9 tests (render, CONFIRMED, CANCELLED, notes, singular/plural)
  - `ReservationsCalendarFeatureTest.tsx` — 5 tests (empty state, loading, error, empty day, reservations list)
  - `ReservationsCalendarUnitTest.ts` — 6 tests (hook: fetch, sort, errors, month/year clearing)
  - `ReservationsServiceUnitTest.ts` — 2 tests (getCalendarDates URL, list URL)

### v1.2.0 — 2026-06-12
- **New feature**: Reservations calendar (EBM-14) in the "Reservas" tab
  - Reused `Calendar` component from admin dashboard (unchanged)
  - Created `useReservationsCalendar` hook — calendar dots + daily reservation list
  - Created `ReservationCard` component — compact card with status badge, 12h time, notes
  - Converted `reservations.tsx` to directory-based route with Stack layout (native header)
  - Added `useFocusEffect` → `refresh()` for auto-refresh on tab focus
- Added `reservationsService.getCalendarDates(year, month)` → `GET /api/v1/reservations/calendar`
- Added `reservationsService.list(params)` → `GET /api/v1/reservations`
- Added types: `ReservationSummary`, `ReservationsListParams`, `PaginatedReservationsResponse`
- Added 12 CUSTOMER constants for reservations calendar in `ui.ts` (empty/loading/status labels)
- Added `ERRORS.CALENDAR_RESERVATIONS_ERROR` constant
- Changed time format to 12h in `ReservationCard` and `EventCard` compact variant (consistency)
- Removed `console.error(e)` from `useCalendarEvents` and `useReservationsCalendar` catch blocks
- Added max quantity validation banner before submit (no auto-submit with corrected value)

### v1.1.0 — 2026-06-12
- **QA fix**: `clampQuantity` now caps at `Math.min(remainingCapacity, 100)`
  to match YAML `ticket_quantity.maximum: 100` — prevents 422 rejections
- **QA fix**: `setSubmitting(false)` moved to `finally` block so submitting
  state always resets (was leaking `true` on success)
- **QA fix**: Added `accessibilityRole="button"` and
  `accessibilityState={{ disabled }}` to stepper buttons; added
  `accessibilityState={{ disabled: submitting }}` to `TextInput`
- **QA fix**: 422 errors now display Spanish `BOOKING.VALIDATION_ERROR`
  instead of raw English `detail[].message`
- **Backend change**: `ReservationStatus` reduced to
  `'CONFIRMED' | 'CANCELLED'` (removed `PENDING` — backend no longer
  supports it)
- Added 5 missing tests: submitting state lock, event fetch error, 422
  Spanish message, 500 server error, generic exception (16 total)
- Added `BOOKING.VALIDATION_ERROR` constant
- Updated `reservations.ts` response status from `PENDING` to `CONFIRMED`

### v1.0.0 — 2026-06-11
- Initial implementation of reservation booking form (EBM-13)
- Created `src/types/reservations.ts`: `ReservationStatus`,
  `ReservationUserContext`, `CreateReservationRequest`, `ReservationResponse`
- Created `src/services/reservations.ts`: `reservationsService.create()`
  → `POST /api/v1/reservations`
- Added `BOOKING` constants block to `src/constants/ui.ts` (16 constants)
- Implemented `app/(customer)/events/book.tsx` — reservation booking form:
  - Event summary card with category-colored left accent border
  - Editable numeric quantity input with stepper buttons (−/+)
  - Quantity clamped between 1 and `remaining_capacity` on blur
  - Optional notes field (multiline, maxLength 500)
  - Submit button with loading spinner, input lock during submission
  - Error banner matching system pattern (`#fdecea` / `#dc3545`)
  - All error messages in Spanish (400, 409 capacity, 409 duplicate)
  - Success banner (`#d4edda` / `#28a745`) for 1.2s → `router.back()`
- Registered `book` screen in `events/_layout.tsx` Stack
- Updated `events/[id].tsx`: `handleBook` navigates to book screen with
  `event_id`
- Refactored `useEventDetail`: `useEffect` → `useFocusEffect` so detail
  screen re-fetches capacity after returning from booking
- Added `tests/Feature/events/BookingFormFeatureTest.tsx` — 12 tests

---

## Documentation Checklist

- [x] API contract file linked (4 contracts: create, calendar, list, cancel)
- [x] File map reflects all created/modified files
- [x] Component tree shows screen hierarchy
- [x] All visual states documented (including cancel flow: action menu, alert, cancelling, success, errors)
- [x] All error messages mapped (client + server, including cancel-specific 400/404/network/empty ID)
- [x] Test scenarios verified and passing (37 total: 18 unit + 19 feature)
- [ ] Screenshots added for each visual state
- [x] Design decisions explained (including cancel-specific patterns)
- [x] Changelog updated (v1.3.0)

---

**Last updated**: `2026-06-12`
**Documented by**: Luis Alejandro Salazar Vargas
