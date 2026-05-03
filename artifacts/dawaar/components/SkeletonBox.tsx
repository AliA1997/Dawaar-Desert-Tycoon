import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

export default function SkeletonBox({ width = '100%', height = 16, borderRadius = 8, style }: Props) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.box,
        { width: width as any, height: height as any, borderRadius, opacity },
        style as any,
      ]}
    />
  );
}

export function SkeletonGameScreen() {
  return (
    <View style={styles.screen}>
      <SkeletonBox width="60%" height={28} style={{ marginBottom: 24 }} />
      <SkeletonBox width="100%" height={320} borderRadius={16} style={{ marginBottom: 20 }} />
      <SkeletonBox width="100%" height={64} borderRadius={12} style={{ marginBottom: 12 }} />
      <SkeletonBox width="100%" height={64} borderRadius={12} style={{ marginBottom: 12 }} />
      <SkeletonBox width="80%" height={48} borderRadius={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#1F2A3A',
  },
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0A1422',
    justifyContent: 'center',
  },
});
