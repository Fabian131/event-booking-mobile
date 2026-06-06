# Module: Calendar Dashboard & Daily Event List

> Panel administrativo con calendario mensual interactivo y lista cronológica de eventos diarios.

---

## General Information

- **Module Code**: `EBM-02`
- **API Contract**: `api-contracts/calendar-events.yaml`, `api-contracts/list-events.yaml`
- **Responsible**: `Fabian131`
- **Status**: In Development
- **Version**: `1.0.0`
- **Created**: `2026-06-01`
- **Last Updated**: `2026-06-06`

---

## Description

Dashboard principal para usuarios de negocio (EBM-09/EBM-10) que permite visualizar la
agenda del venue mediante un calendario mensual interactivo y una lista filtrada de
eventos por día. Incluye navegación entre meses con flechas, selector nativo de mes/año
provisto por `react-native-ui-datepicker`, dots indicadores en días con eventos, tarjetas
de evento con altura dinámica proporcional a la duración, y un FAB (+) para crear nuevos
eventos.

---

## API Contract

### Calendar dates (dots)

**File:** `api-contracts/calendar-events.yaml`

| Method | Route                        | Auth   | Description                             |
|--------|------------------------------|--------|-----------------------------------------|
| GET    | `/api/v1/events/calendar`    | Yes    | Fechas del mes con conteo de eventos    |

**Parámetros:**

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
| GET    | `/api/v1/events`             | Yes    | Eventos paginados, filtrables por fecha |

**Parámetros:**

| Field   | Type    | Required | Default    |
|---------|---------|----------|------------|
| `date`  | string  | No       | None       |
| `page`  | integer | No       | 1          |
| `limit` | integer | No       | 20         |

**Response (200):**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Futbol 7 - Torneo",
      "description": "Torneo de futbol 7 categoría libre",
      "image_url": null,
      "max_capacity": 30,
      "remaining_capacity": 28,
      "category": "sports",
      "date": "2026-06-15",
      "start_time": "09:00",
      "end_time": "12:00",
      "is_active": true
    }
  ],
  "pagination": {
    "page": 1, "limit": 20, "total": 12,
    "total_pages": 1, "has_next_page": false
  }
}
```

---

## Architecture

### File Map

```
event-booking/
├── api-contracts/
│   ├── calendar-events.yaml             # Calendar dots contract
│   └── list-events.yaml                 # Events list contract
├── src/
│   ├── types/
│   │   └── event.ts                     # EventSummary, CalendarDateItem, DayCell, etc.
│   ├── utils/
│   │   └── dateHelpers.ts              # buildMonthGrid, getMonthName, formatTime
│   ├── services/
│   │   └── event.ts                     # eventService.getCalendarDates, getEventsByDate
│   ├── hooks/
│   │   └── useEvents.ts                 # calendarLoading, eventsLoading, selectDate
│   ├── components/
│   │   ├── ui/
│   │   │   └── EmptyState.tsx          # EmptyState + LoadingState
│   │   └── domain/
│   │       ├── Calendar.tsx            # Calendar component (DateTimePicker wrapper)
│   │       └── EventCard.tsx           # Event card with dynamic time slots
│   └── config/
│       └── api.ts                       # API base URL
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx                    # Dashboard screen (calendar + list + FAB)
│   │   └── create-event.tsx            # Create event stub route
│   └── _layout.tsx                      # Auth guard (business role)
├── tests/
│   ├── Unit/dashboard/
│   │   └── DateHelpersUnitTest.ts      # 13 tests for date utilities
│   ├── Feature/dashboard/
│   │   ├── CalendarFeatureTest.tsx     # 5 tests for Calendar component
│   │   └── EventCardFeatureTest.tsx    # 6 tests for EventCard component
│   └── Browser/dashboard/
│       └── DashboardFlowBrowserTest.tsx # 3 tests for dashboard flow
└── docs/modules/
    └── calendar-dashboard.md            # This document
```

**Backend (event-booking-api):**

```
event-booking-api/
├── Contracts/
│   └── calendar-events.yaml             # Source API contract
├── app/
│   ├── api/v1/
│   │   └── events.py                    # GET /events/calendar endpoint
│   ├── repositories/
│   │   └── event_repository.py          # get_calendar_dates() with GROUP BY
│   ├── services/
│   │   └── event_service.py             # list_calendar_dates()
│   └── schemas/
│       └── event.py                     # CalendarDateItem, CalendarDatesResponse
└── tests/
    └── test_events.py                   # 4 tests for calendar endpoint
