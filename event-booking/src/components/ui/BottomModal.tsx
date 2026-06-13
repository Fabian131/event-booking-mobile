import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

interface BottomModalProps {
  visible: boolean;
  title: string;
  doneLabel: string;
  onDone: () => void;
  children: ReactNode;
  onCancel?: () => void;
  cancelLabel?: string;
}

export function BottomModal({ visible, title, doneLabel, onDone, children, onCancel, cancelLabel }: BottomModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onCancel ?? onDone}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            {onCancel ? (
              <TouchableOpacity onPress={onCancel}>
                <ThemedText style={styles.cancelBtn}>{cancelLabel ?? 'Cancelar'}</ThemedText>
              </TouchableOpacity>
            ) : (
              <View />
            )}
            <ThemedText style={styles.sheetTitle}>{title}</ThemedText>
            <TouchableOpacity onPress={onDone}>
              <ThemedText style={styles.doneBtn}>{doneLabel}</ThemedText>
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 32 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ddd' },
  sheetTitle: { fontSize: 16, fontWeight: '600' },
  doneBtn: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  cancelBtn: { fontSize: 16, color: '#687076', fontWeight: '500' },
});
