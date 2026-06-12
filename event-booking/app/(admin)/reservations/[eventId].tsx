import { useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Loader } from '@/src/components/ui/Loader';
import { ReservationItem } from '@/src/components/domain/ReservationItem';
import { useReservations } from '@/src/hooks/useReservations';
import { RESERVATIONS } from '@/src/constants/ui';

export default function ReservationsListScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const {
    reservations,
    loading,
    error,
    search,
    cancellingId,
    onSearchChange,
    cancelReservation,
    loadReservations,
  } = useReservations(eventId);

  useEffect(() => {
    loadReservations('');
  }, [loadReservations]);

  const handleCancel = useCallback(async (reservationId: string) => {
    await cancelReservation(reservationId);
  }, [cancelReservation]);

  const renderItem = useCallback(({ item }: { item: typeof reservations[number] }) => (
    <ReservationItem
      reservation={item}
      cancelling={cancellingId === item.id}
      onCancel={() => handleCancel(item.id)}
    />
  ), [cancellingId, handleCancel]);

  const renderContent = () => {
    if (loading && reservations.length === 0) {
      return <Loader message={RESERVATIONS.LIST_LOADING} />;
    }
    if (error && reservations.length === 0) {
      return (
        <View style={styles.errorBanner}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      );
    }
    if (!loading && reservations.length === 0) {
      return (
        <EmptyState
          title={RESERVATIONS.LIST_EMPTY_TITLE}
          subtitle={RESERVATIONS.LIST_EMPTY_SUBTITLE}
        />
      );
    }
    return null;
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#687076" />
        <TextInput
          style={styles.searchInput}
          placeholder={RESERVATIONS.SEARCH_PLACEHOLDER}
          placeholderTextColor="#9ba1a6"
          value={search}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearIcon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="close" size={18} color="#687076" />
          </TouchableOpacity>
        )}
      </View>

      {error && reservations.length > 0 && (
        <View style={styles.errorBanner}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#11181c',
    paddingVertical: 0,
  },
  clearIcon: {
    padding: 4,
  },
  list: {
    padding: 12,
    paddingTop: 4,
    flexGrow: 1,
  },
  errorBanner: {
    backgroundColor: '#fdecea',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
  },
});
