# Module: Calendar Dashboard & Daily Event List

> Admin dashboard featuring an interactive monthly calendar and a chronological list of daily events.

---

## General Information

- **Module Code**: `EBM-02`
- **API Contract**: `api-contracts/calendar-events.yaml`, `api-contracts/list-events.yaml`
- **Responsible**: `Fabian Sanchez Salinas`
- **Status**: Completed
- **Version**: `1.1.0`
- **Created**: `2026-06-01`
- **Last Updated**: `2026-06-11`

---

## Description

Primary dashboard for administrators (business roles) located in `app/(admin)`.
It allows users to visualize the venue's schedule through an interactive monthly calendar and a filtered list of events by day in a compact format. It includes month navigation with arrows, a native month/year selector provided by `react-native-ui-datepicker`, dots indicating days with events, compact event cards for quick scanning, and a FAB (+) to create new events.

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
│   │   │   └── EmptyState.tsx           # EmptyState + LoadingState
│   │   └── domain/
│   │       ├── Calendar.tsx             # Calendar component (DateTimePicker wrapper)
│   │       └── EventCard.tsx            # Event card (supports "default" and "compact" variants)
│   └── config/
│       └── api.ts                       # API base URL
├── app/
│   ├── (admin)/
│   │   ├── index.tsx                    # Dashboard screen (calendar + list + FAB)
│   │   ├── create-event.tsx             # Create event route
│   │   └── _layout.tsx                  # Auth guard (business role)
├── tests/
│   ├── Unit/dashboard/
│   │   └── DateHelpersUnitTest.ts       # tests for date utilities
│   ├── Feature/dashboard/
│   │   ├── CalendarFeatureTest.tsx      # tests for Calendar component
│   │   └── EventCardFeatureTest.tsx     # tests for EventCard component
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
    │                     eventsLoading, error }
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

---

## Technical Notes

### Design Decisions

- **UI Constants**: All text strings (loading states, errors, empty states) were extracted to `src/constants/ui.ts` (under `ADMIN`, `AUTH`, and `ERRORS`) to maintain a clean and centralized architecture.
- **`react-native-ui-datepicker`**: Chosen for its native support of month/year selectors with animations, arrow navigation, and style customization. The custom `Day` component allows injecting event dots.
- **EventCard Compact Variant**: For the admin dashboard, the event card does not render the large image (`variant="compact"`). Instead, it uses a reduced style with a left sidebar matching the category color to optimize vertical space on mobile screens, ensuring iOS correctly displays the shadow through granular `overflow: 'visible'` control.
- **Separated loading states**: `calendarLoading` and `eventsLoading` are independent to avoid blocking the calendar while a single day's events are fetched.
- **In-memory storage fallback**: `storage.ts` supports Web environments via an automatic fallback to `localStorage`, fixing crashes caused by the absence of `ExpoSecureStore` native modules in browsers.

### Known Limitations

- **Dots only in current month**: Dots only appear in the currently loaded month. Adjacent months require scrolling/navigation to fetch their data.
- **Events crossing midnight**: The `ck_events_time_range` constraint (`end_time > start_time`) does not allow events to cross 00:00.

---

## Changelog

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

**Last updated**: `2026-06-11`
**Documented by**: `Fabian131` & `Antigravity`
