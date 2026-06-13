import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { IconSymbol } from '@/src/components/ui/icon-symbol';

interface EventImageProps {
  imageUrl: string | null | undefined;
  height?: number;
}

export function EventImage({ imageUrl, height = 200 }: EventImageProps) {
  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { height }]}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View style={[styles.placeholder, { height }]}>
      <IconSymbol size={40} name="calendar" color="#9ba1a6" />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
  },
  placeholder: {
    width: '100%',
    backgroundColor: '#e8eaed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
