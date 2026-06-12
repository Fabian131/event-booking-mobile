# Module: Events

---

## General Information

- **Module Code**: `EBM-10` (feed) · `EBM-12` (detail)
- **API Contracts**: `api-contracts/list-events.yaml` · `api-contracts/get-event-by-id.yaml`
- **Responsible**: Justin Moreira Matarrita, Luis Alejandro Salazar Vargas
- **Status**: Completed
- **Version**: `1.3.0`
- **Created**: `2026-06-05`
- **Last Updated**: `2026-06-11`

---

## Description

Customer-facing events module composed of two screens:

**Feed screen** (`events/index.tsx`) — displays upcoming activities in a large stacked-card format. Implements the `list-events.yaml` contract using offset-based pagination (`page` / `limit`). On mount, the screen fetches the first page; as the user scrolls near the bottom, subsequent pages are appended seamlessly. Supports pull-to-refresh, skeleton loading placeholders, an empty state, and an inline error banner with a retry button.

**Detail screen** (`events/[id].tsx`) — displays the full contextual information of a single event: image, title, long description, date, start/end hours, category badge, and a live capacity tracker. Bound to the `GET /api/v1/events/{event_id}` endpoint via the `useEventDetail` hook. Includes an **authentication guard** on the "Reservar" button: unauthenticated users see a non-intrusive modal prompting them to log in; authenticated users are navigated to the booking form (`events/book`).

The data layer (types, service, hooks) is isolated from the screens so that components can be extended independently.

---

## API Contracts

### List Events

**File:** `api-contracts/list-events.yaml`

| Method | Route            | Auth | Description                                      |
|--------|------------------|------|--------------------------------------------------|
| GET    | `/api/v1/events` | No   | List upcoming events with pagination and filters |

#### Query Parameters

| Parameter   | Type    | Required | Default | Constraints                         |
|-------------|---------|----------|---------|-------------------------------------|
| `page`      | integer | No       | 1       | min: 1                              |
| `limit`     | integer | No       | 20      | min: 1, max: 100                    |
| `search`    | string  | No       | —       | keyword search on title/description |
| `category`  | string  | No       | —       | enum: see `EventCategory`           |
| `is_active` | boolean | No       | true    | filter by active status             |
| `date`      | string  | No       | —       | filter by event date (YYYY-MM-DD)   |

#### Response (200 OK)

```json
{
  "data": [
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
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 48,
    "total_pages": 3,
    "has_next_page": true
  }
}
```

---

### Get Event

**File:** `api-contracts/get-event-by-id.yaml`

| Method | Route                        | Auth | Description                   |
|--------|------------------------------|------|-------------------------------|
| GET    | `/api/v1/events/{event_id}`  | No   | Fetch a single event by ID    |

#### Path Parameters

| Parameter  | Type   | Required | Description       |
|------------|--------|----------|-------------------|
| `event_id` | string | Yes      | UUID of the event |

#### Response (200 OK)

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

#### Response (500 Server Error)

```json
{
  "error": "internal_server_error",
  "message": "An unexpected error occurred",
  "details": {}
}
```

---

## Architecture

### File Map

