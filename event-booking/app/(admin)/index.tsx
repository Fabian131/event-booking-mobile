import { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { Button } from '@/src/components/ui/Button';
import { BottomModal } from '@/src/components/ui/BottomModal';
import { Loader } from '@/src/components/ui/Loader';
import { useEvents } from '@/src/hooks/useEvents';
import type { Event } from '@/src/types/events';
import { ADMIN } from '@/src/constants/ui';

export default function AdminCalendarScreen() {
  const router = useRouter();
  const { events, loading: loadingEvents } = useEvents();
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<Event | null>(null);

  function handleSelect(evt: Event) {
    setSelected(evt);
    setModalVisible(false);
    router.push(`/(admin)/edit-event/${evt.id}`);
  }

  const selectorLabel = selected
    ? selected.title
    : ADMIN.EDIT_EVENT_PLACEHOLDER;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">{ADMIN.CALENDAR_TITLE}</ThemedText>
        <ThemedText>{ADMIN.CALENDAR_SUBTITLE}</ThemedText>
      </ThemedView>

      <View style={{ marginTop: 20, gap: 16 }}>
        <Link href="/(admin)/create-event" asChild>
          <Button title={ADMIN.CREATE_EVENT_NAV} onPress={() => {}} />
        </Link>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setModalVisible(true)}
          accessibilityLabel="Seleccionar evento para editar"
          accessibilityRole="button"
        >
          <ThemedText style={selected ? undefined : styles.selectorPh}>
            {selectorLabel}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <BottomModal
        visible={modalVisible}
        title={ADMIN.EDIT_EVENT_MODAL_TITLE}
        onDone={() => setModalVisible(false)}
      >
        {loadingEvents ? (
          <Loader message={ADMIN.EDIT_EVENT_LOADING} />
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.optRow}
                onPress={() => handleSelect(item)}
              >
                <ThemedText style={styles.optTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.optMeta}>
                  {item.date}  {'  '}  {item.category}
                </ThemedText>
              </TouchableOpacity>
            )}
          />
        )}
      </BottomModal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    gap: 8,
    marginBottom: 24,
  },
  selector: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  selectorPh: {
    color: '#999',
  },
  optRow: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  optTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  optMeta: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
