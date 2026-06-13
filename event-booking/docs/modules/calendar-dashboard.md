# Module: Calendar Dashboard & Daily Event List

> Admin dashboard featuring an interactive monthly calendar and a chronological list of daily events.

---

## General Information

- **Module Code**: `EBM-02` (dashboard) · `EBM-XX` (admin search)
- **API Contract**: `api-contracts/calendar-events.yaml`, `api-contracts/list-events.yaml`
- **Responsible**: `Fabian Sanchez Salinas`, Abigail Ramírez Chavarría
- **Status**: Completed
- **Version**: `1.2.0`
- **Created**: `2026-06-01`
- **Last Updated**: `2026-06-12`

---

## Description

Primary dashboard for administrators (business roles) located in `app/(admin)`.
It allows users to visualize the venue's schedule through an interactive monthly calendar and a filtered list of events by day in a compact format. It includes month navigation with arrows, a native month/year selector provided by `react-native-ui-datepicker`, dots indicating days with events, compact event cards for quick scanning, and a FAB (+) to create new events.

The header includes a **magnifying glass icon** that opens a dedicated **advanced search screen** (`app/(admin)/search.tsx`) — replicating the customer search pattern. Admins can find events by keyword, single category, or date across the entire catalog, with debounced queries, and tapping a result card navigates to the admin event detail screen.

---

## API Contract

### Calendar dates (dots)

**File:** `api-contracts/calendar-events.yaml`

| Method | Route                        | Auth   | Description                             |
|--------|------------------------------|--------|-----------------------------------------|
| GET    | `/api/v1/events/calendar`    | Yes    | Month dates with event counts           |

**Parameters:**

| Field   | Type    | Required | Constraints     |
|---------|---------|----------|-----------------|
| `year`  | integer | Yes      | 2000 - 2100     |
| `month` | integer | Yes      | 1 - 12          |

**Response (200):**

```json
{
  "data": [
    { "date": "2026-06-15", "count": 3 },
    { "date": "2026-06-20", "count": 2 }
  ],
  "year": 2026,
  "month": 6
}
```

### Events by date

**File:** `api-contracts/list-events.yaml`

| Method | Route                        | Auth   | Description                             |
|--------|------------------------------|--------|-----------------------------------------|
| GET    | `/api/v1/events`             | Yes    | Paginated events, filterable by date    |

**Parameters:**

| Field   | Type    | Required | Default    |
|---------|---------|----------|------------|
| `date`  | string  | No       | None       |
| `page`  | integer | No       | 1          |
| `limit` | integer | No       | 20         |

---

## Architecture

### File Map

```text
event-booking/
├── api-contracts/
│   ├── calendar-events.yaml             # Calendar dots contract
│   └── list-events.yaml                 # Events list contract
├── src/
│   ├── types/
│   │   └── event.ts                     # EventSummary, CalendarDateItem, DayCell, etc.
│   ├── utils/
│   │   └── dateHelpers.ts               # date and time formatting utilities
│   ├── services/
│   │   └── event.ts                     # eventService.getCalendarDates, getEventsByDate
│   ├── hooks/
│   │   └── useCalendarEvents.ts         # calendarLoading, eventsLoading, selectDate
│   ├── components/
│   │   ├── ui/
│   │   │   ├── BottomModal.tsx            # Date picker modal with cancel support
│   │   │   ├── EmptyState.tsx             # EmptyState
│   │   │   ├── ErrorBanner.tsx            # Reusable error banner with retry
│   │   │   ├── JSDatePicker.tsx           # Pure-JS date spinner
│   │   │   ├── ListFooterLoader.tsx       # Reusable pagination loader
│   │   │   ├── SearchHeaderButton.tsx     # Magnifying glass header action
│   │   │   └── SkeletonList.tsx           # Reusable skeleton card list
│   │   └── domain/
│   │       ├── Calendar.tsx               # Calendar component
│   │       └── EventCard.tsx              # Event card (supports "default" and "compact" variants)
│   └── hooks/
│       ├── useCalendarEvents.ts           # Calendar + day events loading
│       └── useEvents.ts                   # Filtered pagination with stale-request guard
├── app/
│   ├── (admin)/
│   │   ├── index.tsx                      # Dashboard screen (calendar + list + FAB)
│   │   ├── search.tsx                     # Admin search screen (keyword + category + date)
│   │   ├── create-event.tsx               # Create event route
│   │   └── _layout.tsx                    # Auth guard (business role) + header actions
├── tests/
│   ├── Unit/dashboard/
│   │   └── DateHelpersUnitTest.ts       # tests for date utilities
│   ├── Feature/dashboard/
│   │   ├── CalendarFeatureTest.tsx      # tests for Calendar component
│   │   └── EventCardFeatureTest.tsx     # tests for EventCard component
│   ├── Feature/events/
│   │   └── AdminSearchFeatureTest.tsx   # tests for admin search screen
│   └── Browser/dashboard/
│       └── DashboardFlowBrowserTest.tsx # tests for dashboard flow
└── docs/modules/
    └── calendar-dashboard.md            # This document
```

