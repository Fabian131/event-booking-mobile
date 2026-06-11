# Module: Calendar Dashboard & Daily Event List

> Panel administrativo con calendario mensual interactivo y lista cronol├│gica de eventos diarios.

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
eventos por d├¡a. Incluye navegaci├│n entre meses con flechas, selector nativo de mes/a├▒o
provisto por `react-native-ui-datepicker`, dots indicadores en d├¡as con eventos, tarjetas
de evento con altura din├ímica proporcional a la duraci├│n, y un FAB (+) para crear nuevos
eventos.

---

## API Contract

### Calendar dates (dots)

**File:** `api-contracts/calendar-events.yaml`

| Method | Route                        | Auth   | Description                             |
|--------|------------------------------|--------|-----------------------------------------|
| GET    | `/api/v1/events/calendar`    | Yes    | Fechas del mes con conteo de eventos    |

**Par├ímetros:**

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

**Par├ímetros:**

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
      "description": "Torneo de futbol 7 categor├¡a libre",
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
Γö£ΓöÇΓöÇ api-contracts/
Γöé   Γö£ΓöÇΓöÇ calendar-events.yaml             # Calendar dots contract
Γöé   ΓööΓöÇΓöÇ list-events.yaml                 # Events list contract
Γö£ΓöÇΓöÇ src/
Γöé   Γö£ΓöÇΓöÇ types/
Γöé   Γöé   ΓööΓöÇΓöÇ event.ts                     # EventSummary, CalendarDateItem, DayCell, etc.
Γöé   Γö£ΓöÇΓöÇ utils/
Γöé   Γöé   ΓööΓöÇΓöÇ dateHelpers.ts              # buildMonthGrid, getMonthName, formatTime
Γöé   Γö£ΓöÇΓöÇ services/
Γöé   Γöé   ΓööΓöÇΓöÇ event.ts                     # eventService.getCalendarDates, getEventsByDate
Γöé   Γö£ΓöÇΓöÇ hooks/
Γöé   Γöé   ΓööΓöÇΓöÇ useEvents.ts                 # calendarLoading, eventsLoading, selectDate
Γöé   Γö£ΓöÇΓöÇ components/
Γöé   Γöé   Γö£ΓöÇΓöÇ ui/
Γöé   Γöé   Γöé   ΓööΓöÇΓöÇ EmptyState.tsx          # EmptyState + LoadingState
Γöé   Γöé   ΓööΓöÇΓöÇ domain/
Γöé   Γöé       Γö£ΓöÇΓöÇ Calendar.tsx            # Calendar component (DateTimePicker wrapper)
Γöé   Γöé       ΓööΓöÇΓöÇ EventCard.tsx           # Event card with dynamic time slots
Γöé   ΓööΓöÇΓöÇ config/
Γöé       ΓööΓöÇΓöÇ api.ts                       # API base URL
Γö£ΓöÇΓöÇ app/
Γöé   Γö£ΓöÇΓöÇ (tabs)/
Γöé   Γöé   Γö£ΓöÇΓöÇ index.tsx                    # Dashboard screen (calendar + list + FAB)
Γöé   Γöé   ΓööΓöÇΓöÇ create-event.tsx            # Create event stub route
Γöé   ΓööΓöÇΓöÇ _layout.tsx                      # Auth guard (business role)
Γö£ΓöÇΓöÇ tests/
Γöé   Γö£ΓöÇΓöÇ Unit/dashboard/
Γöé   Γöé   ΓööΓöÇΓöÇ DateHelpersUnitTest.ts      # 13 tests for date utilities
Γöé   Γö£ΓöÇΓöÇ Feature/dashboard/
Γöé   Γöé   Γö£ΓöÇΓöÇ CalendarFeatureTest.tsx     # 5 tests for Calendar component
Γöé   Γöé   ΓööΓöÇΓöÇ EventCardFeatureTest.tsx    # 6 tests for EventCard component
Γöé   ΓööΓöÇΓöÇ Browser/dashboard/
Γöé       ΓööΓöÇΓöÇ DashboardFlowBrowserTest.tsx # 3 tests for dashboard flow
ΓööΓöÇΓöÇ docs/modules/
    ΓööΓöÇΓöÇ calendar-dashboard.md            # This document
