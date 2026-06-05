import {
  buildMonthGrid,
  getMonthName,
  getDayNames,
  getToday,
  formatTime,
  formatTimeRange,
  getSlotHeight,
  getPreviousMonth,
  getNextMonth,
} from '@/src/utils/dateHelpers';

describe('getMonthName', () => {
  it('should return Spanish month name', () => {
    expect(getMonthName(1)).toBe('Enero');
    expect(getMonthName(6)).toBe('Junio');
    expect(getMonthName(12)).toBe('Diciembre');
  });
});

describe('getDayNames', () => {
  it('should return Spanish abbreviations', () => {
    const names = getDayNames();
    expect(names).toEqual(['L', 'M', 'X', 'J', 'V', 'S', 'D']);
    expect(names.length).toBe(7);
  });
});

describe('getToday', () => {
  it('should return today in YYYY-MM-DD format', () => {
    const today = getToday();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('buildMonthGrid', () => {
  it('should return 42 cells (6 rows x 7 cols)', () => {
    const eventMap = new Map<string, number>();
    const cells = buildMonthGrid(2026, 6, eventMap, null);
    expect(cells.length).toBe(42);
  });

  it('should mark days from current month as current', () => {
    const eventMap = new Map<string, number>();
    const cells = buildMonthGrid(2026, 1, eventMap, null);
    const janDays = cells.filter((c) => c.isCurrentMonth);
    expect(janDays.length).toBe(31);
    expect(janDays[0].day).toBe(1);
    expect(janDays[janDays.length - 1].day).toBe(31);
  });

  it('should include event counts from eventMap', () => {
    const eventMap = new Map<string, number>();
    eventMap.set('2026-06-15', 3);
    eventMap.set('2026-06-20', 1);
    const cells = buildMonthGrid(2026, 6, eventMap, null);
    const day15 = cells.find((c) => c.date === '2026-06-15');
    const day20 = cells.find((c) => c.date === '2026-06-20');
    expect(day15?.eventCount).toBe(3);
    expect(day20?.eventCount).toBe(1);
  });

  it('should mark today', () => {
    const today = getToday();
    const eventMap = new Map<string, number>();
    const [y, m] = today.split('-').map(Number);
    const cells = buildMonthGrid(y, m, eventMap, null);
    const todayCell = cells.find((c) => c.date === today);
    expect(todayCell?.isToday).toBe(true);
  });

  it('should mark selected date', () => {
    const eventMap = new Map<string, number>();
    const cells = buildMonthGrid(2026, 6, eventMap, '2026-06-10');
    const selected = cells.find((c) => c.date === '2026-06-10');
    expect(selected?.isSelected).toBe(true);
  });

  it('should handle months starting on Sunday (Spanish week Mon-Sun)', () => {
    const eventMap = new Map<string, number>();
    const cells = buildMonthGrid(2026, 3, eventMap, null);
    expect(cells.length).toBe(42);
    const firstMarch = cells.find((c) => c.date === '2026-03-01' && c.isCurrentMonth);
    expect(firstMarch).toBeDefined();
  });
});

describe('formatTime', () => {
  it('should format morning time', () => {
    expect(formatTime('09:30:00')).toBe('9:30 AM');
    expect(formatTime('00:00:00')).toBe('12:00 AM');
  });

  it('should format afternoon time', () => {
    expect(formatTime('12:00:00')).toBe('12:00 PM');
    expect(formatTime('14:00:00')).toBe('2:00 PM');
    expect(formatTime('23:59:00')).toBe('11:59 PM');
  });
});

describe('formatTimeRange', () => {
  it('should return range string', () => {
    expect(formatTimeRange('10:00:00', '12:00:00')).toBe('10:00 AM - 12:00 PM');
    expect(formatTimeRange('14:00:00', '18:00:00')).toBe('2:00 PM - 6:00 PM');
  });
});

describe('getSlotHeight', () => {
  it('should compute height from duration', () => {
    const h1 = getSlotHeight('10:00:00', '11:00:00');
    expect(h1).toBe(60);

    const h2 = getSlotHeight('10:00:00', '12:00:00');
    expect(h2).toBe(120);

    const h3 = getSlotHeight('10:00:00', '10:30:00');
    expect(h3).toBe(30);
  });

  it('should enforce minimum height', () => {
    const h = getSlotHeight('10:00:00', '10:05:00');
    expect(h).toBe(30);
  });
});

describe('getPreviousMonth', () => {
  it('should go to previous month', () => {
    expect(getPreviousMonth(2026, 6)).toEqual({ year: 2026, month: 5 });
  });

  it('should wrap around year', () => {
    expect(getPreviousMonth(2026, 1)).toEqual({ year: 2025, month: 12 });
  });
});

describe('getNextMonth', () => {
  it('should go to next month', () => {
    expect(getNextMonth(2026, 6)).toEqual({ year: 2026, month: 7 });
  });

  it('should wrap around year', () => {
    expect(getNextMonth(2026, 12)).toEqual({ year: 2027, month: 1 });
  });
});
