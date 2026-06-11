import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { Loader } from '@/src/components/ui/Loader';
import { AUTH } from '@/src/constants/ui';

export default function IndexScreen() {
  const { isAuthenticated, isBusiness, isLoading } = useAuth();

  if (isLoading) {
    return <Loader message={AUTH.SESSION_RESTORE} />;
  }

  if (isBusiness) {
    return <Redirect href="/(admin)" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(customer)/events" />;
  }

  return <Redirect href="/(auth)/login" />;
}
