# Module: Admin Event Detail

---

## General Information

- **Module Code**: `EBM-04`
- **API Contract**: `api-contracts/get-event-by-id.yaml`
- **Responsible**: Justin Moreira Matarrita
- **Status**: In Development
- **Version**: `1.0.0`
- **Created**: `2026-06-11`
- **Last Updated**: `2026-06-11`

---

## Description

Admin-facing read-only detail screen for a single event. Activated when a business user selects any event from the Admin dashboard (`/(admin)/index`), this screen surfaces every field returned by `GET /api/v1/events/{event_id}` — including live capacity — so that the administrator can audit the event before taking an action.

The screen is the **navigation hub** for admin event operations: the header "Editar" button routes into the edit form (`/(admin)/edit-event/[id]`), and the footer "Ver Reservaciones" button will route into the reservations checklist once that screen is implemented (`/(admin)/events/[id]/reservations`).

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
│   │   ├── Button.tsx                     # "Ver Reservaciones" footer action
│   │   ├── EmptyState.tsx                 # Error / not-found state
│   │   ├── Loader.tsx                     # Full-screen loading spinner
│   │   ├── LogoutButton.tsx               # Right side of header (alongside Edit button)
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

Admin taps "Editar" (header)
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

**Header override:** `<Stack.Screen options={{ headerRight }}>` rendered inside the component so the `id` param is in scope for the Edit navigation.

### Components Used

| Component      | File                                  | Usage in this screen                              |
|----------------|---------------------------------------|---------------------------------------------------|
| `InfoRow`      | Inline (local to this file)           | Label/value rows: date, times, capacity, status   |
| `Button`       | `src/components/ui/Button.tsx`        | "Ver Reservaciones" footer CTA                    |
| `EmptyState`   | `src/components/ui/EmptyState.tsx`    | Error and not-found states                        |
| `Loader`       | `src/components/ui/Loader.tsx`        | Loading state                                     |
| `LogoutButton` | `src/components/ui/LogoutButton.tsx`  | Paired with Edit button in header right           |
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
| `ADMIN`          | `src/constants/ui.ts`    | `DETAIL_EDIT_BUTTON`, `DETAIL_RESERVATIONS_BUTTON`, `DETAIL_MAX_CAPACITY_LABEL`, `DETAIL_AVAILABLE_LABEL`, `DETAIL_STATUS_LABEL`, `DETAIL_STATUS_ACTIVE`, `DETAIL_STATUS_INACTIVE` |
| `EVENTS`         | `src/constants/ui.ts`    | `DETAIL_LOADING`, `DETAIL_NOT_FOUND`, `DETAIL_DATE_LABEL`, `DETAIL_START_LABEL`, `DETAIL_END_LABEL` |
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
├── Stack.Screen (headerRight: Edit + LogoutButton)
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
│   │       │   ├── InfoRow — Cupos disponibles
│   │       │   ├── Divider
│   │       │   └── InfoRow — Estado (colored value)
│   │       └── ThemedText (description, conditional)
│   └── View (footer, sticky)
│       └── Button — Ver Reservaciones
```

### Visual States

| State          | What the admin sees                                                    |
|----------------|------------------------------------------------------------------------|
| **Loading**    | Full-screen spinner with "Cargando evento..."                          |
| **Success**    | Hero image, title, category badge, 6 InfoRows, description, CTA footer |
| **Not found**  | `⚠️` EmptyState with "Evento no encontrado"                           |
| **Network**    | `⚠️` EmptyState with ERRORS.NETWORK message                          |
| **Server error**| `⚠️` EmptyState with ApiError message                               |

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
| Tap "Editar" header button                            | `router.push('/(admin)/edit-event/:id')` called                   |
| Tap "Ver Reservaciones" footer button                 | `router.push` called with `/(admin)/events/[id]/reservations`     |
| `is_active: true`                                     | Estado InfoRow value shows "Activo" in green (#28a745)            |
| `is_active: false`                                    | Estado InfoRow value shows "Inactivo" in gray (#687076)           |
| `useEventDetail` returns error                        | `EmptyState` with error message rendered; no scroll content       |
| `useEventDetail` returns loading = true               | `<Loader message="Cargando evento..." />` rendered                |
| API returns 404                                       | `EmptyState` icon="⚠️" title="Evento no encontrado"              |
| Network unreachable (TypeError)                       | `EmptyState` with ERRORS.NETWORK message                          |

---

## Technical Notes

### Design Decisions

- **Status as InfoRow, not badge**: The category badge already occupies the title row. Adding a second badge for status would visually compete. An InfoRow keeps both values equally scannable and follows the existing field pattern.

- **`remaining_capacity` is live-computed by the API**: The field reflects `max_capacity - sum(active reservations)` at request time. No client-side arithmetic is needed; the value displayed is always current.

- **Reservations button navigates to an unmatched route**: `/(admin)/events/[id]/reservations` does not exist yet. Expo Router renders its built-in unmatched screen without crashing the app, and the native back button returns the admin to this detail screen. The route will resolve automatically once `EBM-05` (Reservations list) is implemented.

- **`<Stack.Screen>` inside the component**: The Edit button in `headerRight` needs the `id` param to build its navigation target. Declaring `headerRight` inline inside the component (via `<Stack.Screen options={…}/>`) is the Expo Router pattern for dynamic header content.

### Known Limitations

- "Ver Reservaciones" routes to an unmatched screen until `EBM-05` is shipped.

---

## Changelog

### v1.0.0 — 2026-06-11
- Initial implementation
- Admin event detail screen: all fields, live capacity, category badge, status InfoRow
- Header Edit button wired to edit-event/[id]
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

**Last updated**: `2026-06-11`
**Documented by**: Justin Moreira Matarrita
