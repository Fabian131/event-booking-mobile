import { Alert } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ReservationCard } from '@/src/components/domain/ReservationCard';
import type { Reservation } from '@/src/types/reservations';

jest.mock('@/src/constants/ui', () => ({
  CUSTOMER: {
    STATUS_CONFIRMED: 'Confirmada',
    STATUS_CANCELLED: 'Cancelada',
    TICKET_SINGULAR: 'entrada',
    TICKET_PLURAL: 'entradas',
    CANCEL_ACTION: 'Cancelar reserva',
    CANCEL_CONFIRM_TITLE: '¿Cancelar reservación?',
    CANCEL_CONFIRM_MESSAGE: 'Esta acción es permanente.',
    CANCEL_CONFIRM_OK: 'Sí, cancelar',
    CANCEL_CONFIRM_CANCEL: 'No',
  },
}));

function makeReservation(overrides?: Partial<Reservation>): Reservation {
  return {
    id: 'abc-1',
    user_id: 'u1',
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
    updated_at: '2026-06-01T00:00:00Z',
    ...overrides,
  };
}

describe('ReservationCard component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    render(<ReservationCard reservation={makeReservation({ status: 'CANCELLED' })} />);
    expect(screen.getByText('Cancelada')).toBeTruthy();
  });
});

describe('ReservationCard cancel flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function renderCard(props?: Partial<Parameters<typeof ReservationCard>[0]>) {
    return render(
      <ReservationCard
        reservation={makeReservation()}
        onCancel={jest.fn()}
        {...props}
      />,
    );
  }

  it('should show three-dot button for CONFIRMED reservation with onCancel', () => {
    renderCard();
    expect(screen.getByLabelText('Acciones para Summer Festival')).toBeTruthy();
  });

  it('should NOT show three-dot button for CANCELLED reservation', () => {
    renderCard({ reservation: makeReservation({ status: 'CANCELLED' }) });
    expect(screen.queryByLabelText('Acciones para Summer Festival')).toBeNull();
  });

  it('should NOT show three-dot button when onCancel is not provided', () => {
    render(<ReservationCard reservation={makeReservation()} />);
    expect(screen.queryByLabelText('Acciones para Summer Festival')).toBeNull();
  });

  it('should open action menu modal on three-dot tap', () => {
    renderCard();
    fireEvent.press(screen.getByLabelText('Acciones para Summer Festival'));
    expect(screen.getByText('Cancelar reserva')).toBeTruthy();
  });

  it('should show Alert.alert when cancel option is tapped', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    renderCard();

    fireEvent.press(screen.getByLabelText('Acciones para Summer Festival'));
    fireEvent.press(screen.getByText('Cancelar reserva'));

    expect(alertSpy).toHaveBeenCalledWith(
      '¿Cancelar reservación?',
      'Esta acción es permanente.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, cancelar', style: 'destructive', onPress: expect.any(Function) },
      ],
      { cancelable: true },
    );
  });

  it('should call onCancel when Alert confirm button is pressed', () => {
    const onCancel = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<ReservationCard reservation={makeReservation()} onCancel={onCancel} />);

    fireEvent.press(screen.getByLabelText('Acciones para Summer Festival'));
    fireEvent.press(screen.getByText('Cancelar reserva'));

    const alertCall = alertSpy.mock.calls[0];
    const buttons = alertCall[2] as { text: string; onPress?: () => void }[];
    const confirmButton = buttons.find((b) => b.text === 'Sí, cancelar');
    confirmButton?.onPress?.();

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('should NOT call onCancel when Alert cancel button is pressed', () => {
    const onCancel = jest.fn();
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<ReservationCard reservation={makeReservation()} onCancel={onCancel} />);

    fireEvent.press(screen.getByLabelText('Acciones para Summer Festival'));
    fireEvent.press(screen.getByText('Cancelar reserva'));

    const alertCall = alertSpy.mock.calls[0];
    const buttons = alertCall[2] as { text: string; onPress?: () => void }[];
    const cancelButton = buttons.find((b) => b.text === 'No');
    cancelButton?.onPress?.();

    expect(onCancel).not.toHaveBeenCalled();
  });

  it('should close action menu when cancel option is tapped', () => {
    renderCard();

    fireEvent.press(screen.getByLabelText('Acciones para Summer Festival'));
    expect(screen.getByText('Cancelar reserva')).toBeTruthy();

    fireEvent.press(screen.getByText('Cancelar reserva'));

    expect(screen.queryByText('Cancelar reserva')).toBeNull();
  });

  it('should show ActivityIndicator when cancelling=true', () => {
    renderCard({ cancelling: true });

    expect(screen.getByTestId('cancelling-spinner')).toBeTruthy();
  });

  it('should hide three-dot button when cancelling=true', () => {
    renderCard({ cancelling: true });

    expect(screen.queryByLabelText('Acciones para Summer Festival')).toBeNull();
  });
});
