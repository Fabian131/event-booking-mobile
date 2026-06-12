import {
  formatTime,
  formatTimeRange,
  getTodayYear,
  getTodayMonth,
  formatEventDate,
  formatEventTime,
} from '@/src/utils/dateHelpers';

describe('getTodayYear', () => {
  it('should return current year as number', () => {
    const year = getTodayYear();
    expect(typeof year).toBe('number');
    expect(year).toBeGreaterThanOrEqual(2026);
  });
});

describe('getTodayMonth', () => {
  it('should return a month between 1 and 12', () => {
    const month = getTodayMonth();
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
  });
});

describe('formatTime', () => {
  it('should format morning time in 12h AM', () => {
    expect(formatTime('09:30:00')).toBe('9:30 AM');
    expect(formatTime('00:00:00')).toBe('12:00 AM');
  });

  it('should format afternoon time in 12h PM', () => {
    expect(formatTime('12:00:00')).toBe('12:00 PM');
    expect(formatTime('14:00:00')).toBe('2:00 PM');
    expect(formatTime('23:59:00')).toBe('11:59 PM');
  });
});

describe('formatTimeRange', () => {
  it('should join start and end times with dash', () => {
    const range = formatTimeRange('10:00:00', '12:00:00');
    expect(range).toContain('10:00 AM');
    expect(range).toContain('12:00 PM');
  });

  it('should handle afternoon range', () => {
    const range = formatTimeRange('14:00:00', '18:00:00');
    expect(range).toContain('2:00 PM');
    expect(range).toContain('6:00 PM');
  });
});

describe('formatEventDate', () => {
  it('should return a Spanish locale date string', () => {
    const result = formatEventDate('2026-06-15');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // should contain the day number
    expect(result).toContain('15');
  });
});

describe('formatEventTime', () => {
  it('should return a time string', () => {
    const result = formatEventTime('14:30:00');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
