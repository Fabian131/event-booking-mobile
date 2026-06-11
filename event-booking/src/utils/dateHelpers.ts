// TODO: Prevención de conflictos de horario y validaciones de fechas

// ── Calendar dashboard helpers ─────────────────────────────────────────────

export function getTodayYear(): number {
  return new Date().getFullYear();
}

export function getTodayMonth(): number {
  return new Date().getMonth() + 1;
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

// ── Existing helpers ───────────────────────────────────────────────────────

export function formatEventDate(d: string): string {
  const [year, month, day] = d.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatEventTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m);
  return date.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
}
