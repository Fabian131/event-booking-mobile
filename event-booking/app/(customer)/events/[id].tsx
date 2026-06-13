import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image } from 'expo-image';
import { CATEGORY, EVENTS } from '@/src/constants/ui';
import { AuthGuardModal } from '@/src/components/domain/AuthGuardModal';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Loader } from '@/src/components/ui/Loader';
import { InfoRow } from '@/src/components/ui/InfoRow';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { useAuth } from '@/src/context/AuthContext';
import { useEventDetail } from '@/src/hooks/useEventDetail';
import { formatEventDate, formatEventTime } from '@/src/utils/dateHelpers';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { event, loading, error } = useEventDetail(id);
  const [modalVisible, setModalVisible] = useState(false);

  if (loading) {
    return <Loader message={EVENTS.DETAIL_LOADING} />;
  }

  if (error || !event) {
    return (
      <ThemedView style={styles.center}>
        <EmptyState icon="⚠️" title={error ?? EVENTS.DETAIL_NOT_FOUND} />
      </ThemedView>
    );
  }

  const handleBook = () => {
    if (!isAuthenticated) {
      setModalVisible(true);
      return;
    }
    router.push({ pathname: '/(customer)/events/book', params: { event_id: event.id } });
  };

  const categoryColor = CATEGORY.COLORS[event.category];
  const categoryLabel = CATEGORY.LABELS[event.category];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Image
          source={event.image_url ? { uri: event.image_url } : null}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <ThemedText style={styles.title}>{event.title}</ThemedText>
            <View style={[styles.badge, { backgroundColor: categoryColor }]}>
              <ThemedText style={styles.badgeText}>{categoryLabel}</ThemedText>
            </View>
          </View>

          <View>
            <InfoRow label={EVENTS.DETAIL_DATE_LABEL} value={formatEventDate(event.date)} />
            <View style={styles.divider} />
            <InfoRow label={EVENTS.DETAIL_START_LABEL} value={formatEventTime(event.start_time)} />
            <View style={styles.divider} />
            <InfoRow label={EVENTS.DETAIL_END_LABEL} value={formatEventTime(event.end_time)} />
            <View style={styles.divider} />
            <InfoRow label={EVENTS.DETAIL_CAPACITY_LABEL} value={String(event.remaining_capacity)} />
          </View>

          {event.description ? (
            <>
              <View style={styles.divider} />
              <ThemedText style={styles.description}>{event.description}</ThemedText>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={EVENTS.DETAIL_BOOK_BUTTON} onPress={handleBook} />
      </View>

      <AuthGuardModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLogin={() => {
          setModalVisible(false);
          router.push('/(auth)/login');
        }}
      />
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
  image: {
    width: '100%',
    height: 280,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#11181c',
    lineHeight: 34,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  description: {
    fontSize: 15,
    color: '#687076',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
});
