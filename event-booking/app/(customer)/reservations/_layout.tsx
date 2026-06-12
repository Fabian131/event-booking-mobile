import { Stack } from 'expo-router';
import { LogoutButton } from '@/src/components/ui/LogoutButton';
import { CUSTOMER } from '@/src/constants/ui';

export default function ReservationsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerRight: ({ tintColor }) => <LogoutButton color={tintColor} />,
      }}
    >
      <Stack.Screen name="index" options={{ headerTitle: CUSTOMER.RESERVATIONS_TITLE }} />
    </Stack>
  );
}
