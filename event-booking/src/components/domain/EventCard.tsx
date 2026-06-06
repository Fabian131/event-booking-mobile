import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../ui/themed-text';
import type { EventSummary } from '@/src/types/event';
import { formatTimeRange } from '@/src/utils/dateHelpers';

interface EventCardProps {
  event: EventSummary;
  onPress?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  sports: '#e74c3c',
  music: '#8e44ad',
  culture: '#f39c12',
  gastronomy: '#2ecc71',
  wellness: '#1abc9c',
  education: '#3498db',
  other: '#95a5a6',
};

const CATEGORY_LABELS: Record<string, string> = {
  sports: 'Deportes',
  music: 'Música',
  culture: 'Cultura',
  gastronomy: 'Gastronomía',
  wellness: 'Bienestar',
  education: 'Educación',
  other: 'Otro',
};

export function EventCard({ event, onPress }: EventCardProps) {
  const accent = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.other;
  const label = CATEGORY_LABELS[event.category] ?? event.category;
  const spotsLeft = event.remaining_capacity;
  const isFull = spotsLeft === 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { borderLeftColor: accent }, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={event.title}
    >
      {/* Accent strip */}
      <View style={[styles.strip, { backgroundColor: accent }]} />

      <View style={styles.body}>
        {/* Top row: title + capacity */}
        <View style={styles.topRow}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {event.title}
          </ThemedText>
          <View style={[styles.capacityBadge, isFull && styles.capacityFull]}>
            <ThemedText style={[styles.capacityText, isFull && styles.capacityTextFull]}>
              {isFull ? 'Lleno' : `${spotsLeft} lugares`}
            </ThemedText>
          </View>
        </View>

        {/* Bottom row: time + category */}
        <View style={styles.bottomRow}>
          <ThemedText style={styles.time}>
            {formatTimeRange(event.start_time, event.end_time)}
          </ThemedText>
          <View style={[styles.categoryPill, { backgroundColor: `${accent}22` }]}>
            <ThemedText style={[styles.categoryText, { color: accent }]}>{label}</ThemedText>
          </View>
        </View>

        {/* Description (optional, single line) */}
        {!!event.description && (
          <ThemedText style={styles.description} numberOfLines={1}>
            {event.description}
          </ThemedText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.985 }],
  },
  strip: {
    width: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#11181c',
  },
  capacityBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  capacityFull: {
    backgroundColor: '#fdecea',
  },
  capacityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2e7d32',
  },
  capacityTextFull: {
    color: '#c62828',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  time: {
    fontSize: 12,
    color: '#687076',
  },
  categoryPill: {
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    color: '#9ba1a6',
    marginTop: 1,
  },
});
