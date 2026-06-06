# Module: Events Feed

---

## General Information

- **Module Code**: `EBM-10`
- **API Contract**: `api-contracts/list-events.yaml`
- **Responsible**: Justin Moreira Matarrita
- **Status**: Completed
- **Version**: `1.0.0`
- **Created**: `2026-06-05`
- **Last Updated**: `2026-06-05`

---

## Description

Customer-facing events feed screen that displays upcoming activities in a large stacked-card format. Implements the `list-events.yaml` contract using offset-based pagination (`page` / `limit`). On mount, the screen fetches the first page; as the user scrolls near the bottom, subsequent pages are appended seamlessly. The screen also supports pull-to-refresh, skeleton loading placeholders during the initial load, an empty state when no events exist, and an inline error banner with a retry button on network or server failures.

The data layer (types, service, hook) is isolated from the screen so that the `EventCard` component and `useEvents` hook can be extended independently as new event-detail or reservation flows are added.

---

## API Contract

**File:** `api-contracts/list-events.yaml`

| Method | Route             | Auth | Description                                        |
|--------|-------------------|------|----------------------------------------------------|
| GET    | `/api/v1/events`  | No   | List upcoming events with pagination and filters   |

### Query Parameters

| Parameter   | Type    | Required | Default | Constraints               |
|-------------|---------|----------|---------|---------------------------|
| `page`      | integer | No       | 1       | min: 1                    |
| `limit`     | integer | No       | 20      | min: 1, max: 100          |
| `search`    | string  | No       | —       | keyword search on title/description |
| `category`  | string  | No       | —       | enum: see `EventCategory` |
| `is_active` | boolean | No       | true    | filter by active status   |

### Response (200 OK)

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

### Response (500 Server Error)

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
│   └── events.ts                      # EventSummary, PaginationMeta, EventsListResponse,
│                                      #   EventsListParams, EventCategory
├── services/
│   ├── api.ts                         # HTTP client (fetch wrapper, token handling)
│   └── events.ts                      # eventsService.list() — GET /api/v1/events
├── hooks/
│   └── useEvents.ts                   # Pagination hook: events[], loading, refreshing,
│                                      #   error, hasNextPage, loadMore(), refresh()
├── components/
│   ├── ui/
│   │   ├── EmptyState.tsx             # Reusable empty list state (icon, title, subtitle)
│   │   ├── Loader.tsx                 # Full-screen loading indicator (reused for footer)
│   │   ├── themed-text.tsx            # Theme-aware text (title, defaultSemiBold, link)
│   │   └── themed-view.tsx            # Theme-aware view container
│   └── domain/
│       └── EventCard.tsx              # Large event card + EventCardSkeleton (animated pulse)
app/
└── (customer)/
    └── index.tsx                      # CustomerEventsScreen — FlatList feed
tests/
└── Feature/
    └── events/
        ├── RenderFeedFeatureTest.tsx  # Header, cards with title/description/category
        ├── EmptyStateFeatureTest.tsx  # "Sin eventos por ahora" when data is empty
        ├── NetworkErrorFeatureTest.tsx # Error banner + retry flow on TypeError
        └── ServerErrorFeatureTest.tsx  # Error banner on 500/503, no cards shown
```

### Data Flow

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
│ Network    → setError(TypeError.message)             │
└──────────────────────────────────────────────────────┘
    │
    ▼
setLoading(false)

User scrolls to 70% of list
    │
    ▼
FlatList.onEndReached → loadMore()
    │
    ├── Guard: hasNextPage && !loading && !refreshing
    │
    ▼
loadEvents(currentPage + 1, reset: false)
    │
    ▼
setEvents(prev → [...prev, ...newData])   ← append, not replace

User pulls to refresh
    │
    ▼
refresh() → setRefreshing(true) → loadEvents(1, reset: true)
```

---

## Files

### Screen

**File:** `app/(customer)/index.tsx`

| State        | Type             | Description                                         |
|--------------|------------------|-----------------------------------------------------|
| `events`     | `EventSummary[]` | Accumulated list of all loaded pages                |
| `loading`    | `boolean`        | True during any active fetch (initial or paginated) |
| `refreshing` | `boolean`        | True during pull-to-refresh (controls RefreshControl spinner) |
| `error`      | `string \| null` | Error message shown in the inline error banner      |
| `hasNextPage`| `boolean`        | Derived from `pagination.has_next_page`             |

