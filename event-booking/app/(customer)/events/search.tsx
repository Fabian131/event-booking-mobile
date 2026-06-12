import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BottomModal } from '@/src/components/ui/BottomModal';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { EventCard, EventCardSkeleton } from '@/src/components/domain/EventCard';
import { JSDatePicker } from '@/src/components/ui/JSDatePicker';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { CATEGORY, EVENTS } from '@/src/constants/ui';
import { EVENT_CATEGORIES, type Event, type EventCategory } from '@/src/types/events';
import { useEvents, type UseEventsFilters } from '@/src/hooks/useEvents';
import { formatEventDate } from '@/src/utils/dateHelpers';

const DEBOUNCE_MS = 300;
const SKELETON_COUNT = 4;

function formatDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

export default function EventSearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [debouncedFilters, setDebouncedFilters] = useState<UseEventsFilters>({});

  const selectedDateParam = selectedDate ? formatDateParam(selectedDate) : undefined;
  const { events, loading, refreshing, error, loadMore, refresh } = useEvents(debouncedFilters);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedQuery = query.trim();
      setDebouncedFilters({
        ...(trimmedQuery ? { search: trimmedQuery } : {}),
        ...(selectedCategory ? { category: selectedCategory } : {}),
        ...(selectedDateParam ? { date: selectedDateParam } : {}),
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, selectedCategory, selectedDateParam]);

  const openDateModal = () => {
    setPickerDate(selectedDate ?? new Date());
    setDateModalVisible(true);
  };

  const confirmDate = () => {
    setSelectedDate(pickerDate);
    setDateModalVisible(false);
  };

  const clearDate = () => {
    setSelectedDate(null);
  };

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
        title={EVENTS.SEARCH_EMPTY_TITLE}
        subtitle={EVENTS.SEARCH_EMPTY_SUBTITLE}
      />
    );
  };

  const listHeader = (
    <View style={styles.header}>
      <ThemedText type="title" style={styles.title}>
        {EVENTS.SEARCH_TITLE}
      </ThemedText>
      <ThemedText style={styles.subtitle}>{EVENTS.SEARCH_SUBTITLE}</ThemedText>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={EVENTS.SEARCH_INPUT_PLACEHOLDER}
        placeholderTextColor="#9ba1a6"
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel={EVENTS.SEARCH_INPUT_ACCESSIBILITY}
        style={styles.searchInput}
        returnKeyType="search"
      />

      <View style={styles.filterGroup}>
        <ThemedText type="defaultSemiBold" style={styles.filterLabel}>
          {EVENTS.SEARCH_CATEGORY_LABEL}
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <TouchableOpacity
            style={[styles.chip, !selectedCategory && styles.chipSelected]}
            onPress={() => setSelectedCategory(undefined)}
            accessibilityRole="button"
          >
            <ThemedText style={[styles.chipText, !selectedCategory && styles.chipTextSelected]}>
              {EVENTS.SEARCH_ALL_CATEGORIES}
            </ThemedText>
          </TouchableOpacity>
          {EVENT_CATEGORIES.map((category) => {
            const selected = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.chip,
                  selected && styles.chipSelected,
                  selected && { borderColor: CATEGORY.COLORS[category] },
                ]}
                onPress={() => setSelectedCategory(selected ? undefined : category)}
                accessibilityRole="button"
              >
                <ThemedText style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {CATEGORY.LABELS[category]}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.filterGroup}>
        <ThemedText type="defaultSemiBold" style={styles.filterLabel}>
          {EVENTS.SEARCH_DATE_LABEL}
        </ThemedText>
        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateButton} onPress={openDateModal} accessibilityRole="button">
            <ThemedText style={selectedDateParam ? styles.dateText : styles.datePlaceholder}>
              {selectedDateParam ? formatEventDate(selectedDateParam) : EVENTS.SEARCH_ANY_DATE}
            </ThemedText>
          </TouchableOpacity>
          {selectedDate && (
            <TouchableOpacity style={styles.clearDateButton} onPress={clearDate} accessibilityRole="button">
              <ThemedText style={styles.clearDateText}>{EVENTS.SEARCH_CLEAR_DATE}</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ThemedText type="defaultSemiBold" style={styles.resultsLabel}>
        {EVENTS.SEARCH_RESULTS_LABEL}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {error && (
        <View style={styles.errorBanner}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity onPress={refresh} style={styles.retryButton}>
            <ThemedText style={styles.retryText}>{EVENTS.FEED_ERROR_RETRY}</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        testID="event-search-results"
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#0a7ea4" />}
        ListHeaderComponent={listHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <BottomModal
        visible={dateModalVisible}
        title={EVENTS.SEARCH_DATE_MODAL_TITLE}
        doneLabel={EVENTS.CREATE_MODAL_DONE}
        onDone={confirmDate}
      >
        <JSDatePicker value={pickerDate} onChange={setPickerDate} />
      </BottomModal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    flexGrow: 1,
  },
  header: {
    paddingBottom: 16,
    gap: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d5d9dc',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#11181c',
    backgroundColor: '#fff',
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    color: '#11181c',
  },
  chips: {
    gap: 8,
    paddingRight: 24,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#d5d9dc',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  chipSelected: {
    borderColor: '#0a7ea4',
    backgroundColor: '#e7f5f9',
  },
  chipText: {
    fontSize: 14,
    color: '#687076',
  },
  chipTextSelected: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d5d9dc',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    color: '#11181c',
  },
  datePlaceholder: {
    color: '#687076',
  },
  clearDateButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  clearDateText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  resultsLabel: {
    marginTop: 4,
    color: '#11181c',
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
  title: {
    color: '#11181c',
  },
  subtitle: {
    color: '#687076',
    lineHeight: 20,
  },
});
