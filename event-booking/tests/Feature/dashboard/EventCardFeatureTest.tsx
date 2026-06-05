import { render, screen } from '@testing-library/react-native';
import { EventCard } from '@/src/components/domain/EventCard';
import type { EventSummary } from '@/src/types/event';

describe('EventCard component', () => {
  const baseEvent: EventSummary = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Summer Festival',
    description: 'A great summer festival',
    image_url: null,
    max_capacity: 500,
    remaining_capacity: 342,
    category: 'music',
    date: '2026-07-15',
    start_time: '10:00:00',
    end_time: '18:00:00',
    is_active: true,
  };

  it('should render event title and description', () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.getByText('Summer Festival')).toBeTruthy();
    expect(screen.getByText('A great summer festival')).toBeTruthy();
  });

  it('should render time range', () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.getByText('10:00 AM - 6:00 PM')).toBeTruthy();
  });

  it('should render category badge', () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.getByText('music')).toBeTruthy();
  });

  it('should render remaining capacity', () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.getByText('342/500')).toBeTruthy();
  });

  it('should handle event without description', () => {
    const event: EventSummary = { ...baseEvent, description: null };
    render(<EventCard event={event} />);

    expect(screen.getByText('Summer Festival')).toBeTruthy();
    expect(screen.queryByText('A great summer festival')).toBeNull();
  });

  it('should call onPress when tapped', () => {
    const onPress = jest.fn();
    render(<EventCard event={baseEvent} onPress={onPress} />);

    screen.getByText('Summer Festival');
  });
});