```
src/
├── types/
│   └── events.ts                          # Event, PaginationMeta, EventsListResponse,
│                                          #   EventsListParams, EventCategory
├── services/
│   ├── api.ts                             # HTTP client (fetch wrapper, token handling)
│   └── events.ts                          # eventsService.list() — GET /api/v1/events
│                                          # eventsService.getById() — GET /api/v1/events/:id
├── hooks/
│   ├── useEvents.ts                       # Pagination hook: events[], loading, refreshing,
│   │                                      #   error, hasNextPage, loadMore(), refresh()
│   └── useEventDetail.ts                  # Detail hook: event, loading, error
│                                          #   Uses useFocusEffect to re-fetch on screen focus
├── components/
│   ├── ui/
│   │   ├── EmptyState.tsx                 # Reusable empty list state (icon, title, subtitle)
│   │   ├── Loader.tsx                     # Full-screen loading indicator
│   │   ├── Button.tsx                     # Primary/secondary touchable button
│   │   ├── LogoutButton.tsx               # Header action in the nested events Stack
│   │   ├── haptic-tab.tsx                 # Custom tab button used by the customer Tabs layout
│   │   ├── icon-symbol.tsx                # Tab icon abstraction used by customer tabs
│   │   ├── themed-text.tsx                # Theme-aware text (title, defaultSemiBold, link)
│   │   └── themed-view.tsx                # Theme-aware view container
│   └── domain/
│       ├── EventCard.tsx                  # Large event card + EventCardSkeleton (animated pulse)
│       │                                  #   onPress prop wired to detail navigation
│       └── AuthGuardModal.tsx             # Reusable login-intercept modal (visible, onClose, onLogin)
├── utils/
│   └── dateHelpers.ts                     # formatEventDate(), formatEventTime() — es-CR locale
└── constants/
    └── ui.ts                              # AUTH, CATEGORY, EVENTS, VALIDATION, ERRORS, ADMIN, CUSTOMER
app/
├── index.tsx                              # Root redirect → /(customer)/events
└── (customer)/
    ├── _layout.tsx                        # Tabs layout: eventos + reservations
    └── events/
        ├── _layout.tsx                    # Stack layout: index, [id], book
        ├── index.tsx                      # CustomerEventsScreen — FlatList feed
        └── [id].tsx                       # EventDetailScreen — full event view + AuthGuardModal
tests/
└── Feature/
    └── events/
        ├── RenderFeedFeatureTest.tsx               # Header, cards with title/description/category
        ├── EmptyStateFeatureTest.tsx               # "Sin eventos por ahora" when data is empty
        ├── NetworkErrorFeatureTest.tsx             # Error banner + retry flow on TypeError
        ├── ServerErrorFeatureTest.tsx              # Error banner on 500/503, no cards shown
        ├── PaginationFeatureTest.tsx               # Infinite scroll: page append, has_next_page guard, dedup
        ├── EventDetailFeatureTest.tsx              # Detail screen render: fields, capacity, error state
        ├── AuthGuardFeatureTest.tsx                # Auth guard: modal for guests, navigation for authenticated
        └── EventDetailNetworkErrorFeatureTest.tsx  # TypeError on getById → EmptyState with ERRORS.NETWORK
```

### Data Flow — Feed

```
App mounts CustomerEventsScreen
    │
    ▼
useEvents() — useEffect calls loadEvents(page: 1, reset: true)
    │
    ├── setLoading(true)
    │
    ▼
eventsService.list({ page, limit: 20 })
    │
    ▼
api.get('/api/v1/events?page=1&limit=20')
    │
    ▼
┌──────────────────────────────────────────────────────┐
│ 200 OK     → setEvents(data), setHasNextPage(...)    │
│ 500 Error  → setError(ApiError.message)              │
│ Network    → setError('Error al cargar los eventos') │
└──────────────────────────────────────────────────────┘
    │
    ▼
setLoading(false)

User taps EventCard
    │
    ▼
router.push('/(customer)/events/[id]', { id })
```

### Data Flow — Detail

```
App mounts EventDetailScreen (id from useLocalSearchParams)
    │
    ▼
useEventDetail(id) — useFocusEffect calls load()
    │
    ├── setLoading(true)
    │
    ▼
eventsService.getById(id)
    │
    ▼
api.get('/api/v1/events/:id')
    │
    ▼
┌──────────────────────────────────────────────────────┐
│ 200 OK     → setEvent(data)                          │
│ Error      → setError(ApiError.message | fallback)   │
└──────────────────────────────────────────────────────┘
    │
    ▼
setLoading(false)

User taps "Reservar"
    │
    ├── isAuthenticated = false → setModalVisible(true)
    │       └── Modal: "Iniciar sesión" → router.push('/(auth)/login')
    │
    └── isAuthenticated = true  → router.push({
            pathname: '/(customer)/events/book',
            params: { event_id }
        })
    │       └── BookScreen (see reservations.md)
    │
    ▼
When returning from booking (router.back()),
useFocusEffect retriggers getById → updated capacity displayed
```

---

## Files

### Screens

#### Feed — `app/(customer)/events/index.tsx`

| State        | Type             | Description                                          |
|--------------|------------------|------------------------------------------------------|
| `events`     | `Event[]`        | Accumulated list of all loaded pages                 |
| `loading`    | `boolean`        | True during any active fetch (initial or paginated)  |
| `refreshing` | `boolean`        | True during pull-to-refresh                          |
| `error`      | `string \| null` | Error message shown in the inline error banner       |
| `hasNextPage`| `boolean`        | Derived from `pagination.has_next_page`              |

**UI structure:**
- `ThemedView` (container) wraps all content
- Header: title "Eventos" + subtitle
- Inline error banner (conditional): red left-bordered box + "Reintentar"
- `FlatList` with `onEndReached`, `RefreshControl`, skeleton, empty state, footer spinner
- Each `EventCard` receives `onPress` → navigates to `events/[id]`

