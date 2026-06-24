// ─────────────────────────────────────────────────────────────────────────────
// RevenueCat integration — TEMPORARILY DISABLED
//
// The real implementation imported `react-native-purchases` and wired up
// in-app subscriptions. It has been stubbed to a no-op so the app builds
// and runs without RevenueCat configured. Restore from git history when
// re-enabling. All exports keep the same signatures so call sites
// (_layout.tsx, index.tsx, game.tsx, SubscribeModal.tsx) work unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useMemo } from 'react';

export const REVENUECAT_ENTITLEMENT_IDENTIFIER = 'premium';

export function initializeRevenueCat() {
  // no-op — RevenueCat disabled
  console.log('RevenueCat disabled (stub)');
}

type SubscriptionContextValue = {
  customerInfo: null;
  // `any` while RevenueCat is stubbed/disabled — call sites read the real
  // offerings shape (offerings.current.availablePackages…), which a literal
  // `null` type would reject. Restore the real type when re-enabling.
  offerings: any;
  isSubscribed: boolean;
  isLoading: boolean;
  purchase: (pkg: any) => Promise<null>;
  restore: () => Promise<null>;
  isPurchasing: boolean;
  isRestoring: boolean;
};

const Context = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<SubscriptionContextValue>(
    () => ({
      customerInfo: null,
      offerings: null,
      isSubscribed: false,
      isLoading: false,
      purchase: async () => null,
      restore: async () => null,
      isPurchasing: false,
      isRestoring: false,
    }),
    [],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSubscription() {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return ctx;
}
