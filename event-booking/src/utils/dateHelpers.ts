// TODO: Prevención de conflictos de horario y validaciones de fechas

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