#### Detail — `app/(customer)/events/[id].tsx`

| State          | Type                | Description                                    |
|----------------|---------------------|------------------------------------------------|
| `event`        | `Event\|null`       | Loaded event data                              |
| `loading`      | `boolean`           | True while fetching from API                   |
| `error`        | `string\|null`      | Error message on failed fetch                  |
| `modalVisible` | `boolean`           | Controls auth guard modal visibility           |

**UI structure:**
- `ScrollView` with full-width event image (280px)
- Title + category badge row
- `InfoRow` cards: Fecha, Hora de inicio, Hora de fin, Cupos disponibles
- Description section (conditional on field presence)
- Sticky footer with "Reservar" `Button`
- `Modal` (transparent, fade): login prompt for unauthenticated users

### Components

| Component          | File                                      | Key Props / Notes                                          |
|--------------------|-------------------------------------------|------------------------------------------------------------|
| `ThemedText`       | `src/components/ui/themed-text.tsx`       | `type` ("title", "defaultSemiBold")                        |
| `ThemedView`       | `src/components/ui/themed-view.tsx`       | Theme-aware container                                      |
| `EmptyState`       | `src/components/ui/EmptyState.tsx`        | `icon, title, subtitle`                                    |
| `Loader`           | `src/components/ui/Loader.tsx`            | `message` — full-screen loading indicator                  |
| `Button`           | `src/components/ui/Button.tsx`            | `title, onPress, variant` ("primary"/"secondary")          |
| `EventCard`        | `src/components/domain/EventCard.tsx`     | `event: Event, onPress?: () => void`                |
| `EventCardSkeleton`| `src/components/domain/EventCard.tsx`     | Animated pulse placeholder                                 |
| `AuthGuardModal`   | `src/components/domain/AuthGuardModal.tsx`| `visible, onClose, onLogin` — login-intercept modal        |

### Services

| Method                        | Endpoint                        | Returns              | Description                 |
|-------------------------------|---------------------------------|----------------------|-----------------------------|
| `eventsService.list(params)`  | `GET /api/v1/events?...`        | `EventsListResponse` | Paginated list of events    |
| `eventsService.getById(id)`   | `GET /api/v1/events/{id}`       | `Event`              | Single event by ID          |

### Hooks

#### `useEvents` — `src/hooks/useEvents.ts`

| Field         | Type             | Description                                    |
|---------------|------------------|------------------------------------------------|
| `events`      | `Event[]`        | Accumulated results across all loaded pages    |
| `loading`     | `boolean`        | Active during initial load and paginated loads |
| `refreshing`  | `boolean`        | Active during pull-to-refresh                  |
| `error`       | `string \| null` | Last error message, reset on successful fetch  |
| `hasNextPage` | `boolean`        | Mirrors `pagination.has_next_page` from API    |
| `currentPage` | `number`         | Tracks the last successfully loaded page       |

#### `useEventDetail` — `src/hooks/useEventDetail.ts`

| Field     | Type                 | Description                          |
|-----------|----------------------|--------------------------------------|
| `event`   | `Event\|null`        | Fetched event, null until resolved   |
| `loading` | `boolean`            | True while request is in flight      |
| `error`   | `string\|null`       | Error message on failed fetch        |

Accepts `id: string`. Uses `useFocusEffect` (from `@react-navigation/native`) instead of `useEffect` so the event data is re-fetched every time the screen gains focus — this ensures the capacity display updates automatically after returning from a successful booking. Includes mounted-flag guard to prevent state updates after cleanup.

### Types

**File:** `src/types/events.ts`

| Type                 | Description                                                                                                                      |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `EventCategory`      | `'sports' \| 'music' \| 'culture' \| 'gastronomy' \| 'wellness' \| 'education' \| 'other'`                                      |
| `Event`              | Full event shape: id, title, description, image_url, max_capacity, remaining_capacity, category, date, start_time, end_time, is_active, timestamps |
| `PaginationMeta`     | `{ page, limit, total, total_pages, has_next_page }`                                                                             |
| `EventsListResponse` | `{ data: Event[], pagination: PaginationMeta }`                                                                           |
| `EventsListParams`   | `{ page?, limit?, search?, category?, is_active?, date? }`                                                                       |

---

## UI / UX

### Component Tree — Feed

