# Module: Admin Event Delete

---

## General Information

- **Module Code**: `EBM-06`
- **API Contract**: `api-contracts/delete-event.yaml`
- **Responsible**: Luis F Rosales Vargas
- **Status**: Completed
- **Version**: `1.0.0`
- **Created**: `2026-06-12`
- **Last Updated**: `2026-06-13`

---

## Description

Delete functionality integrated into the admin event detail screen that allows business users to permanently remove an event. The flow implements a double-confirmation pattern:

1. **Options menu** — A contextual `⋯` button at the right of the category badge triggers a native Alert with the "Eliminar evento" (destructive) and "Cancelar" options.
2. **Confirmation dialog** — Selecting "Eliminar evento" presents a second Alert explicitly warning that the action is irreversible and all booked customers will be notified via email.
3. **Execution** — Confirming the second dialog calls `DELETE /api/v1/events/{event_id}`, which triggers background email notifications to every user with a confirmed reservation.
4. **Redirect** — On success, the administrator is routed back to `/(admin)` (the calendar dashboard), where the deleted event no longer appears.

During the delete operation, the options button and both footer buttons (Editar, Ver Reservaciones) are disabled to prevent concurrent actions.

### Error Handling

| Scenario | User Feedback |
|----------|---------------|
| Network error (TypeError) | "No se pudo conectar con el servidor. Verifica tu conexión a internet." |
| API error (ApiError) | Server-provided error message (e.g., "Event not found") |
| Unknown error | "Error al eliminar el evento." |
| User navigates away during delete | No alert shown, state cleanup via `mountedRef` |

---

## API Contract

**File:** `api-contracts/delete-event.yaml`

| Method | Route | Auth | Response | Description |
|--------|-------|------|----------|-------------|
| DELETE | `/api/v1/events/{event_id}` | Bearer (business) | 204 No Content | Permanently deletes event, cascades to reservations, sends email to all booked users |

### Response Codes

| Status | Meaning |
|--------|---------|
| 204 | Event deleted. Background emails queued for all confirmed reservation holders. |
| 401 | Missing or invalid bearer token. |
| 403 | Caller does not have the `business` role. |
| 404 | Event not found (already deleted or invalid UUID). |
| 500 | Unexpected server error. |

---

## Architecture

### File Map

```
src/
├── services/
│   ├── api.ts                          # api.delete() — 204-safe DELETE with timeout + FastAPI error parsing
│   └── events.ts                       # eventsService.delete(id) — thin wrapper over api.delete
├── constants/
│   └── ui.ts                           # ADMIN.DETAIL_* constants for delete UI strings
├── hooks/
│   └── useEventDetail.ts               # useEventDetail(id) — fetches event on screen focus
├── components/ui/
│   └── Button.tsx                      # Reusable button — disabled state used during delete
app/
└── (admin)/
    ├── _layout.tsx                     # Stack layout with auth guard (business role required)
    ├── index.tsx                       # Calendar dashboard — receives redirect after successful delete
    └── events/
        └── [id].tsx                    # Event detail screen — hosts ⋮ button + delete flow
```

### Data Flow

```
User taps ⋮
  → Alert.alert("Opciones")
    → User taps "Eliminar evento"
      → Alert.alert("¿Eliminar evento?")
        → User taps "Eliminar"
          → setDeleting(true) — disables ⋮ + footer buttons
          → eventsService.delete(id)
            → api.delete(`/api/v1/events/${id}`)
              → return (204 = no body)
          → router.replace('/(admin)') on success
          → Alert.alert(errorMessage) on failure
          → setDeleting(false) in finally (with mountedRef guard)
```

---

## Files

### Screen: `app/(admin)/events/[id].tsx`

**States:**
| State | Condition | Rendering |
|-------|-----------|-----------|
| Loading | `loading === true` | `<Loader message="Cargando evento...">` |
| Error | `error !== null` | `<EmptyState icon="⚠️" title={error}>` |
| Not found | `event === null` | `<EmptyState title="Evento no encontrado">` |
| Loaded | `event !== null` | Full detail view with ⋮ button |
| Deleting | `deleting === true` | ⋮ disabled, footer buttons disabled |

