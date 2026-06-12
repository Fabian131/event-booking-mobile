import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface ListFooterLoaderProps {
  loading: boolean;
  hasItems?: boolean;
}

export function ListFooterLoader({ loading, hasItems = true }: ListFooterLoaderProps) {
  if (!loading || !hasItems) return null;
  return (
    <View style={styles.footer}>
      <ActivityIndicator size="small" color="#0a7ea4" />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
});
