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

describe('date and time validation', () => {
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
});