**Components:**
| Component | Usage |
|-----------|-------|
| `Pressable` (⋮) | Options button — triggers first Alert |
| `Alert.alert` (first) | Options menu: "Eliminar evento" (destructive) / "Cancelar" (cancel) |
| `Alert.alert` (second) | Confirmation: warning message + "Eliminar" (destructive) / "Cancelar" (cancel) |
| `Button` × 2 | Footer buttons disabled during `deleting` |

**Hooks:** `useEventDetail`, `useState` (deleting), `useRef` (mountedRef), `useEffect` (cleanup)

**Services:** `eventsService.delete(id)`

### Service: `src/services/events.ts`

```typescript
delete(id: string): Promise<void> {
  return api.delete(`/api/v1/events/${id}`);
}
```

### HTTP Client: `src/services/api.ts`

`api.delete(endpoint)` is a standalone implementation (not sharing `request()`) because:
- DELETE returns `204 No Content` — `response.json()` would throw on empty body
- Safely handles any 2xx with `response.text()` + conditional `JSON.parse`
- Shares the same 15s `AbortController` timeout, `Bearer` token injection, and FastAPI error parsing as `request()`

### Constants: `src/constants/ui.ts`

| Constant | Value |
|----------|-------|
| `ADMIN.DETAIL_OPTIONS_LABEL` | `'Opciones'` |
| `ADMIN.DETAIL_DELETE_OPTION` | `'Eliminar evento'` |
| `ADMIN.DETAIL_DELETE_CONFIRM_TITLE` | `'¿Eliminar evento?'` |
| `ADMIN.DETAIL_DELETE_CONFIRM_MESSAGE` | `'Esta acción es permanente y no se puede deshacer. Se notificará por correo a todos los usuarios con reservaciones activas.'` |
| `ADMIN.DETAIL_DELETE_CONFIRM_CANCEL` | `'Cancelar'` |
| `ADMIN.DETAIL_DELETE_CONFIRM_OK` | `'Eliminar'` |
| `ADMIN.DETAIL_DELETE_SUCCESS` | `'Evento eliminado exitosamente.'` |
| `ADMIN.DETAIL_DELETE_ERROR` | `'Error al eliminar el evento.'` |

---

## UI/UX

### Component Tree

```
ThemedView[container]
├── Stack.Screen
├── ScrollView
│   ├── Image (hero)
│   └── View[content]
│       ├── View[titleRow]
│       │   ├── ThemedText (title)
│       │   └── View[titleActions]
│       │       ├── View[badge] → ThemedText (category)
│       │       └── Pressable[optionsButton] → ThemedText (⋯)
│       ├── InfoRow × 5 (date, start, end, max_capacity, remaining_capacity)
│       └── ThemedText (description, optional)
└── View[footer]
    ├── Button[Editar] (secondary)
    └── Button[Ver Reservaciones] (primary)
```

### Visual States

| State | ⋮ Button | Footer Buttons | Alerts |
|-------|----------|----------------|--------|
| Idle | Active, white bg | Active | None |
| Pressing ⋮ | Active | Active | Options Alert visible |
| Selecting "Eliminar" | Active | Active | Confirmation Alert visible |
| Deleting | Disabled (`opacity: 0.5`) | Disabled (`opacity: 0.5`) | None (in-flight) |
| Error | Active | Active | Error Alert visible |
| Success | — | — | Redirect to `/(admin)` |

---

## Error Handling

### Client-side

| Error Type | Detection | Message Source |
|------------|-----------|----------------|
| TypeError (network) | `err instanceof TypeError` | `ERRORS.NETWORK` |
| ApiError | `err instanceof ApiError` | `err.message` (server-provided) |
| Other | Fallthrough | `ADMIN.DETAIL_DELETE_ERROR` |

### Server-side (handled by API)

| Status | Trigger | Backend Behavior |
|--------|---------|------------------|
| 204 | Successful delete | Event removed, reservations cascaded, emails queued |
| 401 | No/malformed token | `HTTPBearer` rejects before route |
| 403 | Non-business role | `require_business_user` rejects |
| 404 | Unknown event ID | `event_service.delete_event` raises ValueError |

### Mounted Guard