**Functions (in `useEvents`):**

| Function        | Description                                                      |
|-----------------|------------------------------------------------------------------|
| `loadMore()`    | Fetches next page if `hasNextPage && !loading && !refreshing`    |
| `refresh()`     | Resets to page 1, replaces the events array                      |
| `loadEvents(page, reset)` | Core fetch: appends or replaces based on `reset` flag |

**UI structure:**
- `ThemedView` (container) wraps all content
- Header: `ThemedView` with title "Eventos" + subtitle
- Inline error banner (conditional): red left-bordered box with message + "Reintentar" button
- `FlatList` with `onEndReached`, `onEndReachedThreshold={0.3}`, `RefreshControl`
- `ListEmptyComponent`: 5× `EventCardSkeleton` while loading, `EmptyState` when empty
- `ListFooterComponent`: `ActivityIndicator` while loading subsequent pages

### Components

**Reusable UI components used:**

| Component      | File                                 | Key Props                                    |
|----------------|--------------------------------------|----------------------------------------------|
| `ThemedText`   | `src/components/ui/themed-text.tsx`  | `type` ("title", "defaultSemiBold")          |
| `ThemedView`   | `src/components/ui/themed-view.tsx`  | Standard `View` with `backgroundColor: #fff` |
| `EmptyState`   | `src/components/ui/EmptyState.tsx`   | `icon, title, subtitle`                      |
| `Loader`       | `src/components/ui/Loader.tsx`       | `size` ("small") — reused as footer spinner  |

**Domain-specific components:**

| Component          | File                                       | Purpose                                           |
|--------------------|--------------------------------------------|---------------------------------------------------|
| `EventCard`        | `src/components/domain/EventCard.tsx`      | Full card: image, absolute category badge, title, description |
| `EventCardSkeleton`| `src/components/domain/EventCard.tsx`      | Animated pulse placeholder (same card dimensions) |

**EventCard details:**
- Full-width `expo-image` `Image` with `contentFit="cover"` at 200px height
- Category badge: `position: absolute`, `top: 12`, `right: 12` overlaid on image
- Color-coded per category via `CATEGORY_COLORS` map
- Title: `ThemedText type="defaultSemiBold"`, max 2 lines
- Description: 2-line ellipsis, gray (`#687076`), conditional on field presence

**EventCardSkeleton details:**
- Same outer dimensions as `EventCard`
- Gray (`#e0e0e0`) rounded rectangles for image, badge, title, description
- Animated opacity: `0.4 → 1 → 0.4` loop via `Animated.loop` + `Animated.sequence`
- `useNativeDriver: true` — no JS thread involvement

### Services

**Events API calls:**

| Method                       | Endpoint                   | Returns               | Description                  |
|------------------------------|----------------------------|-----------------------|------------------------------|
| `eventsService.list(params)` | `GET /api/v1/events?...`   | `EventsListResponse`  | Paginated list of events     |

**HTTP Client:** `src/services/api.ts`
- Wraps native `fetch` with `Content-Type: application/json`
- Reads auth token from storage and attaches `Authorization: Bearer <token>` when available
- Parses response JSON; on non-2xx, throws `ApiError` with `status`, `message`, and optional `details[]`

### Hook

**File:** `src/hooks/useEvents.ts`

| State field    | Type             | Description                                    |
|----------------|------------------|------------------------------------------------|
| `events`       | `EventSummary[]` | Accumulated results across all loaded pages    |
| `loading`      | `boolean`        | Active during initial load and paginated loads |
| `refreshing`   | `boolean`        | Active during pull-to-refresh                  |
| `error`        | `string \| null` | Last error message, reset on successful fetch  |
| `hasNextPage`  | `boolean`        | Mirrors `pagination.has_next_page` from API    |
| `currentPage`  | `number`         | Tracks the last successfully loaded page       |

**Concurrent-fetch guard:** `useRef<boolean>` (`fetchingRef`) is set to `true` at the start of any fetch and cleared in `finally`. `loadMore()` checks this ref before proceeding, preventing duplicate in-flight requests triggered by rapid `onEndReached` events.

### Types

**File:** `src/types/events.ts`