```
CustomerEventsScreen
└── ThemedView (container, flex: 1)
    ├── ThemedView (header)
    │   ├── ThemedText type="title"   → "Eventos"
    │   └── ThemedText                → "Explora los eventos disponibles"
    ├── ErrorBanner (conditional)
    │   ├── ThemedText (red)          → error message
    │   └── TouchableOpacity          → "Reintentar" → refresh()
    └── FlatList
        ├── renderItem                → EventCard (onPress → detail)
        ├── ItemSeparatorComponent    → View height: 16
        ├── ListEmptyComponent
        │   ├── (loading)             → 5× EventCardSkeleton
        │   └── (!loading)            → EmptyState icon="📅"
        ├── ListFooterComponent
        │   └── (loading + data > 0)  → ActivityIndicator (small)
        └── refreshControl            → RefreshControl
```

### Component Tree — Detail

```
EventDetailScreen
└── ThemedView (container, flex: 1)
    ├── ScrollView
    │   ├── Image (full-width, 280px height)
    │   └── View (content)
    │       ├── View (titleRow)
    │       │   ├── ThemedText (title, fontSize 28)
    │       │   └── View (badge, categoryColor background)
    │       ├── View (infoCard)
    │       │   ├── InfoRow "Fecha"             → human-readable (e.g. "Jueves 18 de junio de 2026")
    │       │   ├── InfoRow "Hora de inicio"    → AM/PM format (e.g. "10:00 a.m.")
    │       │   ├── InfoRow "Hora de fin"       → AM/PM format
    │       │   └── InfoRow "Cupos disponibles" → remaining count only (e.g. "342")
    │       └── View (descriptionSection, conditional)
    │           └── ThemedText (event.description)
    ├── View (footer, sticky)
    │   └── Button title="Reservar" → handleBook()
    └── AuthGuardModal (visible=modalVisible, onClose, onLogin → /(auth)/login)
```

### Visual States — Feed

| State               | What the user sees                                                      |
|---------------------|-------------------------------------------------------------------------|
| **Initial load**    | 5 skeleton cards with animated gray pulse                               |
| **Data loaded**     | Stacked cards: image, category badge, title, description                |
| **Paginating**      | Existing cards + footer `ActivityIndicator`                             |
| **Pull to refresh** | `RefreshControl` spinner, list reloads from page 1                      |
| **No events**       | 📅 icon + "Sin eventos por ahora" + subtitle                            |
| **Error**           | Red left-bordered banner + "Reintentar" button                          |

### Visual States — Detail

| State                    | What the user sees                                                      |
|--------------------------|-------------------------------------------------------------------------|
| **Loading**              | Full-screen `Loader` with "Cargando evento..."                          |
| **Data loaded**          | Image, title, category badge, info rows, description, Reservar button  |
| **Error**                | `EmptyState` with ⚠️ icon and error message                             |
| **Guest taps Reservar**  | Fade-in modal: "Inicia sesión para continuar" + login button           |
| **Return from booking**  | `useFocusEffect` re-fetches event → updated capacity shown             |

---

## Error Handling

### Feed

| Error         | Trigger                    | UI Feedback                                                      |
|---------------|----------------------------|------------------------------------------------------------------|
| Network error | `fetch` throws `TypeError` | Red banner: "Error al cargar los eventos" + "Reintentar"         |
| Server 500    | API returns 5xx            | Red banner with `ApiError.message` + "Reintentar"                |
| Empty result  | `data: []`                 | `EmptyState` component (no banner)                               |
| Retry success | User taps "Reintentar"     | Error banner disappears, cards render                            |

### Detail

| Error         | Trigger                     | UI Feedback                                                      |
|---------------|-----------------------------|------------------------------------------------------------------|
| Network error | `fetch` throws `TypeError`  | `EmptyState` with "Error al cargar el evento"                    |
| Server error  | `ApiError` thrown           | `EmptyState` with `ApiError.message`                             |
| Guest booking | `isAuthenticated === false` | Modal with login prompt (no navigation occurs)                   |

---

## Tests

### Test File Map

```
tests/
└── Feature/
    └── events/          # 8 files — screen integration tests
```

### Naming Convention

| Test Type | Suffix        | Extension | Example                          |
|-----------|---------------|-----------|----------------------------------|
| Feature   | `FeatureTest` | `.tsx`    | `EventDetailFeatureTest.tsx`     |

### Feature Tests

**Location:** `tests/Feature/events/`

