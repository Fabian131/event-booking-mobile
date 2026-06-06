import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { EventCard, EventCardSkeleton } from '@/src/components/domain/EventCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { useEvents } from '@/src/hooks/useEvents';
import type { Event } from '@/src/types/events';

const SKELETON_COUNT = 5;

function SkeletonList() {
  return (
    <>
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <View key={i} style={i > 0 ? styles.separator : undefined}>
          <EventCardSkeleton />
        </View>
      ))}
    </>
  );
}

export default function CustomerEventsScreen() {
  const router = useRouter();
  const { events, loading, refreshing, error, loadMore, refresh } = useEvents();

  const renderItem = useCallback(
    ({ item }: { item: Event }) => (
      <EventCard
        event={item}
        onPress={() => router.push({ pathname: '/(customer)/events/[id]', params: { id: item.id } })}
      />
    ),
    [router],
  );

  const Separator = useCallback(() => <View style={styles.separator} />, []);

  const renderFooter = () => {
    if (!loading || events.length === 0) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#0a7ea4" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return <SkeletonList />;
    if (error) return null;
    return (
      <EmptyState
        icon="📅"
        title="Sin eventos por ahora"
        subtitle="Vuelve pronto para descubrir nuevas actividades."
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Eventos</ThemedText>
        <ThemedText>Explora los eventos disponibles</ThemedText>
      </ThemedView>

      {error && (
        <View style={styles.errorBanner}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity onPress={refresh} style={styles.retryButton}>
            <ThemedText style={styles.retryText}>Reintentar</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        testID="events-list"
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#0a7ea4" />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={Separator}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    gap: 4,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    flexGrow: 1,
  },
  separator: {
    height: 16,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff3f3',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#dc3545',
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dc3545',
    borderRadius: 8,
  },
  retryText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
});