A `useRef(true)` + `useEffect` cleanup pattern prevents state updates and Alert calls on unmounted components. If the user navigates away (swipe back, hardware back) during the delete request, `mountedRef.current` becomes `false` and the catch/finally blocks skip UI operations.

---

## Test Scenarios

### Feature Tests

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Render ⋮ button with correct accessibility label | `screen.getByLabelText('Opciones')` finds element |
| 2 | Press ⋮ → Options Alert appears | `Alert.alert` called with title `'Opciones'` |
| 3 | Select "Eliminar evento" → Confirmation Alert appears | `Alert.alert` called with `'¿Eliminar evento?'` and destructive "Eliminar" button |
| 4 | Confirm delete → `eventsService.delete` called + redirect | `eventsService.delete('1')` called, `mockReplace('/(admin)')` called |
| 5 | Delete fails with TypeError → network error shown | Alert contains `'No se pudo conectar'` |
| 6 | Delete fails with ApiError → API message shown | Alert contains `err.message` (e.g., `'Event not found'`) |
| 7 | Delete fails with unknown Error → generic error shown | Alert contains `'Error al eliminar'` |
| 8 | Delete fails → no redirect | `mockReplace` not called |

### Browser Tests

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Full happy path: ⋮ → "Eliminar evento" → "Eliminar" → redirect | `eventsService.delete('event-delete-1')` called, redirect to `/(admin)` |
| 2 | Error 404 → stay on page + error alert | Alert shows `'Event not found'`, no redirect |
| 3 | Network error → stay on page + error alert | Alert shows network message, no redirect |
| 4 | Cancel on options Alert → nothing happens | `eventsService.delete` not called |
| 5 | Cancel on confirmation Alert → nothing happens | `eventsService.delete` not called |
| 6 | Buttons disabled during delete operation | ⋮, Editar, Ver Reservaciones all have `accessibilityState.disabled: true` |

---

## Tests

### Layer Breakdown

| Layer | File | Tests | Coverage |
|-------|------|-------|----------|
| Feature | `tests/Feature/events/AdminEventDetailFeatureTest.tsx` | 14 tests (8 delete) | Happy path, network error, API error, unknown error, no-redirect-on-error, options render, options Alert, confirmation Alert |
| Browser | `tests/Browser/events/DeleteEventFlowBrowserTest.tsx` | 6 tests | Full flow, 404 stay, network stay, cancel-options, cancel-confirmation, disabled-while-deleting |

### Test Commands

```bash
# Feature tests only
npx jest tests/Feature/events/AdminEventDetailFeatureTest.tsx

# Browser tests only
npx jest tests/Browser/events/DeleteEventFlowBrowserTest.tsx

# All delete-related tests
npx jest --testPathPattern="DeleteEvent|AdminEventDetailFeature"

# Full suite
npx jest
```

---

## Technical Notes

### Design Decisions

1. **Standalone `api.delete`** — Not sharing the `request()` helper because DELETE endpoints return `204 No Content`. Using `response.text()` with conditional `JSON.parse` avoids crashes on empty bodies while still supporting non-standard responses.

2. **Double Alert confirmation** — Using two sequential `Alert.alert` calls (options → confirmation) rather than a custom modal. This is the platform-native pattern for destructive actions on both iOS and Android.

3. **`router.replace` instead of `router.back`** — After deletion, navigating back would show a stale screen. `replace` ensures the calendar dashboard is re-mounted, which triggers `useFocusEffect` → `refresh()`.

4. **`mountedRef` guard** — Prevents `setState` and `Alert.alert` on unmounted components if the user navigates away during the async delete operation.

5. **No success Alert before redirect** — Removed the success Alert because the redirect to the updated calendar dashboard is sufficient feedback. A success Alert competing with the navigation transition is visually confusing.

### Known Limitations

1. **No offline queue** — If the network is unavailable, the delete must be retried manually.
2. **No undo** — The delete is permanent (by design). The double confirmation mitigates accidental triggers.
3. **Large reservation counts** — The backend caps email notifications at 1000 recipients. For events with more than 1000 reservations, a warning is logged.

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| `1.0.0` | `2026-06-13` | Luis F Rosales Vargas | Initial implementation: ⋮ options button, double-confirmation Alert flow, `api.delete` 204 handling, `eventsService.delete`, UI constants, 14 new tests |
