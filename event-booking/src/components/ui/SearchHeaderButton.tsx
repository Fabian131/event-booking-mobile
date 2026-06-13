import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { EVENTS } from '@/src/constants/ui';

interface SearchHeaderButtonProps {
  color?: string;
  href?: Href;
}

export function SearchHeaderButton({ color = '#11181c', href = '/(customer)/events/search' }: SearchHeaderButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={EVENTS.SEARCH_ACCESSIBILITY}
      onPress={() => router.push(href)}
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
