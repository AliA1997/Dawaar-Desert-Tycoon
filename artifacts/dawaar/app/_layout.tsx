import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GameProvider } from "@/context/GameContext";
import { initializeRevenueCat, SubscriptionProvider } from "@/lib/revenuecat";

// Rejects if the splash screen has already gone; that is not an error worth
// crashing a launch over.
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="lobby" />
      <Stack.Screen name="game" />
      <Stack.Screen name="challenges" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Third-party SDKs initialize *after* the first frame, never during module
  // evaluation (R-65). Purchases are not needed to draw the home screen, and a
  // throw at import time is a crash on launch — the one defect class that
  // cannot be hot-fixed once a binary is in a store. A failure here degrades to
  // "no paywall" instead of an alert in front of a user who has not seen the
  // app yet.
  useEffect(() => {
    try {
      initializeRevenueCat();
    } catch (err) {
      console.warn("RevenueCat unavailable:", err);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SubscriptionProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <GameProvider>
                <RootLayoutNav />
              </GameProvider>
            </GestureHandlerRootView>
          </SubscriptionProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
