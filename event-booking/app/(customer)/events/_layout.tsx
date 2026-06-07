import { Stack } from 'expo-router';

export default function EventosStackLayout() {
  return (
    <Stack screenOptions={{ headerTitle: '' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
