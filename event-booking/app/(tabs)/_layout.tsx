import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/src/components/ui/haptic-tab';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Loader } from '@/src/components/ui/Loader';
import { useAuth } from '@/src/context/AuthContext';

export default function TabLayout() {
  const { isBusiness, isLoading } = useAuth();

  if (isLoading) {
    return <Loader message="Restaurando sesion..." />;
  }

  if (!isBusiness) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Eventos',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
