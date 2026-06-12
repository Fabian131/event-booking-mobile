import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { LogoutButton } from '@/src/components/ui/LogoutButton';
import { SearchHeaderButton } from '@/src/components/ui/SearchHeaderButton';
import { ADMIN, EVENTS } from '@/src/constants/ui';

export default function EventosStackLayout() {
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
          headerRight: ({ tintColor }) => (
            <View style={styles.headerActions}>
              <SearchHeaderButton color={tintColor} />
              <LogoutButton color={tintColor} />
            </View>
          ),
        }}
      />
      <Stack.Screen name="search" options={{ headerTitle: EVENTS.SEARCH_TITLE }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
