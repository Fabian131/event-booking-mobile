import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
import { ThemedText } from '@/src/components/ui/themed-text';
import type { EventCategory, Event } from '@/src/types/events';

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  sports: '#2196F3',
  music: '#9C27B0',
  culture: '#FF9800',
  gastronomy: '#F44336',
  wellness: '#4CAF50',
  education: '#00BCD4',
  other: '#607D8B',
};

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  sports: 'Deportes',
  music: 'Música',
  culture: 'Cultura',
  gastronomy: 'Gastronomía',
  wellness: 'Bienestar',
  education: 'Educación',
  other: 'Otro',
};

interface EventCardProps {
  event: Event;
  onPress?: () => void;
}

export function EventCard({ event, onPress }: EventCardProps) {
  const categoryColor = CATEGORY_COLORS[event.category];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        <Image
          source={event.image_url ? { uri: event.image_url } : null}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
        <View style={[styles.badge, { backgroundColor: categoryColor }]}>
          <ThemedText style={styles.badgeText}>{CATEGORY_LABELS[event.category]}</ThemedText>
        </View>
      </View>
      <View style={styles.body}>
        <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={2}>
          {event.title}
        </ThemedText>
        {event.description && (
          <ThemedText style={styles.description} numberOfLines={2}>
            {event.description}
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
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
  title: {
    fontSize: 18,
    color: '#11181c',
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
