import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { EVENTS } from '@/src/constants/ui';

interface SearchHeaderButtonProps {
  color?: string;
}

export function SearchHeaderButton({ color = '#11181c' }: SearchHeaderButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={EVENTS.SEARCH_ACCESSIBILITY}
      onPress={() => router.push('/(customer)/events/search')}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <IconSymbol size={22} name="magnifyingglass" color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});
