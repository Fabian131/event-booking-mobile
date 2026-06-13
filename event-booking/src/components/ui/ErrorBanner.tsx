import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/src/components/ui/themed-text';
import { EVENTS } from '@/src/constants/ui';

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
}

export function ErrorBanner({ message, onRetry, retryLabel = EVENTS.FEED_ERROR_RETRY }: ErrorBannerProps) {
  return (
    <View style={styles.banner}>
      <ThemedText style={styles.text}>{message}</ThemedText>
      <TouchableOpacity onPress={onRetry} style={styles.button}>
        <ThemedText style={styles.buttonText}>{retryLabel}</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
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
  text: {
    flex: 1,
    fontSize: 14,
    color: '#dc3545',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#dc3545',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
});