| File                          | Scenario                                                                 | Tests |
|-------------------------------|--------------------------------------------------------------------------|-------|
| `RenderFeedFeatureTest.tsx`              | Header visible; cards show title, description, translated category       | 4     |
| `EmptyStateFeatureTest.tsx`              | Empty `data: []` → "Sin eventos por ahora" shown, no cards              | 2     |
| `NetworkErrorFeatureTest.tsx`            | `TypeError` → error banner; "Reintentar" fires second fetch and recovers | 2     |
| `ServerErrorFeatureTest.tsx`             | `ApiError` 500/503 → error banner; no cards rendered                    | 1     |
| `PaginationFeatureTest.tsx`              | Page append on scroll; dedup guard; `has_next_page: false` stops fetch  | 3     |
| `EventDetailFeatureTest.tsx`             | Renders title, description, category, info labels, capacity, Reservar button, error state, absent description | 8 |
| `AuthGuardFeatureTest.tsx`               | Guest sees modal; no navigation on guest tap; modal routes to login; cancel closes modal; authenticated navigates to book screen; no modal for authenticated | 6 |
| `EventDetailNetworkErrorFeatureTest.tsx` | `TypeError` on `getById` → `EmptyState` with `ERRORS.NETWORK` message   | 1     |

**Total:** 8 Feature files — 27 tests passing

Note: The booking form is tested independently in `BookingFormFeatureTest.tsx` (12 tests), documented in `reservations.md`.

### Mocks used

| Mock | Reason |
|------|--------|
| `@/src/services/events` | Prevent real HTTP calls; control resolved/rejected values |
| `expo-image` | Native image component not available in Jest environment |
| `expo-secure-store` | Imported transitively by `api.ts` via `storage.ts` |
| `expo-router` | `useLocalSearchParams` and `useRouter` not available outside Expo context |
| `@/src/context/AuthContext` | Control `isAuthenticated` state per test case |
| `@react-navigation/native` | `useFocusEffect` requires navigation context; mocked to behave as `useEffect` |

### Running Tests

```bash
# All tests
npm test

# Events feature tests only
npx jest tests/Feature/events/

# Single file
npx jest tests/Feature/events/AuthGuardFeatureTest

# Watch mode
npx jest --watch tests/Feature/events/
```

---

## Technical Notes

### Design Decisions

- **Isolated data layer**: types, service, and hooks are fully decoupled from screens. Screens consume only the hook's public interface, making it trivial to swap the API or add caching.
- **Concurrent-fetch guard via `useRef`**: `FlatList.onEndReached` can fire multiple times before the first page resolves. A `useRef<boolean>` flag prevents duplicate requests without triggering re-renders.
- **Skeleton via `ListEmptyComponent`**: 5 `EventCardSkeleton` items render in place through `ListEmptyComponent`, providing immediate visual feedback at the same dimensions as real cards.
- **Category badge as absolute overlay**: Placing the badge with `position: absolute` on the image preserves the card's content area for title and description.
- **`useEventDetail` uses `useFocusEffect`**: Replaced `useEffect` with `useFocusEffect` (from `@react-navigation/native`) so the event data is re-fetched every time the screen gains focus. This ensures the capacity display updates automatically after returning from a successful booking, without needing explicit refresh logic in the screens.
- **Auth guard via modal, not redirect**: Blocking the booking action with a non-intrusive modal (rather than a full redirect) lets the guest stay on the event detail page and choose to log in or stay browsing.
- **Static capacity display**: Capacity is fetched on mount (or on screen focus) and shown as the remaining seat count only. The `remaining / max (Z%)` format was removed per QA (EBM-12) — only the remaining count is needed. Real-time polling is out of scope.
- **No auth required on GET**: `GET /api/v1/events` and `GET /api/v1/events/{id}` are public endpoints. The `api.get` wrapper attaches the Bearer token only when available.

### Known Limitations

- Infinite scroll `onEndReachedThreshold={0.3}` may fire earlier than expected on very short lists. A minimum page size check could be added in a future iteration.
- Capacity tracker updates only on mount and on screen focus (after booking return). A future iteration could add polling or WebSocket updates for live seat counts.
- No search or category filter UI is exposed to the user yet. The service params support them but filter controls are out of scope for EBM-10.

---

## Changelog

