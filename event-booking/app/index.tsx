import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';

export default function IndexScreen() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/" />;
  }

  return <Redirect href="/(auth)/login" />;
}