### Data Flow

```text
Admin Dashboard Screen (app/(admin)/index.tsx)
    │
    ├──► useCalendarEvents() hook
    │       │
    │       ├──► eventService.getCalendarDates(year, month)
    │       │     └──► GET /api/v1/events/calendar?year=&month=
    │       │           └──► calendarDates: CalendarDateItem[]
    │       │
    │       ├──► eventService.getEventsByDate(date)
    │       │     └──► GET /api/v1/events?date=
    │       │           └──► dayEvents: EventSummary[]
    │       │
    │       └──► State: { calendarDates, dayEvents, selectedDate,
    │                     currentYear, currentMonth, calendarLoading,
    │                     eventsLoading, error, refresh }
    │
    ├──► Calendar component
    │       ├──► DateTimePicker (react-native-ui-datepicker)
    │       │     ├──► Custom Day component (dots, selection, today)
    │       │     ├──► Navigation arrows (prev/next month)
    │       │     └──► Month/Year selector buttons (header)
    │       │
    │       ├──► onMonthChange → useCalendarEvents.onMonthChange(month)
    │       ├──► onYearChange  → useCalendarEvents.onYearChange(year)
    │       └──► onDatePress   → useCalendarEvents.selectDate(date)
    │
    ├──► Event List (Animated.View + ScrollView)
    │       └──► EventCard[] (variant="compact")
    │
    └──► FAB (+) → router.push('/(admin)/create-event')
    │
    └──► Search button (header) → router.push('/(admin)/search')

### Data Flow — Search

```
Admin taps magnifying glass in dashboard header
    │
    ▼
AdminSearchScreen mounts → useEvents({}) loads all events
    │
    ▼
Admin types keyword / selects category / picks date
    │
    ▼
useEffect 300 ms debounce → setDebouncedFilters({ search, category, date })
    │
    ▼
useEvents receives new filters → clears list, resets pagination, loads page 1
    │
    ▼
eventsService.list({ page: 1, limit: 20, search, category, date })
    │
    ▼
api.get('/api/v1/events?page=1&limit=20&search=...&category=...&date=...')
    │
    ▼
┌──────────────────────────────────────────────────────┐
│ 200 OK     → setEvents(data), setHasNextPage(...)    │
│ 500 Error  → setError(ApiError.message)              │
│ Network    → setError('Error al cargar los eventos') │
└──────────────────────────────────────────────────────┘
    │
    ▼
Admin taps EventCard → router.push('/(admin)/events/:id')
```

┌────────────────────────────────────────────────────────┐
│ Loading → Loader message                               │
│ No date selected → EmptyState (ADMIN constant)         │
│ No events for day → EmptyState (ADMIN constant)        │
│ Error → Red banner with error message (ERRORS constant)│
│ Events found → Mapped list of EventCards               │
└────────────────────────────────────────────────────────┘
```

---

## Files

### Screen

**File:** `app/(admin)/index.tsx`

| State          | Description                                               |
|----------------|-----------------------------------------------------------|
| `calendarDates`  | Dates with event counts for the current month              |
| `dayEvents`      | Events for the selected day                               |
| `selectedDate`   | Active date (null if no selection)                        |
| `currentYear`    | Current calendar year                                     |
| `currentMonth`   | Current calendar month (1-12)                             |
| `calendarLoading`| `true` while fetching the month's date map                |
| `eventsLoading`  | `true` while fetching the selected day's events           |
| `error`          | Network or server error message                           |

### Components

**Domain-specific components:**

| Component   | File                                    | Purpose                                      |
|-------------|-----------------------------------------|----------------------------------------------|
| `Calendar`  | `src/components/domain/Calendar.tsx`    | Monthly calendar with month/year selector    |
| `EventCard` | `src/components/domain/EventCard.tsx`   | Event card (supports `compact` variant)      |

### Services

**File:** `src/services/event.ts`

| Method                                | Endpoint                       | Description              |
|---------------------------------------|--------------------------------|--------------------------|
| `eventService.getCalendarDates(y, m)` | `GET /api/v1/events/calendar`  | Month dates with counts  |
| `eventService.getEventsByDate(date)`  | `GET /api/v1/events?date=`     | Events for a specific day|

### Hook

**File:** `src/hooks/useCalendarEvents.ts`

Centralizes the event loading logic for the calendar and the selected day's events. Manages state and mapped errors from `src/constants/ui.ts`.

---

## UI / UX

### Visual States

| State              | What the user sees                                                |
|--------------------|-------------------------------------------------------------------|
| **Initial load**   | Calendar is visible, bottom section shows: "Select a day"         |
| **Calendar loading** | Dates update in the background without blocking the UI           |
| **Day selected**   | Day's events in the bottom list using the compact variant         |
| **Day loading**    | "Loading events..." spinner in the bottom section                 |
| **No events**      | Calendar visible + "No events" EmptyState                         |
| **Error**          | Red banner with an error message                                  |
| **Dots**           | 1-3 blue dots below days with events (max 3 visually)             |
| **Today**          | Blue border around the current day                                |
| **Selected**       | Solid blue background on the selected day                         |
| **Outside month**  | Adjacent month days with 0.3 opacity                              |

