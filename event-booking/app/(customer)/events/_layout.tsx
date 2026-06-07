import { Stack } from 'expo-router';
import { LogoutButton } from '@/src/components/ui/LogoutButton';

export default function EventosStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerRight: ({ tintColor }) => <LogoutButton color={tintColor} />,
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: 'Eventos' }} />
    </Stack>
  );
}
