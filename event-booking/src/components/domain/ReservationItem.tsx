import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import type { Reservation } from '@/src/types/reservations';
import { RESERVATIONS } from '@/src/constants/ui';

interface ReservationItemProps {
  reservation: Reservation;
  cancelling?: boolean;
  onCancel?: () => void;
}

export function ReservationItem({ reservation, cancelling = false, onCancel }: ReservationItemProps) {
  const handleCancel = () => {
    Alert.alert(
      RESERVATIONS.CANCEL_CONFIRM_TITLE,
      RESERVATIONS.CANCEL_CONFIRM_MESSAGE,
      [
        { text: RESERVATIONS.CANCEL_CONFIRM_CANCEL, style: 'cancel' },
        { text: RESERVATIONS.CANCEL_CONFIRM_OK, style: 'destructive', onPress: onCancel },
      ],
      { cancelable: true },
    );
  };

  const slots = reservation.ticket_quantity;
  const slotsLabel = slots === 1 ? RESERVATIONS.SLOT_LABEL : RESERVATIONS.SLOTS_LABEL;

  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.userInfo}>
            <ThemedText type="defaultSemiBold" style={styles.name} numberOfLines={1}>
              {reservation.user.user_name}
            </ThemedText>
            <ThemedText style={styles.email} numberOfLines={1}>
              {reservation.user.user_email}
            </ThemedText>
          </View>
          <View style={styles.slotsBadge}>
            <ThemedText style={styles.slotsText}>
              {slots} {slotsLabel}
            </ThemedText>
          </View>
        </View>

        {reservation.notes && (
          <ThemedText style={styles.notes} numberOfLines={2}>
            {reservation.notes}
          </ThemedText>
        )}

        <View style={styles.actions}>
          {cancelling ? (
            <ActivityIndicator size="small" color="#dc3545" />
          ) : (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${RESERVATIONS.CANCEL_BUTTON} reservación de ${reservation.user.user_name}`}
            >
              <ThemedText style={styles.cancelButtonText}>
                {RESERVATIONS.CANCEL_BUTTON}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  body: {
    padding: 14,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    color: '#11181c',
  },
  email: {
    fontSize: 13,
    color: '#687076',
  },
  slotsBadge: {
    backgroundColor: '#e6f4f1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  slotsText: {
    color: '#0a7ea4',
    fontSize: 13,
    fontWeight: '600',
  },
  notes: {
    fontSize: 13,
    color: '#687076',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  cancelButtonText: {
    color: '#dc3545',
    fontSize: 13,
    fontWeight: '600',
  },
});