### Search Visual States

| State                   | What the user sees                                                    |
|-------------------------|-----------------------------------------------------------------------|
| **Initial (no filters)**| All events loaded, "Todas" chip highlighted, date shows "Cualquier fecha" |
| **Typing**              | Input updates instantly; API call after 300 ms pause                  |
| **Category selected**   | Chip highlights, "Todas" deselects, results filter                    |
| **Date selected**       | Button shows formatted date, clear button appears                     |
| **Loading**             | 4 skeleton cards with animated pulse                                  |
| **Paginating**          | Existing cards + `ListFooterLoader` spinner                           |
| **No events (no filters)**| `FEED_EMPTY_TITLE` / `FEED_EMPTY_SUBTITLE`                          |
| **No matches (filters)**| "Sin coincidencias" / "Intenta cambiar el texto, fecha o categoría." |
| **Error**               | `ErrorBanner` with message + "Reintentar"                             |

---

## Technical Notes

### Design Decisions

- **UI Constants**: All text strings (loading states, errors, empty states) were extracted to `src/constants/ui.ts` (under `ADMIN`, `AUTH`, and `ERRORS`) to maintain a clean and centralized architecture.
- **`react-native-ui-datepicker`**: Chosen for its native support of month/year selectors with animations, arrow navigation, and style customization. The custom `Day` component allows injecting event dots.
- **EventCard Compact Variant**: For the admin dashboard, the event card does not render the large image (`variant="compact"`). Instead, it uses a reduced style with a left sidebar matching the category color to optimize vertical space on mobile screens, ensuring iOS correctly displays the shadow through granular `overflow: 'visible'` control.
- **Auto-Refresh**: The dashboard uses `useFocusEffect` (from `expo-router`) mapped to the hook's `refresh` function. This ensures that when an admin returns from the `create-event` route, the calendar dots and selected day's events are automatically re-fetched.
- **Separated loading states**: `calendarLoading` and `eventsLoading` are independent to avoid blocking the calendar while a single day's events are fetched.
- **In-memory storage fallback**: `storage.ts` supports Web environments via an automatic fallback to `localStorage`, fixing crashes caused by the absence of `ExpoSecureStore` native modules in browsers.
- **Admin search reuses customer components**: The admin search screen (`app/(admin)/search.tsx`) shares the same UI components, hooks, and filter logic as the customer search screen. Only the navigation target differs (`/(admin)/events/[id]` vs `/(customer)/events/[id]`). All shared components — `ErrorBanner`, `SkeletonList`, `ListFooterLoader`, `BottomModal` with cancel — are reused without modification.
- **Debounced search (300 ms)**: Text, category, and date filter changes are batched into a single debounced state update before calling `eventsService.list`, avoiding API flood on every keystroke.
- **Stale-request guard**: The `useEvents` hook uses a monotonic `requestId` counter to discard responses from outdated filter combinations.

### Known Limitations

- **Dots only in current month**: Dots only appear in the currently loaded month. Adjacent months require scrolling/navigation to fetch their data.
- **Events crossing midnight**: The `ck_events_time_range` constraint (`end_time > start_time`) does not allow events to cross 00:00.

---

## Changelog

### v1.2.0 — 2026-06-12 (admin search)
- Added `SearchHeaderButton` to the admin header, next to `LogoutButton`.
- Registered `search` route in admin Stack layout.
- Created `app/(admin)/search.tsx` — advanced search screen with keyword, category, and date filters, reusing shared components and the `useEvents` hook.
- Added `AdminSearchFeatureTest.tsx` with 6 tests covering render, category filter, empty states, and navigation to admin event detail.
- See `docs/modules/events.md` for the shared search architecture (v1.3.0).

### v1.1.1 — 2026-06-12
- Added `refresh` function to `useCalendarEvents`.
- Integrated `useFocusEffect` in the dashboard to automatically update calendar and events upon returning from creation routes.
- Simplified list translation animation (removed `fadeAnim`).

### v1.1.0 — 2026-06-11
- Migrated to `app/(admin)/index.tsx` to align with the route refactor.
- Created specialized `useCalendarEvents` hook.
- Implemented `EventCard` with `variant="compact"`.
- Removed shadows/borders from the calendar for a unified Android/iOS view.
- Fixed shadow visibility on iOS for compact cards.
- Refactored hardcoded texts into `src/constants/ui.ts`.
- Web fallback added in `storage.ts` to fix SecureStore crashes.

### v1.0.0 — 2026-06-06
- Initial implementation of the dashboard with a monthly calendar.
- Event card with dynamic height.
- Native `Calendar` component implemented.

---

**Last updated**: `2026-06-12`
**Documented by**: `Fabian131` & `Antigravity`
