import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { Loader } from '@/src/components/ui/Loader';
import { LogoutButton } from '@/src/components/ui/LogoutButton';
import { useAuth } from '@/src/context/AuthContext';

export default function AdminLayout() {
  const { isBusiness, isLoading } = useAuth();

  if (isLoading) {
    return <Loader message="Restaurando sesión..." />;
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
        headerRight: ({ tintColor }) => <LogoutButton  color={tintColor} />,
      }}
    />
  );
}
