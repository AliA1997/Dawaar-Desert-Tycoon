import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@dawaar_premium_subscribed';

export type Plan = 'monthly' | 'annual' | null;

export interface SubscriptionState {
  isSubscribed: boolean;
  plan: Plan;
  subscribedAt: string | null;
  loaded: boolean;
}

let _globalListeners: Array<(s: SubscriptionState) => void> = [];
let _state: SubscriptionState = { isSubscribed: false, plan: null, subscribedAt: null, loaded: false };

function notify(newState: SubscriptionState) {
  _state = newState;
  _globalListeners.forEach(fn => fn(newState));
}

async function loadFromStorage(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { plan: Plan; subscribedAt: string };
      const next: SubscriptionState = { isSubscribed: true, plan: parsed.plan, subscribedAt: parsed.subscribedAt, loaded: true };
      notify(next);
    } else {
      notify({ ..._state, loaded: true });
    }
  } catch {
    notify({ ..._state, loaded: true });
  }
}

loadFromStorage();

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>(_state);

  useEffect(() => {
    _globalListeners.push(setState);
    setState(_state);
    return () => {
      _globalListeners = _globalListeners.filter(fn => fn !== setState);
    };
  }, []);

  const subscribe = useCallback(async (plan: Plan) => {
    const subscribedAt = new Date().toISOString();
    await AsyncStorage.setItem(KEY, JSON.stringify({ plan, subscribedAt }));
    notify({ isSubscribed: true, plan, subscribedAt, loaded: true });
  }, []);

  const cancelSubscription = useCallback(async () => {
    await AsyncStorage.removeItem(KEY);
    notify({ isSubscribed: false, plan: null, subscribedAt: null, loaded: true });
  }, []);

  return { ...state, subscribe, cancelSubscription };
}
