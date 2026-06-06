import { validateCreateEventForm, type CreateEventFormValues } from '@/src/utils/validators';

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

describe('capacity validation', () => {
  it('should reject empty capacity', () => {
    const errors = validateCreateEventForm({ ...base(), max_capacity: '' });
    expect(errors.some((e) => e.field === 'max_capacity')).toBe(true);
  });

  it('should reject non-numeric capacity', () => {
    const errors = validateCreateEventForm({ ...base(), max_capacity: 'abc' });
    expect(errors.some((e) => e.field === 'max_capacity')).toBe(true);
  });

  it('should reject capacity < 1', () => {
    const errors = validateCreateEventForm({ ...base(), max_capacity: '0' });
    expect(errors.some((e) => e.field === 'max_capacity')).toBe(true);
  });

  it('should reject capacity > 9999999', () => {
    const errors = validateCreateEventForm({ ...base(), max_capacity: '10000000' });
    expect(errors.some((e) => e.field === 'max_capacity')).toBe(true);
  });

  it('should accept valid capacity', () => {
    const errors = validateCreateEventForm({ ...base(), max_capacity: '1000' });
    expect(errors.filter((e) => e.field === 'max_capacity')).toHaveLength(0);
  });
});
