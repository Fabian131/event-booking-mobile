import { Redirect, Stack } from 'expo-router';

import { Loader } from '@/src/components/ui/Loader';
import { useAuth } from '@/src/context/AuthContext';

export default function AdminLayout() {
  const { isBusiness, isLoading } = useAuth();

  if (isLoading) return <Loader message="Restaurando sesión..." />;
  if (!isBusiness) return <Redirect href="/(auth)/login" />;

  return (
    <Stack>
      <Stack.Screen name="create-event" options={{ title: 'Nuevo Evento' }} />
    </Stack>
  );
}
