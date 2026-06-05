import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { Loader } from '@/src/components/ui/Loader';
import { useAuth } from '@/src/context/AuthContext';

export default function AdminLayout() {
  const { isBusiness, isLoading } = useAuth();

  if (isLoading) {
    return <Loader message="Restaurando sesion..." />;
  }

  if (!isBusiness) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
