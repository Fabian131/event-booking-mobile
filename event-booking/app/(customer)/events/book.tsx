import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { BOOKING, CATEGORY, ERRORS, EVENTS } from '@/src/constants/ui';
import { ApiError } from '@/src/types/auth';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Input } from '@/src/components/ui/Input';
import { Loader } from '@/src/components/ui/Loader';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { useEventDetail } from '@/src/hooks/useEventDetail';
import { reservationsService } from '@/src/services/reservations';
import { formatEventDate, formatEventTime } from '@/src/utils/dateHelpers';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <View style={infoStyles.textGroup}>
        <ThemedText style={infoStyles.label}>{label}</ThemedText>
        <ThemedText style={infoStyles.value}>{value}</ThemedText>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  textGroup: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: '#9BA1A6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#11181c',
    fontWeight: '600',
  },
});

export default function BookScreen() {
  const { event_id } = useLocalSearchParams<{ event_id: string }>();
  const router = useRouter();
  const { event, loading, error } = useEventDetail(event_id);

  const [quantity, setQuantity] = useState(1);
  const [quantityText, setQuantityText] = useState('1');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      router.back();
    }, 1200);
    return () => clearTimeout(timer);
  }, [success, router]);

  if (loading) {
    return <Loader message={BOOKING.LOADING} />;
  }

  if (error || !event) {
    return (
      <ThemedView style={styles.center}>
        <EmptyState icon="⚠️" title={error ?? EVENTS.DETAIL_NOT_FOUND} />
      </ThemedView>
    );
  }

  const remainingCapacity = event.remaining_capacity;
  const soldOut = remainingCapacity <= 0;
  const categoryColor = CATEGORY.COLORS[event.category];

  function clampQuantity(value: number): number {
    return Math.max(1, Math.min(value, remainingCapacity));
  }

  function handleQuantityTextChange(text: string) {
    const cleaned = text.replace(/[^0-9]/g, '');
    setQuantityText(cleaned);

    const parsed = parseInt(cleaned, 10);
    if (!isNaN(parsed)) {
      setQuantity(clampQuantity(parsed));
    }
  }

  function handleQuantityTextBlur() {
    if (quantityText === '' || isNaN(parseInt(quantityText, 10))) {
      setQuantity(1);
      setQuantityText('1');
    } else {
      const clamped = clampQuantity(quantity);
      setQuantity(clamped);
      setQuantityText(String(clamped));
    }
  }

  function handleIncrement() {
    const next = clampQuantity(quantity + 1);
    setQuantity(next);
    setQuantityText(String(next));
  }

  function handleDecrement() {
    const next = clampQuantity(quantity - 1);
    setQuantity(next);
    setQuantityText(String(next));
  }

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);

    try {
      await reservationsService.create({
        event_id,
        ticket_quantity: quantity,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setSubmitError(err.details?.length ? BOOKING.DUPLICATE_ERROR : BOOKING.CAPACITY_ERROR);
        } else if (err.status === 400) {
          setSubmitError(BOOKING.EVENT_UNAVAILABLE);
        } else if (err.details?.length && err.message === 'Errores de validación') {
          setSubmitError(err.details[0].message);
        } else {
          setSubmitError(err.message);
        }
      } else if (err instanceof TypeError) {
        setSubmitError(ERRORS.NETWORK);
      } else {
        setSubmitError(ERRORS.GENERIC);
      }
      setSubmitting(false);
    }
  }

  if (soldOut) {
    return (
      <ThemedView style={styles.center}>
        <EmptyState icon="🎟️" title={BOOKING.SOLD_OUT} subtitle={BOOKING.SOLD_OUT_MESSAGE} />
        <View style={styles.soldOutButton}>
          <Button title={BOOKING.BACK_BUTTON} onPress={() => router.back()} />
        </View>
      </ThemedView>
    );
  }

  const timeSlot =
    formatEventTime(event.start_time) + ' - ' + formatEventTime(event.end_time);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { borderLeftColor: categoryColor }]}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
              <ThemedText style={styles.categoryBadgeText}>
                {CATEGORY.LABELS[event.category]}
              </ThemedText>
            </View>
          </View>

          <View style={styles.cardDivider} />
          <InfoRow label={EVENTS.DETAIL_DATE_LABEL} value={formatEventDate(event.date)} />
          <InfoRow label="Horario" value={timeSlot} />
          <InfoRow label={EVENTS.DETAIL_CAPACITY_LABEL} value={String(remainingCapacity)} />
        </View>

        <View style={styles.quantitySection}>
          <ThemedText style={styles.quantityLabel}>{BOOKING.TICKETS_LABEL}</ThemedText>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={[styles.stepperBtn, submitting && styles.stepperBtnDisabled]}
              onPress={handleDecrement}
              disabled={submitting || quantity <= 1}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Reducir cantidad"
            >
              <ThemedText
                style={[
                  styles.stepperBtnText,
                  (quantity <= 1 || submitting) && styles.stepperBtnTextDisabled,
                ]}
              >
                −
              </ThemedText>
            </TouchableOpacity>
            <TextInput
              style={[styles.quantityInput, submitting && styles.quantityInputDisabled]}
              value={quantityText}
              onChangeText={handleQuantityTextChange}
              onBlur={handleQuantityTextBlur}
              keyboardType="numeric"
              editable={!submitting}
              maxLength={String(remainingCapacity).length}
              selectTextOnFocus
              textAlign="center"
              accessibilityLabel={BOOKING.TICKETS_LABEL}
            />
            <TouchableOpacity
              style={[styles.stepperBtn, submitting && styles.stepperBtnDisabled]}
              onPress={handleIncrement}
              disabled={submitting || quantity >= remainingCapacity}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Aumentar cantidad"
            >
              <ThemedText
                style={[
                  styles.stepperBtnText,
                  (quantity >= remainingCapacity || submitting) && styles.stepperBtnTextDisabled,
                ]}
              >
                +
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.notesSection}>
          <Input
            label={BOOKING.NOTES_LABEL}
            placeholder={BOOKING.NOTES_PLACEHOLDER}
            value={notes}
            onChangeText={setNotes}
            maxLength={500}
            multiline
            numberOfLines={3}
            editable={!submitting}
            style={styles.notesInput}
          />
        </View>

        {submitError ? (
          <View style={styles.errorBanner}>
            <ThemedText style={styles.errorText}>{submitError}</ThemedText>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        {success ? (
          <View style={styles.successBanner}>
            <ThemedText style={styles.successText}>{BOOKING.SUCCESS_BANNER}</ThemedText>
          </View>
        ) : (
          <Button
            title={BOOKING.SUBMIT_BUTTON}
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
          />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  card: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    backgroundColor: '#FAFBFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#11181c',
    flex: 1,
    lineHeight: 24,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#EDEFF2',
    marginVertical: 8,
  },
  quantitySection: {
    marginTop: 28,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#687076',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  stepperBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#E6F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0a7ea4',
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperBtnText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  stepperBtnTextDisabled: {
    color: '#9BA1A6',
  },
  quantityInput: {
    width: 88,
    height: 52,
    marginHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#0a7ea4',
    backgroundColor: '#E6F4F8',
    fontSize: 22,
    fontWeight: '700',
    color: '#11181c',
    paddingHorizontal: 8,
  },
  quantityInputDisabled: {
    opacity: 0.5,
  },
  notesSection: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#fdecea',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  successBanner: {
    backgroundColor: '#d4edda',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  successText: {
    color: '#155724',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  soldOutButton: {
    marginTop: 24,
    width: 200,
  },
});
