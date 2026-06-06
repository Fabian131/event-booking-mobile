import { validateCreateEventForm, type CreateEventFormValues } from '@/src/utils/validators';

function base(): CreateEventFormValues {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const start = new Date(tomorrow);
  start.setHours(10, 0, 0, 0);
  const end = new Date(tomorrow);
  end.setHours(12, 0, 0, 0);

  return {
    title: 'Concierto', description: '', max_capacity: '100', category: 'music',
    date: tomorrow, start_time: start, end_time: end, image: null
  };
}

describe('description validation', () => {
  it('should accept empty description', () => {
    const errors = validateCreateEventForm({ ...base(), description: '' });
    expect(errors.filter((e) => e.field === 'description')).toHaveLength(0);
  });

  it('should reject description longer than 255 characters', () => {
    const errors = validateCreateEventForm({ ...base(), description: 'A'.repeat(256) });
    expect(errors.some((e) => e.field === 'description')).toBe(true);
  });

  it('should accept valid description', () => {
    const errors = validateCreateEventForm({ ...base(), description: 'Un evento increíble para toda la familia' });
    expect(errors.filter((e) => e.field === 'description')).toHaveLength(0);
  });
});
