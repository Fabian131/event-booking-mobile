import { useCallback, useEffect, useState } from 'react';
import {
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
import { ErrorBanner } from '@/src/components/ui/ErrorBanner';
import { EventCard } from '@/src/components/domain/EventCard';
import { JSDatePicker } from '@/src/components/ui/JSDatePicker';
import { ListFooterLoader } from '@/src/components/ui/ListFooterLoader';
import { SkeletonList } from '@/src/components/ui/SkeletonList';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { CATEGORY, EVENTS } from '@/src/constants/ui';
import { EVENT_CATEGORIES, type Event, type EventCategory } from '@/src/types/events';
import { useEvents, type UseEventsFilters } from '@/src/hooks/useEvents';
import { formatEventDate, formatDateParam } from '@/src/utils/dateHelpers';

const DEBOUNCE_MS = 300;

export default function AdminSearchScreen() {
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

  const cancelDate = () => {
    setDateModalVisible(false);
  };

  const clearDate = () => {
    setSelectedDate(null);
  };

  const renderItem = useCallback(
    ({ item }: { item: Event }) => (
      <EventCard
        event={item}
        variant="compact"
        onPress={() => router.push(`/(admin)/events/${item.id}`)}
      />
    ),
    [router],
  );

  const hasActiveFilters = !!(query.trim() || selectedCategory || selectedDate);

  const renderEmpty = () => {
    if (loading) return <SkeletonList count={4} />;
    if (error) return null;
    return (
      <EmptyState
        title={hasActiveFilters ? EVENTS.SEARCH_EMPTY_TITLE : EVENTS.FEED_EMPTY_TITLE}
        subtitle={hasActiveFilters ? EVENTS.SEARCH_EMPTY_SUBTITLE : EVENTS.FEED_EMPTY_SUBTITLE}
      />
    );
  };

  const listHeader = (
    <View style={styles.header}>
      <View style={styles.inputField}>
        <ThemedText type="defaultSemiBold" style={styles.filterLabel}>
          {EVENTS.SEARCH_INPUT_LABEL}
        </ThemedText>
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
      </View>

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
      {error && <ErrorBanner message={error} onRetry={refresh} />}

      <FlatList
        testID="admin-event-search-results"
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#0a7ea4" />}
        ListHeaderComponent={listHeader}
        ListFooterComponent={<ListFooterLoader loading={loading} hasItems={events.length > 0} />}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <BottomModal
        visible={dateModalVisible}
        title={EVENTS.SEARCH_DATE_MODAL_TITLE}
        doneLabel={EVENTS.CREATE_MODAL_DONE}
        onDone={confirmDate}
        onCancel={cancelDate}
        cancelLabel={EVENTS.EDIT_CONFIRM_CANCEL}
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
  inputField: {
    gap: 8,
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
});
