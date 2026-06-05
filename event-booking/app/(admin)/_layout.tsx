import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="create-event" options={{ title: 'Nuevo Evento' }} />
    </Stack>
  );
}
