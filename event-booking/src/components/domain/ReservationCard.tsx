import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { formatTime } from '@/src/utils/dateHelpers';
import { CUSTOMER } from '@/src/constants/ui';
import type { Reservation } from '@/src/types/reservations';

interface ReservationCardProps {
  reservation: Reservation;
}

export function ReservationCard({ reservation }: ReservationCardProps) {
  const isCancelled = reservation.status === 'CANCELLED';
  const statusColor = isCancelled ? '#dc3545' : '#28a745';
  const statusLabel = isCancelled ? CUSTOMER.STATUS_CANCELLED : CUSTOMER.STATUS_CONFIRMED;

  return (
    <View style={[styles.card, { borderLeftColor: statusColor }]}>
      <View style={styles.titleRow}>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.title, isCancelled && styles.titleCancelled]}
          numberOfLines={2}
        >
          {reservation.event_title}
        </ThemedText>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <ThemedText style={styles.statusText}>{statusLabel}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.subtitle} numberOfLines={1}>
        {formatTime(reservation.event_start_time)} - {formatTime(reservation.event_end_time)}
        {' • '}
        {reservation.ticket_quantity}{' '}
        {reservation.ticket_quantity === 1 ? CUSTOMER.TICKET_SINGULAR : CUSTOMER.TICKET_PLURAL}
      </ThemedText>
      {reservation.notes ? (
        <ThemedText style={styles.notes} numberOfLines={2}>
          {reservation.notes}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'visible',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    color: '#11181c',
    flex: 1,
  },
  titleCancelled: {
    textDecorationLine: 'line-through',
    color: '#687076',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    color: '#687076',
    marginTop: 4,
  },
  notes: {
    fontSize: 12,
    color: '#9ba1a6',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