```

### Data Flow

```
Dashboard Screen (app/(tabs)/index.tsx)
    │
    ├──► useEvents() hook
    │       │
    │       ├── eventService.getCalendarDates(year, month)
    │       │     └──► GET /api/v1/events/calendar?year=&month=
    │       │           └──► calendarDates: CalendarDateItem[]
    │       │
    │       ├── eventService.getEventsByDate(date)
    │       │     └──► GET /api/v1/events?date=
    │       │           └──► dayEvents: EventSummary[]
    │       │
    │       └── State: { calendarDates, dayEvents, selectedDate,
    │                     currentYear, currentMonth, calendarLoading,
    │                     eventsLoading, error }
    │
    ├──► Calendar component
    │       ├── DateTimePicker (react-native-ui-datepicker)
    │       │     ├── Custom Day component (dots, selection, today)
    │       │     ├── Navigation arrows (prev/next month)
    │       │     └── Month/Year selector buttons (header)
    │       │
    │       ├── onMonthChange → useEvents.onMonthChange(month)
    │       ├── onYearChange  → useEvents.onYearChange(year)
    │       └── onDatePress   → useEvents.selectDate(date)
    │
    ├──► Event List (FlatList)
    │       └── EventCard[] with dynamic height per duration
    │
    └──► FAB (+) → router.push('/(tabs)/create-event')

