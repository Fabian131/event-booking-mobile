import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Loader } from '@/src/components/ui/Loader';
import { LogoutButton } from '@/src/components/ui/LogoutButton';
import { SearchHeaderButton } from '@/src/components/ui/SearchHeaderButton';
import { useAuth } from '@/src/context/AuthContext';
import { AUTH, ADMIN, EVENTS, RESERVATIONS } from '@/src/constants/ui';

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
        headerTitle: ADMIN.HEADER_TITLE,
        headerTitleStyle: {
          fontSize: 22,
          fontWeight: '900',
          color: '#0a7ea4',
        },
        headerRight: ({ tintColor }) => <LogoutButton color={tintColor} />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: ADMIN.CALENDAR_TITLE,
          headerRight: ({ tintColor }) => (
            <View style={styles.headerActions}>
              <SearchHeaderButton color={tintColor} href="/(admin)/search" />
              <LogoutButton color={tintColor} />
            </View>
          ),
        }}
      />
      <Stack.Screen name="search" options={{ headerTitle: EVENTS.SEARCH_TITLE }} />
      <Stack.Screen name="create-event" options={{ title: EVENTS.CREATE_TITLE }} />
      <Stack.Screen name="edit-event/[id]" options={{ title: EVENTS.EDIT_TITLE }} />
      <Stack.Screen name="events/[id]" />
      <Stack.Screen name="reservations/[id]" options={{ title: RESERVATIONS.LIST_TITLE }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
