import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle, type DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import Colors from '@/constants/colors';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useSharedValue(0.4);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 800 }),
        withTiming(0.4, { duration: 800 }),
      ),
      -1,
      false,
    );
  }, [opacity]);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: '#1F2937' },
        animStyle,
        style as ViewStyle,
      ]}
    />
  );
}

/** Full-screen skeleton placeholder for the Game board / Lobby while loading. */
export function BoardSkeleton() {
  return (
    <View style={styles.boardWrap}>
      <View style={styles.topBar}>
        <Skeleton width={120} height={20} />
        <Skeleton width={80} height={20} />
      </View>
      <View style={styles.boardSquare}>
        <Skeleton width={'100%'} height={'100%'} borderRadius={16} />
      </View>
      <View style={styles.actionsRow}>
        <Skeleton width={'30%'} height={48} borderRadius={12} />
        <Skeleton width={'30%'} height={48} borderRadius={12} />
        <Skeleton width={'30%'} height={48} borderRadius={12} />
      </View>
    </View>
  );
}

export function LobbySkeleton() {
  return (
    <View style={styles.lobbyWrap}>
      <Skeleton width={'70%'} height={48} borderRadius={12} />
      {[0, 1, 2, 3].map(i => (
        <View key={i} style={styles.row}>
          <Skeleton width={40} height={40} borderRadius={12} />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width={'60%'} height={14} />
            <Skeleton width={'30%'} height={11} />
          </View>
          <Skeleton width={64} height={26} borderRadius={8} />
        </View>
      ))}
    </View>
  );
}

export function ChallengesSkeleton() {
  return (
    <View style={styles.lobbyWrap}>
      {[0, 1, 2].map(i => (
        <Skeleton key={i} width={'100%'} height={140} borderRadius={20} style={{ marginBottom: 12 }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  boardWrap: {
    flex: 1,
    backgroundColor: Colors.darkBg,
    padding: 16,
    gap: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boardSquare: {
    aspectRatio: 1,
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lobbyWrap: {
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
});