```

**Backend (event-booking-api):**

```
event-booking-api/
Γö£ΓöÇΓöÇ Contracts/
Γöé   ΓööΓöÇΓöÇ calendar-events.yaml             # Source API contract
Γö£ΓöÇΓöÇ app/
Γöé   Γö£ΓöÇΓöÇ api/v1/
Γöé   Γöé   ΓööΓöÇΓöÇ events.py                    # GET /events/calendar endpoint
Γöé   Γö£ΓöÇΓöÇ repositories/
Γöé   Γöé   ΓööΓöÇΓöÇ event_repository.py          # get_calendar_dates() with GROUP BY
Γöé   Γö£ΓöÇΓöÇ services/
Γöé   Γöé   ΓööΓöÇΓöÇ event_service.py             # list_calendar_dates()
Γöé   ΓööΓöÇΓöÇ schemas/
Γöé       ΓööΓöÇΓöÇ event.py                     # CalendarDateItem, CalendarDatesResponse
ΓööΓöÇΓöÇ tests/
    ΓööΓöÇΓöÇ test_events.py                   # 4 tests for calendar endpoint
```

### Data Flow

```
Dashboard Screen (app/(tabs)/index.tsx)
    Γöé
    Γö£ΓöÇΓöÇΓû║ useEvents() hook
    Γöé       Γöé
    Γöé       Γö£ΓöÇΓöÇ eventService.getCalendarDates(year, month)
    Γöé       Γöé     ΓööΓöÇΓöÇΓû║ GET /api/v1/events/calendar?year=&month=
    Γöé       Γöé           ΓööΓöÇΓöÇΓû║ calendarDates: CalendarDateItem[]
    Γöé       Γöé
    Γöé       Γö£ΓöÇΓöÇ eventService.getEventsByDate(date)
    Γöé       Γöé     ΓööΓöÇΓöÇΓû║ GET /api/v1/events?date=
    Γöé       Γöé           ΓööΓöÇΓöÇΓû║ dayEvents: EventSummary[]
    Γöé       Γöé
    Γöé       ΓööΓöÇΓöÇ State: { calendarDates, dayEvents, selectedDate,
    Γöé                     currentYear, currentMonth, calendarLoading,
    Γöé                     eventsLoading, error }
    Γöé
    Γö£ΓöÇΓöÇΓû║ Calendar component
    Γöé       Γö£ΓöÇΓöÇ DateTimePicker (react-native-ui-datepicker)
    Γöé       Γöé     Γö£ΓöÇΓöÇ Custom Day component (dots, selection, today)
    Γöé       Γöé     Γö£ΓöÇΓöÇ Navigation arrows (prev/next month)
    Γöé       Γöé     ΓööΓöÇΓöÇ Month/Year selector buttons (header)
    Γöé       Γöé
    Γöé       Γö£ΓöÇΓöÇ onMonthChange ΓåÆ useEvents.onMonthChange(month)
    Γöé       Γö£ΓöÇΓöÇ onYearChange  ΓåÆ useEvents.onYearChange(year)
    Γöé       ΓööΓöÇΓöÇ onDatePress   ΓåÆ useEvents.selectDate(date)
    Γöé
    Γö£ΓöÇΓöÇΓû║ Event List (FlatList)
    Γöé       ΓööΓöÇΓöÇ EventCard[] with dynamic height per duration
    Γöé
    ΓööΓöÇΓöÇΓû║ FAB (+) ΓåÆ router.push('/(tabs)/create-event')

ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
Γöé Loading ΓåÆ LoadingState overlay en ambas secciones Γöé
Γöé No date selected ΓåÆ EmptyState "Selecciona un d├¡a" Γöé
Γöé No events for day ΓåÆ EmptyState "Sin eventos"       Γöé
Γöé Error ΓåÆ Banner rojo con mensaje                    Γöé
Γöé Events found ΓåÆ FlatList de EventCard               Γöé
ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
```

---

## Files

### Screen

**File:** `app/(tabs)/index.tsx`

| State          | Description                                               |
|----------------|-----------------------------------------------------------|
| `calendarDates`  | Fechas con conteo de eventos del mes actual              |
| `dayEvents`      | Eventos del d├¡a seleccionado                              |
| `selectedDate`   | Fecha activa (null si no hay selecci├│n)                   |
| `currentYear`    | A├▒o actual del calendario                                 |
| `currentMonth`   | Mes actual del calendario (1-12)                          |
| `calendarLoading`| `true` mientras carga el mapa de fechas del mes           |
| `eventsLoading`  | `true` mientras carga los eventos del d├¡a seleccionado    |
| `error`          | Mensaje de error de red o servidor                        |

**Functions:**

| Function            | Description                                          |
|---------------------|------------------------------------------------------|
| `selectDate(date)`  | Selecciona un d├¡a y dispara la carga de eventos      |
| `onMonthChange(m)`  | Cambia de mes y recarga fechas del calendario        |
| `onYearChange(y)`   | Cambia de a├▒o y recarga fechas del calendario        |

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
| `Calendar`  | `src/components/domain/Calendar.tsx`    | Calendario mensual con selector mes/a├▒o     |
| `EventCard` | `src/components/domain/EventCard.tsx`   | Tarjeta con altura din├ímica por duraci├│n    |

### Services

**File:** `src/services/event.ts`

| Method                                | Endpoint                       | Description              |
|---------------------------------------|--------------------------------|--------------------------|
| `eventService.getCalendarDates(y, m)` | `GET /api/v1/events/calendar`  | Fechas del mes con conteo|
| `eventService.getEventsByDate(date)`  | `GET /api/v1/events?date=`     | Eventos de un d├¡a        |

**HTTP Client:** `src/services/api.ts`
- Wraps native `fetch` con serializaci├│n JSON
- Adjunta `Authorization: Bearer <token>`
- Lanza `ApiError` con `status` y `details` en respuestas no-2xx

### Hook

**File:** `src/hooks/useEvents.ts`

| State Variable     | Type               | Description                               |
|--------------------|--------------------|-------------------------------------------|
| `calendarDates`    | `CalendarDateItem[]` | Fechas con eventos del mes             |
| `dayEvents`        | `EventSummary[]`     | Eventos del d├¡a seleccionado            |
| `selectedDate`     | `string \| null`     | Fecha activa                            |
| `currentYear`      | `number`             | A├▒o actual del calendario               |
| `currentMonth`     | `number`             | Mes actual (1-12)                       |
| `calendarLoading`  | `boolean`            | Carga del calendario                    |
| `eventsLoading`    | `boolean`            | Carga de eventos del d├¡a                |
| `error`            | `string \| null`     | Error de API                            |

**Functions:**

| Function            | Description                                        |
|---------------------|---------------------------------------------------|
| `selectDate(date)`  | Activa una fecha y carga sus eventos              |
| `onMonthChange(m)`  | Cambia el mes activo y recarga fechas            |
| `onYearChange(y)`   | Cambia el a├▒o activo y recarga fechas            |

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
| `getMonthName(month)`           | Nombre en espa├▒ol (Enero-Diciembre)                 |
| `getDayNames()`                 | Array `['L','M','X','J','V','S','D']`               |
| `formatTime(timeStr)`           | "14:30" ΓåÆ "2:30 PM"                                 |
| `getSlotHeight(start, end)`     | Altura en px proporcional a duraci├│n                |
| `getPreviousMonth(y, m)`        | Mes y a├▒o anterior                                  |
| `getNextMonth(y, m)`            | Mes y a├▒o siguiente                                 |

---

## UI / UX

### Component Tree

```
AdminCalendarScreen (app/(tabs)/index.tsx)
Γö£ΓöÇΓöÇ Header
Γöé   Γö£ΓöÇΓöÇ ThemedText "Calendario"
Γöé   ΓööΓöÇΓöÇ ThemedText "Consulta la disponibilidad de eventos"
Γö£ΓöÇΓöÇ Calendar
Γöé   ΓööΓöÇΓöÇ DateTimePicker (react-native-ui-datepicker)
Γöé       Γö£ΓöÇΓöÇ Header
Γöé       Γöé   Γö£ΓöÇΓöÇ PrevButton (ΓÇ╣)
Γöé       Γöé   Γö£ΓöÇΓöÇ MonthSelector (tappable ΓåÆ abre meses)
Γöé       Γöé   Γö£ΓöÇΓöÇ YearSelector (tappable ΓåÆ abre a├▒os)
Γöé       Γöé   ΓööΓöÇΓöÇ NextButton (ΓÇ║)
Γöé       Γö£ΓöÇΓöÇ Weekdays Row (L M X J V S D)
Γöé       ΓööΓöÇΓöÇ DayGrid (6x7)
Γöé           ΓööΓöÇΓöÇ CustomDay
Γöé               Γö£ΓöÇΓöÇ Circle (selected/today/outside)
Γöé               ΓööΓöÇΓöÇ DotsRow (0-3 dots azules)
Γö£ΓöÇΓöÇ Divider
Γö£ΓöÇΓöÇ Bottom Section
Γöé   Γö£ΓöÇΓöÇ [no date] ΓåÆ EmptyState "Selecciona un d├¡a"
Γöé   Γö£ΓöÇΓöÇ [loading] ΓåÆ LoadingState "Cargando eventos..."
Γöé   Γö£ΓöÇΓöÇ [error]   ΓåÆ ErrorBanner rojo
Γöé   Γö£ΓöÇΓöÇ [empty]   ΓåÆ EmptyState "Sin eventos"
Γöé   ΓööΓöÇΓöÇ [data]    ΓåÆ FlatList de EventCard
Γöé       ΓööΓöÇΓöÇ EventCard
Γöé           Γö£ΓöÇΓöÇ Category color indicator (barra izquierda)
Γöé           Γö£ΓöÇΓöÇ Title + Description
Γöé           Γö£ΓöÇΓöÇ Capacity badge (capacidad restante)
Γöé           ΓööΓöÇΓöÇ Time slot (altura din├ímica)
ΓööΓöÇΓöÇ FAB (+) ΓåÆ navigate to /create-event
```

### Visual States

| State              | What the user sees                                                |
|--------------------|-------------------------------------------------------------------|
| **Initial load**   | Calendario visible, secci├│n inferior: "Selecciona un d├¡a"         |
| **Calendar loading** | Fechas se actualizan en background, sin bloqueo de UI            |
| **Day selected**   | Eventos del d├¡a en la lista inferior con alturas din├ímicas       |
| **Day loading**    | Spinner "Cargando eventos..." en la secci├│n inferior              |
| **No events**      | Calendario visible + EmptyState "Sin eventos"                     |
| **Error**          | Banner rojo con mensaje de error                                  |
| **Dots**           | 1-3 dots azules debajo de d├¡as con eventos (m├íx 3 visuales)      |
| **Today**          | Borde azul en el d├¡a actual                                       |
| **Selected**       | Fondo azul s├│lido en el d├¡a seleccionado                          |
| **Outside month**  | D├¡as de meses adyacentes con opacidad 0.3                         |

---

## Error Handling

### Client-Side

| Error                                    | Trigger                            |
|------------------------------------------|------------------------------------|
| "Selecciona un d├¡a"                      | No hay `selectedDate`              |
| "Sin eventos"                            | `dayEvents.length === 0`           |

### Server-Side

| Status   | API Response            | UI Mapping                            |
|----------|-------------------------|---------------------------------------|
| 422      | Validation error        | Toast con mensaje de validaci├│n       |
| 401      | Not authenticated       | Redirect a login                      |
| 500      | Internal server error   | Banner rojo: `message` del API        |
| Network  | `TypeError` de `fetch`  | Banner rojo: "No se pudo conectar..." |

---

## Test Scenarios

| Scenario                                           | Expected Result                                       |
|-----------------------------------------------------|-------------------------------------------------------|
| Render dashboard                                    | Header, Calendar, FAB visibles                        |
| No date selected                                    | "Selecciona un d├¡a" visible en secci├│n inferior       |
| Select a day with events                            | FlatList muestra `EventCard` por cada evento          |
| Select a day without events                         | EmptyState "Sin eventos" visible                      |
| Calendar loading is true                            | "Cargando..." overlay sobre el calendario             |
| Month change triggers `onMonthChange`               | Se recargan `calendarDates` para el nuevo mes         |
| Year change triggers `onYearChange`                 | Se recargan fechas para el nuevo a├▒o                  |
| Days with events show dots                          | Dots azules visibles en d├¡as con `count > 0`          |
| EventCard height proportional to duration           | Eventos de 3h ocupan m├ís espacio que eventos de 1h    |
| FAB navigates to create-event                       | `router.push(/(tabs)/create-event)`                   |
| API returns error                                   | Banner rojo con mensaje de error                      |
| Weekday headers in Spanish                          | L, M, X, J, V, S, D visibles                          |
| Month name in Spanish                               | "Junio 2026" en header                                |
| Today date has border highlight                     | Borde azul alrededor del d├¡a actual                   |

**Test suites:** 4 suites / 32 tests (`DateHelpersUnitTest` 13, `CalendarFeatureTest` 7, `EventCardFeatureTest` 6, `DashboardFlowBrowserTest` 3)

---

## Technical Notes

### Design Decisions

- **`react-native-ui-datepicker`**: Se eligi├│ esta librer├¡a por su soporte nativo de selectores de mes/a├▒o con animaciones, navegaci├│n con flechas, y personalizaci├│n de estilos. El componente `Day` custom permite inyectar los dots de eventos sin reimplementar la l├│gica del calendario.
- **Loading states separados**: `calendarLoading` y `eventsLoading` son independientes para no bloquear el calendario mientras se cargan los eventos de un d├¡a. El calendario solo muestra overlay en la carga inicial, no en cada selecci├│n.
- **Altura din├ímica en EventCard**: `getSlotHeight(startTime, endTime)` calcula la altura proporcional a la duraci├│n real del evento basado en 60px por hora, con un m├¡nimo de 30px.
- **Dots de eventos**: Se muestran m├íximo 3 dots por d├¡a (azul #0a7ea4) para mantener la legibilidad del grid. El `event_count` real puede ser mayor.
- **Separaci├│n de concerns**: El hook `useEvents` centraliza toda la l├│gica de fetching y estado, el componente `Calendar` solo maneja presentaci├│n, y `EventCard` es puramente visual.
- **In-memory storage fallback**: `storage.ts` usa un `Map` en memoria como fallback cuando `expo-secure-store` no est├í disponible (web, entornos sin m├│dulo nativo), evitando crashes.

### Known Limitations

- **Dots solo en mes actual**: Los dots solo aparecen en el mes actual cargado. Meses adyacentes requieren scroll/navegaci├│n para cargar sus datos.
- **Eventos que cruzan medianoche**: La constraint `ck_events_time_range` (`end_time > start_time`) no permite eventos que crucen las 00:00. Los eventos nocturnos deben tener `end_time` antes de medianoche.
- **Selector mes/a├▒o nativo**: El selector de meses/a├▒os usa el componente nativo de `react-native-ui-datepicker`, cuyo dise├▒o depende de la librer├¡a. La personalizaci├│n est├í limitada a los estilos expuestos.
- **Sin swipe horizontal**: La navegaci├│n entre meses se hace con flechas, no con gestos swipe. Pendiente evaluar si `react-native-ui-datepicker` soporta swipe en futuras versiones.

---

## Changelog

### v1.0.0 ΓÇö 2026-06-06
- Implementaci├│n inicial del dashboard con calendario mensual
- Componente `Calendar` con selector nativo de mes/a├▒o y dots de eventos
- Componente `EventCard` con altura din├ímica por duraci├│n
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
