import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ADMIN, CATEGORY, EVENTS } from '@/src/constants/ui';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { InfoRow } from '@/src/components/ui/InfoRow';
import { Loader } from '@/src/components/ui/Loader';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { useEventDetail } from '@/src/hooks/useEventDetail';
import { formatEventDate, formatEventTime } from '@/src/utils/dateHelpers';

export default function AdminEventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { event, loading, error } = useEventDetail(id);

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

  const categoryColor = CATEGORY.COLORS[event.category];
  const categoryLabel = CATEGORY.LABELS[event.category];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: '' }} />

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
            <InfoRow label={ADMIN.DETAIL_MAX_CAPACITY_LABEL} value={String(event.max_capacity)} />
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
        <Button
          title={ADMIN.DETAIL_EDIT_BUTTON}
          variant="secondary"
          style={styles.footerButton}
          onPress={() => router.push(`/(admin)/edit-event/${id}`)}
        />
        <Button
          title={ADMIN.DETAIL_RESERVATIONS_BUTTON}
          style={styles.footerButton}
          onPress={() =>
            router.push({
              pathname: '/(admin)/events/[id]/reservations',
              params: { id },
            })
          }
        />
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
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerButton: {
    flex: 1,
  },
});
