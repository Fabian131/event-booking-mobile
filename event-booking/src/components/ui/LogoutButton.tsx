import { Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useAuth } from '@/src/context/AuthContext';

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <Pressable
      style={styles.button}
      onPress={() => logout()}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityLabel="Cerrar sesion"
    >
      <IconSymbol size={22} name="rectangle.portrait.and.arrow.right" color="#11181c" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});
