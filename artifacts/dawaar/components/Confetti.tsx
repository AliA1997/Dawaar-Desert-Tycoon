import React, { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
} from 'react-native-reanimated';

// Reanimated-based confetti burst for the win celebration (F13). No extra
// dependency — pieces fall, drift, and spin on the UI thread.

const COLORS = ['#F43F5E', '#6366F1', '#14B8A6', '#A855F7', '#FB923C', '#FDE047', '#C9A84C'];

function ConfettiPiece({
  index, count, width, height,
}: {
  index: number;
  count: number;
  width: number;
  height: number;
}) {
  // Deterministic-ish spread so pieces start across the full width.
  const startX = useMemo(() => (width / count) * index + (Math.random() * 24 - 12), [index, count, width]);
  const driftX = useMemo(() => Math.random() * 80 - 40, []);
  const size = useMemo(() => 6 + Math.random() * 8, []);
  const color = COLORS[index % COLORS.length];
  const delay = useMemo(() => Math.random() * 600, []);
  const duration = useMemo(() => 2200 + Math.random() * 1600, []);
  const rounded = index % 3 === 0;

  const progress = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withRepeat(
      withTiming(1, { duration, easing: Easing.linear }),
      -1,
      false,
    ));
    spin.value = withRepeat(
      withTiming(1, { duration: 700 + Math.random() * 600, easing: Easing.linear }),
      -1,
      false,
    );
  }, [progress, spin, delay, duration]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: -20 + progress.value * (height + 40) },
      { translateX: progress.value * driftX },
      { rotate: `${spin.value * 360}deg` },
    ],
    opacity: 1 - progress.value * 0.25,
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: startX,
          width: size,
          height: size * (rounded ? 1 : 1.6),
          backgroundColor: color,
          borderRadius: rounded ? size / 2 : 2,
        },
        style,
      ]}
    />
  );
}

export default function Confetti({ count = 90 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map(i => (
        <ConfettiPiece key={i} index={i} count={count} width={width} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', top: 0 },
});
