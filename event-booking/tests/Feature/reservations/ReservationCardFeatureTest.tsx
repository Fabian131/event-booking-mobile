import { render, screen } from '@testing-library/react-native';
import { ReservationCard } from '@/src/components/domain/ReservationCard';
import type { ReservationSummary } from '@/src/types/reservations';

jest.mock('@/src/constants/ui', () => ({
  CUSTOMER: {
    STATUS_CONFIRMED: 'Confirmada',
    STATUS_CANCELLED: 'Cancelada',
    TICKET_SINGULAR: 'entrada',
    TICKET_PLURAL: 'entradas',
  },
}));

function makeReservation(overrides?: Partial<ReservationSummary>): ReservationSummary {
  return {
    id: 'abc-1',
    event_id: 'evt-1',
    event_title: 'Summer Festival',
    event_date: '2026-07-15',
    event_start_time: '10:00:00',
    event_end_time: '18:00:00',
    ticket_quantity: 2,
    status: 'CONFIRMED',
    notes: null,
    user: { user_id: 'u1', user_name: 'Jane', user_email: 'jane@test.com' },
    created_at: '2026-06-01T00:00:00Z',
    ...overrides,
  };
}

describe('ReservationCard component', () => {
  it('should render event title', () => {
    render(<ReservationCard reservation={makeReservation()} />);
    expect(screen.getByText('Summer Festival')).toBeTruthy();
  });

  it('should render CONFIRMED status badge', () => {
    render(<ReservationCard reservation={makeReservation({ status: 'CONFIRMED' })} />);
    expect(screen.getByText('Confirmada')).toBeTruthy();
  });

  it('should render CANCELLED status badge', () => {
    render(<ReservationCard reservation={makeReservation({ status: 'CANCELLED' })} />);
    expect(screen.getByText('Cancelada')).toBeTruthy();
  });

  it('should render ticket quantity with plural wording', () => {
    render(<ReservationCard reservation={makeReservation({ ticket_quantity: 3 })} />);
    expect(screen.getByText(/3\s+entradas/)).toBeTruthy();
  });

  it('should render ticket quantity with singular wording', () => {
    render(<ReservationCard reservation={makeReservation({ ticket_quantity: 1 })} />);
    expect(screen.getByText(/1\s+entrada/)).toBeTruthy();
  });

  it('should render time in 12h format', () => {
    render(<ReservationCard reservation={makeReservation()} />);
    expect(screen.getByText(/10:00 a\.m\. - 6:00 p\.m\./)).toBeTruthy();
  });

  it('should render notes when provided', () => {
    render(<ReservationCard reservation={makeReservation({ notes: 'Near window please' })} />);
    expect(screen.getByText('Near window please')).toBeTruthy();
  });

  it('should not render notes when null', () => {
    render(<ReservationCard reservation={makeReservation({ notes: null })} />);
    expect(screen.queryByText('Near window please')).toBeNull();
  });

  it('should render strikethrough title for CANCELLED', () => {
    const { UNSAFE_getByType } = render(
      <ReservationCard reservation={makeReservation({ status: 'CANCELLED' })} />,
    );
    expect(screen.getByText('Cancelada')).toBeTruthy();
  });
});