| Type                  | Description                                                           |
|-----------------------|-----------------------------------------------------------------------|
| `EventCategory`       | Union type: `'sports' \| 'music' \| 'culture' \| 'gastronomy' \| 'wellness' \| 'education' \| 'other'` |
| `EventSummary`        | Full event shape returned by the API: id, title, description, image_url, max_capacity, remaining_capacity, category, date, start_time, end_time, is_active, timestamps |
| `PaginationMeta`      | `{ page, limit, total, total_pages, has_next_page }`                  |
| `EventsListResponse`  | `{ data: EventSummary[], pagination: PaginationMeta }`                |
| `EventsListParams`    | `{ page?, limit?, search?, category? }` — query params for the service |

---

## UI / UX

### Component Tree

```
CustomerEventsScreen
└── ThemedView (container, flex: 1)
    ├── ThemedView (header)
    │   ├── ThemedText type="title"   → "Eventos"
    │   └── ThemedText                → "Explora los eventos disponibles"
    ├── ErrorBanner (conditional: error is set)
    │   ├── ThemedText (red)          → error message
    │   └── TouchableOpacity          → "Reintentar" → refresh()
    └── FlatList
        ├── renderItem                → EventCard (per item)
        ├── ItemSeparatorComponent    → View height: 16
        ├── ListEmptyComponent
        │   ├── (loading)             → 5× EventCardSkeleton
        │   └── (!loading)            → EmptyState icon="📅"
        ├── ListFooterComponent
        │   └── (loading + data > 0)  → ActivityIndicator (small)
        └── refreshControl            → RefreshControl
```

### Visual States

| State               | What the user sees                                                  |
|---------------------|---------------------------------------------------------------------|
| **Initial load**    | 5 skeleton cards with animated gray pulse across the full screen    |
| **Data loaded**     | Stacked large cards: image, category badge (top-right), title, description |
| **Paginating**      | Existing cards visible + footer `ActivityIndicator` at the bottom   |
| **Pull to refresh** | `RefreshControl` spinner, list reloads from page 1                  |
| **No events**       | 📅 icon + "Sin eventos por ahora" + subtitle                        |
| **Error**           | Red left-bordered banner with error message + "Reintentar" button   |

---

## Error Handling

| Error          | Trigger                            | UI Feedback                              |
|----------------|------------------------------------|------------------------------------------|
| Network error  | `fetch` throws `TypeError`         | Red banner with `TypeError.message` + "Reintentar" |
| Server 500     | API returns 5xx                    | Red banner with `ApiError.message` + "Reintentar"  |
| Empty result   | API returns `data: []`             | `EmptyState` component (no banner)       |
| Retry success  | User taps "Reintentar", API recovers | Error banner disappears, cards render   |

---

## Tests

Test suite uses **Feature tests only** — this module has no client-side validators or pure utility functions, so Unit and Browser tiers are not applicable for this release.

### Test File Map

```
tests/
└── Feature/
    └── events/          # 4 files — screen integration tests
```

### Naming Convention

Files follow the pattern: `[TestName][TestType]Test.tsx`

| Test Type | Suffix        | Extension | Example                        |
|-----------|---------------|-----------|--------------------------------|
| Feature   | `FeatureTest` | `.tsx`    | `RenderFeedFeatureTest.tsx`    |

### Feature Tests

**Location:** `tests/Feature/events/`

Render the full `CustomerEventsScreen`. Mock `eventsService.list` to control API responses. Verify UI behavior end-to-end: card rendering, empty state, error banner, and the retry flow.

| File | Scenario | Status |
|------|----------|--------|
| `RenderFeedFeatureTest.tsx` | Header visible; cards show title, description, translated category | PASS |
| `EmptyStateFeatureTest.tsx` | Empty `data: []` → "Sin eventos por ahora" shown, no cards | PASS |
| `NetworkErrorFeatureTest.tsx` | `TypeError` → error banner; "Reintentar" fires second fetch and recovers | PASS |
| `ServerErrorFeatureTest.tsx` | `ApiError` 500/503 → error banner; no cards rendered | PASS |

**Mocks used in every test file:**

| Mock | Reason |
|------|--------|
| `@/src/services/events` | Prevent real HTTP calls; control resolved/rejected values |
| `expo-image` | Native image component not available in Jest environment |
| `expo-secure-store` | Imported transitively by `api.ts` via `storage.ts` |

