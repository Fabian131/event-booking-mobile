import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../ui/themed-text';
import type { EventSummary } from '@/src/types/event';
import { formatTimeRange, getSlotHeight } from '@/src/utils/dateHelpers';

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

export function EventCard({ event, onPress }: EventCardProps) {
  const slotHeight = getSlotHeight(event.start_time, event.end_time);
  const accent = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { minHeight: slotHeight, borderLeftColor: accent },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={event.title}
    >
      <View style={styles.timeColumn}>
        <ThemedText style={styles.timeText}>
          {formatTimeRange(event.start_time, event.end_time)}
        </ThemedText>
      </View>
      <View style={styles.contentColumn}>
        <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={1}>
          {event.title}
        </ThemedText>
        {event.description ? (
          <ThemedText style={styles.description} numberOfLines={1}>
            {event.description}
          </ThemedText>
        ) : null}
        <View style={styles.metaRow}>
          <View style={[styles.categoryBadge, { backgroundColor: accent }]}>
            <ThemedText style={styles.categoryText}>{event.category}</ThemedText>
          </View>
          <ThemedText style={styles.capacityText}>
            {event.remaining_capacity}/{event.max_capacity}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.8,
  },
  timeColumn: {
    width: 88,
    paddingVertical: 12,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#687076',
    lineHeight: 18,
  },
  contentColumn: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  title: {
    fontSize: 15,
  },
  description: {
    fontSize: 13,
    color: '#687076',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  capacityText: {
    fontSize: 12,
    color: '#9ba1a6',
  },
});
