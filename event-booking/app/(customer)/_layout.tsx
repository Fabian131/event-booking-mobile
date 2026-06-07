import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/src/components/ui/haptic-tab';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Loader } from '@/src/components/ui/Loader';
import { useAuth } from '@/src/context/AuthContext';
import { AUTH, CUSTOMER } from '@/src/constants/ui';

export default function CustomerLayout() {
  const { isAuthenticated, isBusiness, isLoading } = useAuth();

  if (isLoading) {
    return <Loader message={AUTH.SESSION_RESTORE} />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isBusiness) {
    return <Redirect href="/(admin)" />;
  }

  return (
    <Tabs
      initialRouteName="events"
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: CUSTOMER.EVENTS_TAB,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: CUSTOMER.RESERVATIONS_TAB,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
    </Tabs>
  );
}
