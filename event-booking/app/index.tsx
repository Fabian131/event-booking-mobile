import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { Loader } from '@/src/components/ui/Loader';

export default function IndexScreen() {
  const { isAuthenticated, isBusiness, isLoading } = useAuth();

  if (isLoading) {
    return <Loader message="Restaurando sesión..." />;
  }

  if (isBusiness) {
    return <Redirect href="/(admin)" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(customer)/events" />;
  }

  return <Redirect href="/(auth)/login" />;
}
