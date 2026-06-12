import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { ThemedText } from '@/src/components/ui/themed-text';
import { extractTime } from '@/src/utils/dateHelpers';
import type { Event } from '@/src/types/events';
import { CATEGORY, EVENTS } from '@/src/constants/ui';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
  variant?: 'default' | 'compact';
}

export function EventCard({ event, onPress, variant = 'default' }: EventCardProps) {
  const categoryColor = CATEGORY.COLORS[event.category];
  const isCompact = variant === 'compact';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isCompact ? styles.cardCompact : styles.cardDefault,
        isCompact && { borderLeftColor: categoryColor, borderLeftWidth: 4 }
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {!isCompact && (
        <View style={styles.imageContainer}>
          <Image
            source={event.image_url ? { uri: event.image_url } : null}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
          <View style={[styles.badge, { backgroundColor: categoryColor }]}>
            <ThemedText style={styles.badgeText}>{CATEGORY.LABELS[event.category]}</ThemedText>
          </View>
        </View>
      )}

      <View style={[styles.body, isCompact && styles.bodyCompact]}>
        <View style={styles.titleRow}>
          <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={isCompact ? 1 : 2}>
            {event.title}
          </ThemedText>
          {isCompact && (
            <View style={[styles.badgeCompact, { backgroundColor: categoryColor }]}>
              <ThemedText style={styles.badgeTextCompact}>{CATEGORY.LABELS[event.category]}</ThemedText>
            </View>
          )}
        </View>
        {event.description && !isCompact && (
          <ThemedText style={styles.description} numberOfLines={2}>
            {event.description}
          </ThemedText>
        )}
        {isCompact && (
          <ThemedText style={styles.description} numberOfLines={1}>
            {extractTime(event.start_time)} - {extractTime(event.end_time)}
            {' • '}
            {event.remaining_capacity === 0
              ? EVENTS.CAPACITY_FULL
              : `${event.remaining_capacity} ${event.remaining_capacity === 1 ? EVENTS.CAPACITY_SLOT : EVENTS.CAPACITY_SLOTS}`
            }
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function EventCardSkeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.imageContainer}>
        <View style={[styles.image, styles.skeletonBlock]} />
        <View style={[styles.badge, styles.skeletonBadge]} />
      </View>
      <View style={styles.body}>
        <View style={[styles.skeletonBlock, styles.skeletonTitle]} />
        <View style={[styles.skeletonBlock, styles.skeletonLine]} />
        <View style={[styles.skeletonBlock, styles.skeletonLineShort]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDefault: {
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
  },
  body: {
    padding: 16,
    gap: 8,
  },
  cardCompact: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'visible',
  },
  bodyCompact: {
    padding: 12,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeTextCompact: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    color: '#11181c',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#687076',
    lineHeight: 20,
  },
  skeletonBlock: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  skeletonBadge: {
    width: 80,
    height: 24,
    borderRadius: 20,
  },
  skeletonTitle: {
    width: '75%',
    height: 20,
  },
  skeletonLine: {
    width: '100%',
    height: 14,
  },
  skeletonLineShort: {
    width: '55%',
    height: 14,
  },
});
