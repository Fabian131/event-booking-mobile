import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { Loader } from '@/src/components/ui/Loader';
import { LogoutButton } from '@/src/components/ui/LogoutButton';
import { useAuth } from '@/src/context/AuthContext';
import { AUTH } from '@/src/constants/ui';

export default function AdminLayout() {
  const { isBusiness, isLoading } = useAuth();

  if (isLoading) {
    return <Loader message={AUTH.SESSION_RESTORE} />;
  }

  if (!isBusiness) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerTitle: 'Event Booking',
        headerTitleStyle: {
          fontSize: 22,
          fontWeight: '900',
          color: '#0a7ea4',
        },
        headerRight: ({ tintColor }) => <LogoutButton color={tintColor} />,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Calendario' }} />
      <Stack.Screen name="create-event" options={{ title: 'Nuevo Evento' }} />
      <Stack.Screen name="edit-event/[id]" options={{ title: 'Editar Evento' }} />
    </Stack>
  );
}
