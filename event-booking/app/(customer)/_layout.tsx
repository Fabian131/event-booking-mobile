import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/src/components/ui/haptic-tab';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Loader } from '@/src/components/ui/Loader';
import { LogoutButton } from '@/src/components/ui/LogoutButton';
import { useAuth } from '@/src/context/AuthContext';

export default function CustomerLayout() {
  const { isAuthenticated, isBusiness, isLoading } = useAuth();

  if (isLoading) {
    return <Loader message="Restaurando sesion..." />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isBusiness) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerTitle: '',
        headerRight: () => <LogoutButton />,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Eventos',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
    </Tabs>
  );
}