### v1.3.0 — 2026-06-11 (EBM-13 integration)
- Updated `handleBook` in `[id].tsx`: now navigates to `events/book` with `event_id` param instead of the placeholder `/(customer)/reservations` stub
- Registered `book` screen in `events/_layout.tsx` Stack
- Refactored `useEventDetail`: `useEffect` → `useFocusEffect` from `@react-navigation/native` so the detail screen re-fetches event data on every focus, displaying updated capacity after returning from a booking
- Updated `AuthGuardFeatureTest`: route assertion changed from `/(customer)/reservations` to navigation object with `pathname: '/(customer)/events/book'`
- Added `@react-navigation/native` mock to all test files using `useEventDetail`
- See `reservations.md` for the complete booking form implementation (EBM-13)

### v1.2.1 — 2026-06-09 (documentation fixes)
- Corrected the detail contract reference to `get-event-by-id.yaml`.
- Updated the public events file map to include `LogoutButton`, `HapticTab`, and `IconSymbol` used by the customer layouts.

### v1.2.0 — 2026-06-07 (EBM-12 QA fixes + EBM-REFACTOR-01)
- Fixed `events/_layout.tsx`: native Stack back button (matching admin pattern); `LogoutButton` moved to `headerRight` with `tintColor`
- Fixed `app/_layout.tsx`: added `SafeAreaProvider` so `useSafeAreaInsets` returns correct insets on device
- Removed extraneous `Tabs.Screen name="events/[id]"` registration from `(customer)/_layout.tsx`
- Added `chevron.left → chevron-left` MaterialIcons mapping to `icon-symbol.tsx` for Android back button
- Implemented `formatEventDate` / `formatEventTime` in `src/utils/dateHelpers.ts` (es-CR locale, weekday long, AM/PM)
- Fixed date display: `dd/mm/yyyy` → human-readable `"Jueves 18 de junio de 2026"`
- Fixed time display: 24h `HH:MM` → `es-CR` AM/PM (`"10:00 a.m."`)
- Fixed capacity display: removed `"X de Y (Z%)"` format — shows remaining count only
- Added `CATEGORY` object to `src/constants/ui.ts` with `COLORS` and `LABELS` records; removed exported consts from `EventCard.tsx`
- Added `EVENTS.DETAIL_*`, `EVENTS.LOGIN_MODAL_*`, `CUSTOMER.EVENTS_*`, `CUSTOMER.RESERVATIONS_*` constants
- Replaced 12 hardcoded strings in `[id].tsx` with constants from `src/constants/ui.ts`
- Extracted `AuthGuardModal` to `src/components/domain/AuthGuardModal.tsx` (props: `visible`, `onClose`, `onLogin`)
- Added `EventDetailNetworkErrorFeatureTest` — covers `TypeError` path in `useEventDetail`
- Fixed stale assertion in `EventDetailFeatureTest`: capacity value updated from `'50 de 100 (50%)'` → `'50'`

### v1.1.0 — 2026-06-06 (EBM-12)
- Restructured customer route: moved `index.tsx` into `events/` subfolder and added Stack layout to support nested `[id]` route
- Added `eventsService.getById(id)` — `GET /api/v1/events/{id}`
- Added `useEventDetail` hook with mounted-flag guard
- Added `onPress` prop to `EventCard` wired to detail navigation
- Implemented `EventDetailScreen` with full event info and auth guard modal
- Fixed root redirect to point at `/(customer)/events` after route restructure
- Added `EventDetailFeatureTest` (8 tests) and `AuthGuardFeatureTest` (6 tests)

### v1.0.0 — 2026-06-05 (EBM-10)
- Initial implementation of Events Feed module
- Created `Event`, `PaginationMeta`, `EventsListResponse`, `EventsListParams`, `EventCategory` types
- Created `eventsService.list()` wrapping `api.get` with query string builder
- Implemented `useEvents` hook with pagination, refresh, concurrent-fetch guard
- Created `EventCard` component with absolute category badge and animated `EventCardSkeleton`
- Created reusable `EmptyState` UI component
- Implemented `CustomerEventsScreen` with `FlatList`, infinite scroll, pull-to-refresh, skeleton, and error banner
- Added 4 Feature tests (9 assertions) covering render, empty state, network error + retry, server error

---

## Documentation Checklist

- [x] API contract files linked
- [x] File map reflects all created/modified files
- [x] Component trees show screen hierarchies
- [x] All visual states documented (initial, loading, data, empty, error)
- [x] Error handling mapped (network, server, empty, auth guard)
- [x] Test scenarios verified and passing
- [ ] Screenshots added for each visual state
- [x] Design decisions explained
- [x] Known limitations documented
- [x] Changelog updated

---

**Last updated**: `2026-06-11`
**Documented by**: Justin Moreira Matarrita, Luis Alejandro Salazar Vargas
