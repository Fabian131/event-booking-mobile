import { Stack } from 'expo-router';
import { BackButton } from '@/src/components/ui/BackButton';

export default function EventosStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitle: '',
        headerLeft: () => <BackButton />,
      }}
    />
  );
}