**Example:**

```tsx
it('should retry the request when Reintentar is pressed', async () => {
  (eventsService.list as jest.Mock)
    .mockRejectedValueOnce(new TypeError('Network request failed'))
    .mockResolvedValueOnce({
      data: [{ id: '1', title: 'Recovered Event', ... }],
      pagination: { page: 1, limit: 20, total: 1, total_pages: 1, has_next_page: false },
    });

  await renderFeedScreen();

  await waitFor(() => {
    expect(screen.getByText('Reintentar')).toBeTruthy();
  });

  fireEvent.press(screen.getByText('Reintentar'));

  await waitFor(() => {
    expect(screen.getByText('Recovered Event')).toBeTruthy();
  });

  expect(eventsService.list).toHaveBeenCalledTimes(2);
});
```

### Running Tests

```bash
# All tests
npm test

# Events feature tests only
npx jest tests/Feature/events/

# Single file
npx jest tests/Feature/events/NetworkErrorFeatureTest

# Watch mode
npx jest --watch tests/Feature/events/
```

**Total:** 4 Feature files — 9 tests passing

---

## Technical Notes

### Design Decisions

- **Isolated data layer**: `src/types/events.ts`, `src/services/events.ts`, and `src/hooks/useEvents.ts` are fully decoupled from the screen. The screen only consumes the hook's public interface (`events`, `loading`, `refreshing`, `error`, `loadMore`, `refresh`), making it trivial to swap the API or add caching later.
- **Concurrent-fetch guard via `useRef`**: `FlatList.onEndReached` can fire multiple times before the first page resolves. A `useRef<boolean>` flag (not `useState`) prevents duplicate requests without triggering re-renders.
- **Skeleton via `ListEmptyComponent`**: Instead of a full-screen spinner that causes layout shift, 5 `EventCardSkeleton` items are rendered in place through `ListEmptyComponent`. This gives the user immediate visual feedback at the same dimensions as real cards.
- **Category badge as absolute overlay**: Placing the badge with `position: absolute` on the image preserves the card's content area for the title and description, maximizing the card real estate on smaller screens.
- **No auth required**: `GET /api/v1/events` is a public endpoint. The `api.get` wrapper adds the Bearer token only when available, so the feed works for both authenticated and unauthenticated users.
- **Spanish UI strings**: All visible text (empty state, error banner, retry button) uses Spanish to match the target audience, consistent with the rest of the app.

### Known Limitations

- Infinite scroll uses `onEndReachedThreshold={0.3}` which may fire earlier than expected on very short lists or when the device's window height exceeds content height. A minimum page size check could be added in a future iteration.
- `EventCard` does not yet have a press handler wired to an event-detail screen — `onPress` is accepted as a prop but the navigation target is pending a follow-up ticket.
- No search or category filter UI is exposed to the user yet. The `eventsService.list` params support them and the hook can be extended, but the filter controls are out of scope for EBM-10.

---

## Changelog

### v1.0.0 — 2026-06-05
- Initial implementation of Events Feed module
- Created `EventSummary`, `PaginationMeta`, `EventsListResponse`, `EventsListParams`, `EventCategory` types
- Created `eventsService.list()` wrapping `api.get` with query string builder
- Implemented `useEvents` hook with pagination, refresh, concurrent-fetch guard
- Created `EventCard` component with absolute category badge and animated `EventCardSkeleton`
- Created reusable `EmptyState` UI component
- Implemented `CustomerEventsScreen` with `FlatList`, infinite scroll, pull-to-refresh, skeleton, and error banner
- Added 4 Feature tests (9 assertions) covering render, empty state, network error + retry, server error

---

## Documentation Checklist

- [x] API contract file linked
- [x] File map reflects all created/modified files
- [x] Component tree shows screen hierarchy
- [x] All visual states documented (initial, loading, data, empty, error)
- [x] Error handling mapped (network, server, empty)
- [x] Test scenarios verified and passing
- [ ] Screenshots added for each visual state
- [x] Design decisions explained
- [x] Known limitations documented
- [x] Changelog updated

---

**Last updated**: `2026-06-05`
**Documented by**: Justin Moreira Matarrita
