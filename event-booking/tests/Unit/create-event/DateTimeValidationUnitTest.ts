import { validateCreateEventForm, mapServerErrors, type CreateEventFormValues } from '@/src/utils/validators';
import type { FieldError } from '@/src/types/auth';

function base(): CreateEventFormValues {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const start = new Date(tomorrow);
  start.setHours(10, 0, 0, 0);
  const end = new Date(tomorrow);
  end.setHours(12, 0, 0, 0);

  return {
    title: 'Concierto', description: 'Desc', max_capacity: '100', category: 'music',
    date: tomorrow, start_time: start, end_time: end, image: null
  };
}

describe('date and time validation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-12T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should reject past date', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const errors = validateCreateEventForm({ ...base(), date: yesterday });
    expect(errors.some((e) => e.field === 'date')).toBe(true);
  });

  it('should reject end_time <= start_time', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = new Date(tomorrow);
    start.setHours(14, 0, 0, 0);
    const end = new Date(tomorrow);
    end.setHours(12, 0, 0, 0);
    
    const errors = validateCreateEventForm({ ...base(), start_time: start, end_time: end });
    expect(errors.some((e) => e.field === 'end_time')).toBe(true);
  });

  it('should reject empty category', () => {
    const errors = validateCreateEventForm({ ...base(), category: '' });
    expect(errors.some((e) => e.field === 'category')).toBe(true);
  });

  it('should accept valid category', () => {
    const errors = validateCreateEventForm({ ...base(), category: 'sports' });
    expect(errors.filter((e) => e.field === 'category')).toHaveLength(0);
  });

  it('should reject invalid category not in enum', () => {
    const errors = validateCreateEventForm({ ...base(), category: 'invalid-cat' });
    expect(errors.some((e) => e.field === 'category')).toBe(true);
  });

  it('should accept today date', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureStart = new Date();
    futureStart.setHours(futureStart.getHours() + 2, 0, 0, 0);
    const futureEnd = new Date(futureStart);
    futureEnd.setHours(futureEnd.getHours() + 2, 0, 0, 0);
    const errors = validateCreateEventForm({ ...base(), date: today, start_time: futureStart, end_time: futureEnd });
    expect(errors.filter((e) => e.field === 'date')).toHaveLength(0);
  });

  it('should reject start_time in the past on today', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pastStart = new Date(today);
    pastStart.setHours(0, 0, 0, 0);
    const futureEnd = new Date(today);
    futureEnd.setHours(23, 59, 0, 0);
    const errors = validateCreateEventForm({ ...base(), date: today, start_time: pastStart, end_time: futureEnd });
    expect(errors.some((e) => e.field === 'start_time')).toBe(true);
  });
});

describe('mapServerErrors', () => {
  it('maps known backend messages to Spanish', () => {
    const input: FieldError[] = [
      { field: 'date', message: 'Event date cannot be in the past' },
      { field: 'title', message: 'Title must be at least 3 characters' },
      { field: 'max_capacity', message: 'Capacity must be greater than 0' },
    ];
    const mapped = mapServerErrors(input);
    expect(mapped.find((e) => e.field === 'date')!.message).toBe('La fecha no puede ser en el pasado');
    expect(mapped.find((e) => e.field === 'title')!.message).toBe('El título debe tener al menos 3 caracteres');
    expect(mapped.find((e) => e.field === 'max_capacity')!.message).toBe('La capacidad debe ser al menos 1');
  });

  it('passes through unknown messages untouched', () => {
    const input: FieldError[] = [
      { field: 'image', message: 'Some unknown image error' },
    ];
    const mapped = mapServerErrors(input);
    expect(mapped[0].message).toBe('Some unknown image error');
  });
});
