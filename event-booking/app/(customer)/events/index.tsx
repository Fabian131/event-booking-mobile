import { useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { EventCard } from '@/src/components/domain/EventCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorBanner } from '@/src/components/ui/ErrorBanner';
import { ListFooterLoader } from '@/src/components/ui/ListFooterLoader';
import { SkeletonList } from '@/src/components/ui/SkeletonList';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { EVENTS } from '@/src/constants/ui';
import { useEvents } from '@/src/hooks/useEvents';
import type { Event } from '@/src/types/events';

function ListHeader() {
  return (
    <ThemedView style={styles.listHeader}>
      <ThemedText>Explora los eventos disponibles</ThemedText>
    </ThemedView>
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

  const renderEmpty = () => {
    if (loading) return <SkeletonList />;
    if (error) return null;
    return (
      <EmptyState
        icon="📅"
        title={EVENTS.FEED_EMPTY_TITLE}
        subtitle={EVENTS.FEED_EMPTY_SUBTITLE}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      {error && <ErrorBanner message={error} onRetry={refresh} />}

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
        ListHeaderComponent={ListHeader}
        ListFooterComponent={<ListFooterLoader loading={loading} hasItems={events.length > 0} />}
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
  listHeader: {
    paddingBottom: 8,
    paddingTop: 4,
    backgroundColor: '#f5f5f5',
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

});