┌────────────────────────────────────────────────┐
│ Loading → LoadingState overlay en ambas secciones │
│ No date selected → EmptyState "Selecciona un día" │
│ No events for day → EmptyState "Sin eventos"       │
│ Error → Banner rojo con mensaje                    │
│ Events found → FlatList de EventCard               │
└────────────────────────────────────────────────┘
```

---

## Files

### Screen

**File:** `app/(tabs)/index.tsx`

| State          | Description                                               |
|----------------|-----------------------------------------------------------|
| `calendarDates`  | Fechas con conteo de eventos del mes actual              |
| `dayEvents`      | Eventos del día seleccionado                              |
| `selectedDate`   | Fecha activa (null si no hay selección)                   |
| `currentYear`    | Año actual del calendario                                 |
| `currentMonth`   | Mes actual del calendario (1-12)                          |
| `calendarLoading`| `true` mientras carga el mapa de fechas del mes           |
| `eventsLoading`  | `true` mientras carga los eventos del día seleccionado    |
| `error`          | Mensaje de error de red o servidor                        |

**Functions:**

| Function            | Description                                          |
|---------------------|------------------------------------------------------|
| `selectDate(date)`  | Selecciona un día y dispara la carga de eventos      |
| `onMonthChange(m)`  | Cambia de mes y recarga fechas del calendario        |
| `onYearChange(y)`   | Cambia de año y recarga fechas del calendario        |

### Components

**Reusable UI components used:**

| Component     | File                               | Props                                                |
|---------------|------------------------------------|------------------------------------------------------|
| `ThemedText`  | `src/components/ui/themed-text.tsx`| `type`, `style`                                      |
| `ThemedView`  | `src/components/ui/themed-view.tsx`| `style`                                              |
| `EmptyState`  | `src/components/ui/EmptyState.tsx` | `title`, `message`                                   |
| `LoadingState`| `src/components/ui/EmptyState.tsx` | `message`                                            |

**Domain-specific components:**

| Component   | File                                    | Purpose                                      |
|-------------|-----------------------------------------|----------------------------------------------|
| `Calendar`  | `src/components/domain/Calendar.tsx`    | Calendario mensual con selector mes/año     |
| `EventCard` | `src/components/domain/EventCard.tsx`   | Tarjeta con altura dinámica por duración    |

### Services

**File:** `src/services/event.ts`

| Method                                | Endpoint                       | Description              |
|---------------------------------------|--------------------------------|--------------------------|
| `eventService.getCalendarDates(y, m)` | `GET /api/v1/events/calendar`  | Fechas del mes con conteo|
| `eventService.getEventsByDate(date)`  | `GET /api/v1/events?date=`     | Eventos de un día        |

**HTTP Client:** `src/services/api.ts`
- Wraps native `fetch` con serialización JSON
- Adjunta `Authorization: Bearer <token>`
- Lanza `ApiError` con `status` y `details` en respuestas no-2xx

### Hook

**File:** `src/hooks/useEvents.ts`

| State Variable     | Type               | Description                               |
|--------------------|--------------------|-------------------------------------------|
| `calendarDates`    | `CalendarDateItem[]` | Fechas con eventos del mes             |
| `dayEvents`        | `EventSummary[]`     | Eventos del día seleccionado            |
| `selectedDate`     | `string \| null`     | Fecha activa                            |
| `currentYear`      | `number`             | Año actual del calendario               |
| `currentMonth`     | `number`             | Mes actual (1-12)                       |
| `calendarLoading`  | `boolean`            | Carga del calendario                    |
| `eventsLoading`    | `boolean`            | Carga de eventos del día                |
| `error`            | `string \| null`     | Error de API                            |

**Functions:**

| Function            | Description                                        |
|---------------------|---------------------------------------------------|
| `selectDate(date)`  | Activa una fecha y carga sus eventos              |
| `onMonthChange(m)`  | Cambia el mes activo y recarga fechas            |
| `onYearChange(y)`   | Cambia el año activo y recarga fechas            |

### Types

**File:** `src/types/event.ts`

| Type                     | Description                                        |
|--------------------------|---------------------------------------------------|
| `EventSummary`           | Datos de evento para la lista (id, title, category, etc.) |
| `CalendarDateItem`       | `{ date: string, count: number }` generado por la API     |
| `CalendarDatesResponse`  | `{ data: CalendarDateItem[], year, month }`               |
| `DayCell`                | Celda del grid: `{ date, day, isCurrentMonth, isToday, isSelected, eventCount }` |
| `PaginatedEventsResponse`| `{ data: EventSummary[], pagination }`                    |

### Utils

**File:** `src/utils/dateHelpers.ts`

| Function                        | Description                                         |
|---------------------------------|-----------------------------------------------------|
| `buildMonthGrid(y, m, map, sd)`| Construye las 42 celdas del mes (6 filas x 7 cols)  |
| `getMonthName(month)`           | Nombre en español (Enero-Diciembre)                 |
| `getDayNames()`                 | Array `['L','M','X','J','V','S','D']`               |
| `formatTime(timeStr)`           | "14:30" → "2:30 PM"                                 |
| `getSlotHeight(start, end)`     | Altura en px proporcional a duración                |
| `getPreviousMonth(y, m)`        | Mes y año anterior                                  |
| `getNextMonth(y, m)`            | Mes y año siguiente                                 |

---

## UI / UX

### Component Tree

```
AdminCalendarScreen (app/(tabs)/index.tsx)
├── Header
│   ├── ThemedText "Calendario"
│   └── ThemedText "Consulta la disponibilidad de eventos"
├── Calendar
│   └── DateTimePicker (react-native-ui-datepicker)
│       ├── Header
│       │   ├── PrevButton (‹)
│       │   ├── MonthSelector (tappable → abre meses)
│       │   ├── YearSelector (tappable → abre años)
│       │   └── NextButton (›)
│       ├── Weekdays Row (L M X J V S D)
│       └── DayGrid (6x7)
│           └── CustomDay
│               ├── Circle (selected/today/outside)
│               └── DotsRow (0-3 dots azules)
├── Divider
├── Bottom Section
│   ├── [no date] → EmptyState "Selecciona un día"
│   ├── [loading] → LoadingState "Cargando eventos..."
│   ├── [error]   → ErrorBanner rojo
│   ├── [empty]   → EmptyState "Sin eventos"
│   └── [data]    → FlatList de EventCard
│       └── EventCard
│           ├── Category color indicator (barra izquierda)
│           ├── Title + Description
│           ├── Capacity badge (capacidad restante)
│           └── Time slot (altura dinámica)
└── FAB (+) → navigate to /create-event
```

### Visual States

| State              | What the user sees                                                |
|--------------------|-------------------------------------------------------------------|
| **Initial load**   | Calendario visible, sección inferior: "Selecciona un día"         |
| **Calendar loading** | Fechas se actualizan en background, sin bloqueo de UI            |
| **Day selected**   | Eventos del día en la lista inferior con alturas dinámicas       |
| **Day loading**    | Spinner "Cargando eventos..." en la sección inferior              |
| **No events**      | Calendario visible + EmptyState "Sin eventos"                     |
| **Error**          | Banner rojo con mensaje de error                                  |
| **Dots**           | 1-3 dots azules debajo de días con eventos (máx 3 visuales)      |
| **Today**          | Borde azul en el día actual                                       |
| **Selected**       | Fondo azul sólido en el día seleccionado                          |
| **Outside month**  | Días de meses adyacentes con opacidad 0.3                         |

---

## Error Handling

### Client-Side

| Error                                    | Trigger                            |
|------------------------------------------|------------------------------------|
| "Selecciona un día"                      | No hay `selectedDate`              |
| "Sin eventos"                            | `dayEvents.length === 0`           |

### Server-Side

| Status   | API Response            | UI Mapping                            |
|----------|-------------------------|---------------------------------------|
| 422      | Validation error        | Toast con mensaje de validación       |
| 401      | Not authenticated       | Redirect a login                      |
| 500      | Internal server error   | Banner rojo: `message` del API        |
| Network  | `TypeError` de `fetch`  | Banner rojo: "No se pudo conectar..." |

---

## Test Scenarios

| Scenario                                           | Expected Result                                       |
|-----------------------------------------------------|-------------------------------------------------------|
| Render dashboard                                    | Header, Calendar, FAB visibles                        |
| No date selected                                    | "Selecciona un día" visible en sección inferior       |
| Select a day with events                            | FlatList muestra `EventCard` por cada evento          |
| Select a day without events                         | EmptyState "Sin eventos" visible                      |
| Calendar loading is true                            | "Cargando..." overlay sobre el calendario             |
| Month change triggers `onMonthChange`               | Se recargan `calendarDates` para el nuevo mes         |
| Year change triggers `onYearChange`                 | Se recargan fechas para el nuevo año                  |
| Days with events show dots                          | Dots azules visibles en días con `count > 0`          |
| EventCard height proportional to duration           | Eventos de 3h ocupan más espacio que eventos de 1h    |
| FAB navigates to create-event                       | `router.push(/(tabs)/create-event)`                   |
| API returns error                                   | Banner rojo con mensaje de error                      |
| Weekday headers in Spanish                          | L, M, X, J, V, S, D visibles                          |
| Month name in Spanish                               | "Junio 2026" en header                                |
| Today date has border highlight                     | Borde azul alrededor del día actual                   |

**Test suites:** 4 suites / 32 tests (`DateHelpersUnitTest` 13, `CalendarFeatureTest` 7, `EventCardFeatureTest` 6, `DashboardFlowBrowserTest` 3)

---

## Technical Notes

### Design Decisions

- **`react-native-ui-datepicker`**: Se eligió esta librería por su soporte nativo de selectores de mes/año con animaciones, navegación con flechas, y personalización de estilos. El componente `Day` custom permite inyectar los dots de eventos sin reimplementar la lógica del calendario.
- **Loading states separados**: `calendarLoading` y `eventsLoading` son independientes para no bloquear el calendario mientras se cargan los eventos de un día. El calendario solo muestra overlay en la carga inicial, no en cada selección.
- **Altura dinámica en EventCard**: `getSlotHeight(startTime, endTime)` calcula la altura proporcional a la duración real del evento basado en 60px por hora, con un mínimo de 30px.
- **Dots de eventos**: Se muestran máximo 3 dots por día (azul #0a7ea4) para mantener la legibilidad del grid. El `event_count` real puede ser mayor.
- **Separación de concerns**: El hook `useEvents` centraliza toda la lógica de fetching y estado, el componente `Calendar` solo maneja presentación, y `EventCard` es puramente visual.
- **In-memory storage fallback**: `storage.ts` usa un `Map` en memoria como fallback cuando `expo-secure-store` no está disponible (web, entornos sin módulo nativo), evitando crashes.

### Known Limitations

- **Dots solo en mes actual**: Los dots solo aparecen en el mes actual cargado. Meses adyacentes requieren scroll/navegación para cargar sus datos.
- **Eventos que cruzan medianoche**: La constraint `ck_events_time_range` (`end_time > start_time`) no permite eventos que crucen las 00:00. Los eventos nocturnos deben tener `end_time` antes de medianoche.
- **Selector mes/año nativo**: El selector de meses/años usa el componente nativo de `react-native-ui-datepicker`, cuyo diseño depende de la librería. La personalización está limitada a los estilos expuestos.
- **Sin swipe horizontal**: La navegación entre meses se hace con flechas, no con gestos swipe. Pendiente evaluar si `react-native-ui-datepicker` soporta swipe en futuras versiones.

---

## Changelog

### v1.0.0 — 2026-06-06
- Implementación inicial del dashboard con calendario mensual
- Componente `Calendar` con selector nativo de mes/año y dots de eventos
- Componente `EventCard` con altura dinámica por duración
- Hook `useEvents` con estados de carga separados
- Servicio `eventService` con `getCalendarDates` y `getEventsByDate`
- `EmptyState` y `LoadingState` reutilizables
- FAB para crear eventos (ruta stub)
- Backend: endpoint `GET /events/calendar` con GROUP BY por fecha
- Backend: contrato `calendar-events.yaml` sync CI a frontend
- Tests: 4 suites / 32 tests (Unit, Feature, Browser)

---

## Documentation Checklist

Before considering this document complete:

- [x] API contract file linked
- [x] File map reflects all created/modified files
- [x] Component tree shows screen hierarchy
- [x] All visual states documented (initial, error, loading, success)
- [x] All error messages mapped (client + server)
- [x] Test scenarios verified and passing
- [ ] Screenshots added for each visual state
- [x] Design decisions explained
- [x] Changelog updated

---

**Last updated**: `2026-06-06`
**Documented by**: `Fabian131`
