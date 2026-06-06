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

describe('title validation', () => {
  it('should reject empty title', () => {
    const errors = validateCreateEventForm({ ...base(), title: '' });
    expect(errors.some((e) => e.field === 'title')).toBe(true);
  });

  it('should reject title shorter than 3 characters', () => {
    const errors = validateCreateEventForm({ ...base(), title: 'Ab' });
    expect(errors.some((e) => e.field === 'title')).toBe(true);
  });

  it('should reject title longer than 64 characters', () => {
    const errors = validateCreateEventForm({ ...base(), title: 'A'.repeat(65) });
    expect(errors.some((e) => e.field === 'title')).toBe(true);
  });

  it('should accept valid title', () => {
    const errors = validateCreateEventForm({ ...base(), title: 'Valid Title' });
    expect(errors.filter((e) => e.field === 'title')).toHaveLength(0);
  });
});
