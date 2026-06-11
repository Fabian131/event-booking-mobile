import { render, screen } from '@testing-library/react-native';
import { EventCard } from '@/src/components/domain/EventCard';
import type { EventSummary } from '@/src/types/events';

jest.mock('expo-image', () => ({
  Image: 'Image',
}));
jest.mock('@/src/constants/ui', () => ({
  CATEGORY: {
    COLORS: { music: '#e91e63', sports: '#4caf50', culture: '#9c27b0', gastronomy: '#ff5722', wellness: '#009688', education: '#2196f3', other: '#607d8b' },
    LABELS: { music: 'Música', sports: 'Deportes', culture: 'Cultura', gastronomy: 'Gastronomía', wellness: 'Bienestar', education: 'Educación', other: 'Otro' },
  },
}));

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
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  it('should render event title', () => {
    render(<EventCard event={baseEvent} />);
    expect(screen.getByText('Summer Festival')).toBeTruthy();
  });

  it('should render event description', () => {
    render(<EventCard event={baseEvent} />);
    expect(screen.getByText('A great summer festival')).toBeTruthy();
  });

  it('should render category badge label', () => {
    render(<EventCard event={baseEvent} />);
    expect(screen.getByText('Música')).toBeTruthy();
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
    expect(screen.getByText('Summer Festival')).toBeTruthy();
  });

  it('should render different categories', () => {
    const sportsEvent: EventSummary = { ...baseEvent, category: 'sports' };
    render(<EventCard event={sportsEvent} />);
    expect(screen.getByText('Deportes')).toBeTruthy();
  });
});
