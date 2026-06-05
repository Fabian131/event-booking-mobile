import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { Loader } from '@/src/components/ui/Loader';

export default function IndexScreen() {
  const { isBusiness, isLoading } = useAuth();

  if (isLoading) {
    return <Loader message="Restaurando sesion..." />;
  }

  if (isBusiness) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
