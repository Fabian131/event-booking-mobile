import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { ThemedText } from '@/src/components/ui/themed-text';
import { EVENTS } from '@/src/constants/ui';

interface AuthGuardModalProps {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function AuthGuardModal({ visible, onClose, onLogin }: AuthGuardModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ThemedText style={styles.title}>{EVENTS.LOGIN_MODAL_TITLE}</ThemedText>
          <ThemedText style={styles.body}>{EVENTS.LOGIN_MODAL_BODY}</ThemedText>
          <Button title={EVENTS.LOGIN_MODAL_BUTTON} onPress={onLogin} style={styles.loginButton} />
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <ThemedText style={styles.cancelText}>{EVENTS.LOGIN_MODAL_CANCEL}</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#11181c',
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: '#687076',
    textAlign: 'center',
    lineHeight: 20,
  },
  loginButton: {
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
