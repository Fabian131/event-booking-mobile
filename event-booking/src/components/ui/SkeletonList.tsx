import { View } from 'react-native';
import { EventCardSkeleton } from '@/src/components/domain/EventCard';

interface SkeletonListProps {
  count?: number;
  gap?: number;
}

export function SkeletonList({ count = 5, gap = 16 }: SkeletonListProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={i > 0 ? { height: gap } : undefined}>
          <EventCardSkeleton />
        </View>
      ))}
    </>
  );
}
