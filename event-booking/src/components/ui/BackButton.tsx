import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/src/components/ui/icon-symbol';

interface BackButtonProps {
  color?: string;
  onPress?: () => void;
}

export function BackButton({ color = '#11181c', onPress }: BackButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel="Volver"
      onPress={onPress ?? (() => router.back())}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <IconSymbol size={22} name="chevron.left" color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});
