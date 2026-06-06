import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image } from 'expo-image';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/src/components/domain/EventCard';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Loader } from '@/src/components/ui/Loader';
import { ThemedText } from '@/src/components/ui/themed-text';
import { ThemedView } from '@/src/components/ui/themed-view';
import { useAuth } from '@/src/context/AuthContext';
import { useEventDetail } from '@/src/hooks/useEventDetail';

function formatDate(d: string): string {
  const [year, month, day] = d.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(t: string): string {
  return t.slice(0, 5);
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={infoStyles.row}>
      <View style={infoStyles.textGroup}>
        <ThemedText style={infoStyles.label}>{label}</ThemedText>
        <ThemedText style={infoStyles.value}>{value}</ThemedText>
      </View>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    paddingVertical: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9BA1A6',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: '#11181c',
    fontWeight: '500',
  },
});

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { event, loading, error } = useEventDetail(id);
  const [modalVisible, setModalVisible] = useState(false);

  if (loading) {
    return <Loader message="Cargando evento..." />;
  }

  if (error || !event) {
    return (
      <ThemedView style={styles.center}>
        <EmptyState icon="⚠️" title={error ?? 'Evento no encontrado'} />
      </ThemedView>
    );
  }

  function handleBook() {
    if (!isAuthenticated) {
      setModalVisible(true);
      return;
    }
    // TODO: replace with reservation form route once implemented
    router.push('/(customer)/reservations');
  }

  const categoryColor = CATEGORY_COLORS[event.category];
  const categoryLabel = CATEGORY_LABELS[event.category];
  const capacityPct = event.max_capacity > 0
    ? Math.round((event.remaining_capacity / event.max_capacity) * 100)
    : 0;

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
            <InfoRow label="Fecha" value={formatDate(event.date)} />
            <View style={styles.divider} />
            <InfoRow label="Hora de inicio" value={formatTime(event.start_time)} />
            <View style={styles.divider} />
            <InfoRow label="Hora de fin" value={formatTime(event.end_time)} />
            <View style={styles.divider} />
            <InfoRow
              label="Cupos disponibles"
              value={`${event.remaining_capacity} de ${event.max_capacity} (${capacityPct}%)`}
            />
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
        <Button title="Reservar" onPress={handleBook} />
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <ThemedText style={styles.modalTitle}>
              Inicia sesión para continuar
            </ThemedText>
            <ThemedText style={styles.modalBody}>
              Necesitas una cuenta para reservar este evento.
            </ThemedText>
            <Button
              title="Iniciar sesión"
              onPress={() => {
                setModalVisible(false);
                router.push('/(auth)/login');
              }}
              style={styles.modalButton}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <ThemedText style={styles.cancelText}>Cancelar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#11181c',
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    marginTop: 4,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 14,
    color: '#687076',
  },
});
