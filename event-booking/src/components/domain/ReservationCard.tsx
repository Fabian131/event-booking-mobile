import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { formatTime } from '@/src/utils/dateHelpers';
import { CUSTOMER } from '@/src/constants/ui';
import type { Reservation } from '@/src/types/reservations';

interface ReservationCardProps {
  reservation: Reservation;
  cancelling?: boolean;
  onCancel?: () => void;
}

export function ReservationCard({ reservation, cancelling = false, onCancel }: ReservationCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const isCancelled = reservation.status === 'CANCELLED';
  const statusColor = isCancelled ? '#dc3545' : '#28a745';
  const statusLabel = isCancelled ? CUSTOMER.STATUS_CANCELLED : CUSTOMER.STATUS_CONFIRMED;
  const canCancel = !isCancelled && onCancel && !cancelling;

  const handleCancelPress = () => {
    setMenuVisible(false);
    Alert.alert(
      CUSTOMER.CANCEL_CONFIRM_TITLE,
      CUSTOMER.CANCEL_CONFIRM_MESSAGE,
      [
        { text: CUSTOMER.CANCEL_CONFIRM_CANCEL, style: 'cancel' },
        { text: CUSTOMER.CANCEL_CONFIRM_OK, style: 'destructive', onPress: onCancel },
      ],
      { cancelable: true },
    );
  };

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
        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <ThemedText style={styles.statusText}>{statusLabel}</ThemedText>
          </View>
          {canCancel && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuVisible(true)}
              activeOpacity={0.6}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={CUSTOMER.CANCEL_ACCESSIBILITY}
            >
              <ThemedText style={styles.menuDots}>⋯</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.subtitleRow}>
        <ThemedText style={styles.subtitle} numberOfLines={1}>
          {formatTime(reservation.event_start_time)} - {formatTime(reservation.event_end_time)}
          {' • '}
          {reservation.ticket_quantity}{' '}
          {reservation.ticket_quantity === 1 ? CUSTOMER.TICKET_SINGULAR : CUSTOMER.TICKET_PLURAL}
        </ThemedText>
        {cancelling && (
          <ActivityIndicator
            size="small"
            color="#dc3545"
            style={styles.cancellingSpinner}
            accessibilityLabel={`Cancelando ${reservation.event_title}`}
          />
        )}
      </View>

      {reservation.notes ? (
        <ThemedText style={styles.notes} numberOfLines={2}>
          {reservation.notes}
        </ThemedText>
      ) : null}

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuSheet}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleCancelPress}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel={CUSTOMER.CANCEL_ACTION}
            >
              <ThemedText style={styles.menuItemTextDanger}>
                {CUSTOMER.CANCEL_ACTION}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
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
    alignItems: 'flex-start',
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  menuButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDots: {
    fontSize: 18,
    color: '#687076',
    fontWeight: '700',
    lineHeight: 20,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#687076',
    flex: 1,
  },
  cancellingSpinner: {
    marginLeft: 8,
  },
  notes: {
    fontSize: 12,
    color: '#9ba1a6',
    marginTop: 6,
    fontStyle: 'italic',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuSheet: {
    backgroundColor: '#fff',
    borderRadius: 14,
    minWidth: 200,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuItemTextDanger: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
});
