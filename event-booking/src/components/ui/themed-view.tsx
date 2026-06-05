import type { ViewProps } from 'react-native';
import { View } from 'react-native';

export function ThemedView({ style, ...rest }: ViewProps) {
  return <View style={[{ backgroundColor: '#fff' }, style]} {...rest} />;
}
