import type { DayCell } from '@/src/types/event';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAY_NAMES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1];
}

export function getDayNames(): string[] {
  return DAY_NAMES;
}

export function getToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayYear(): number {
  return new Date().getFullYear();
}

export function getTodayMonth(): number {
  return new Date().getMonth() + 1;
}

export function buildMonthGrid(
  year: number,
  month: number,
  eventMap: Map<string, number>,
  selectedDate: string | null,
): DayCell[] {
  const today = getToday();

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();

  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const cells: DayCell[] = [];

  const prevLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = prevLastDay - i;
    const dt = new Date(year, month - 2, d);
    const dateStr = formatDate(dt);
    cells.push({
      date: dateStr,
      day: d,
      isCurrentMonth: false,
      isToday: dateStr === today,
      isSelected: dateStr === selectedDate,
      eventCount: eventMap.get(dateStr) || 0,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month - 1, d);
    const dateStr = formatDate(dt);
    cells.push({
      date: dateStr,
      day: d,
      isCurrentMonth: true,
      isToday: dateStr === today,
      isSelected: dateStr === selectedDate,
      eventCount: eventMap.get(dateStr) || 0,
    });
  }

  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const dt = new Date(year, month, d);
    const dateStr = formatDate(dt);
    cells.push({
      date: dateStr,
      day: d,
      isCurrentMonth: false,
      isToday: dateStr === today,
      isSelected: dateStr === selectedDate,
      eventCount: eventMap.get(dateStr) || 0,
    });
  }

  return cells;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function getSlotHeight(startTime: string, endTime: string, hourHeight: number = 60): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const minutes = (eh * 60 + em) - (sh * 60 + sm);
  return Math.max((minutes / 60) * hourHeight, hourHeight * 0.5);
}

export function getPreviousMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

export function getNextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}
