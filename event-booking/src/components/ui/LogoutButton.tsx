import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useAuth } from '@/src/context/AuthContext';

interface LogoutButtonProps {
  color?: string;
}

export function LogoutButton({ color = '#11181c' }: LogoutButtonProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    router.replace('/(auth)/login?loggedOut=true');
    await logout();
  };

  return (
    <Pressable
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel="Cerrar sesión"
      onPress={handleLogout}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <IconSymbol size={22} name="rectangle.portrait.and.arrow.right" color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    marginRight: 8,
  },
});
