import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

export interface Player {
  id: string;
  name: string;
  token: string;
  money: number;
  position: number;
  properties: number[];
  inJail: boolean;
  jailTurns: number;
  isBankrupt: boolean;
  color: string;
}

export interface BoardProperty {
  index: number;
  name: string;
  nameAr: string;
  type: string;
  price?: number;
  rent?: number[];
  houseCost?: number;
  hotelCost?: number;
  mortgageValue?: number;
  colorGroup?: string;
  ownerId: string | null;
  houses: number;
  hotel: boolean;
  isMortgaged: boolean;
}

export interface GameLog {
  message: string;
  timestamp: string;
  playerId?: string | null;
}

export interface TradeOffer {
  fromPlayerId: string;
  toPlayerId: string;
  offeredPropertyIndices: number[];
  requestedPropertyIndices: number[];
  offeredMoney: number;
  requestedMoney: number;
}

export interface GameState {
  gameId: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Player[];
  board: BoardProperty[];
  currentPlayerId: string | null;
  diceRoll: number[] | null;
  hasRolled: boolean;
  version: number;
  log: GameLog[];
  winnerId: string | null;
  pendingTrade: TradeOffer | null;
}

export const TOKENS = [
  { id: 'camel', label: 'Camel', icon: 'paw' },
  { id: 'falcon', label: 'Falcon', icon: 'eye' },
  { id: 'dhow', label: 'Dhow', icon: 'navigate' },
  { id: 'palm', label: 'Palm Tree', icon: 'leaf' },
  { id: 'crescent', label: 'Crescent', icon: 'moon' },
  { id: 'lamp', label: 'Oil Lamp', icon: 'bulb' },
];

interface GameContextType {
  gameState: GameState | null;
  myPlayerId: string | null;
  myPlayerName: string | null;
  isLoading: boolean;
  error: string | null;
  isMyTurn: boolean;
  myPlayer: Player | null;
  createGame: (name: string, token: string) => Promise<string | null>;
  joinGame: (gameId: string, name: string, token: string) => Promise<boolean>;
  startGame: () => Promise<void>;
  rollDice: () => Promise<{ dice: number[]; isDoubles: boolean } | null>;
  buyProperty: () => Promise<void>;
  endTurn: () => Promise<void>;
  buildHouse: (propertyIndex: number) => Promise<void>;
  mortgageProperty: (propertyIndex: number, action: 'mortgage' | 'unmortgage') => Promise<void>;
  proposeTrade: (toPlayerId: string, offeredProps: number[], requestedProps: number[], offeredMoney: number, requestedMoney: number) => Promise<void>;
  acceptTrade: () => Promise<void>;
  clearError: () => void;
  lastDiceRoll: number[] | null;
  leaveGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [myPlayerName, setMyPlayerName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDiceRoll, setLastDiceRoll] = useState<number[] | null>(null);
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingActiveRef = useRef(false);

  // Load saved player data
  useEffect(() => {
    AsyncStorage.multiGet(['dawaar_playerId', 'dawaar_playerName']).then(values => {
      const id = values[0][1];
      const name = values[1][1];
      if (id) setMyPlayerId(id);
      if (name) setMyPlayerName(name);
    });
  }, []);

  const generatePlayerId = () => `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const api = async (path: string, method: string = 'GET', body?: object) => {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  // Long-polling for game updates
  const startPolling = useCallback((gameId: string, version: number) => {
    if (!pollingActiveRef.current) return;

    const poll = async () => {
      if (!pollingActiveRef.current) return;
      try {
        const url = `${API_BASE}/games/${gameId}/poll?version=${version}`;
        const res = await fetch(url);
        if (!pollingActiveRef.current) return;
        if (res.status === 200) {
          const data: GameState = await res.json();
          setGameState(data);
          if (data.diceRoll) setLastDiceRoll(data.diceRoll);
          if (data.status !== 'finished') {
            pollingRef.current = setTimeout(() => startPolling(gameId, data.version), 100);
          }
        } else {
          pollingRef.current = setTimeout(() => startPolling(gameId, version), 2000);
        }
      } catch {
        if (pollingActiveRef.current) {
          pollingRef.current = setTimeout(() => startPolling(gameId, version), 3000);
        }
      }
    };
    poll();
  }, []);

  const stopPolling = useCallback(() => {
    pollingActiveRef.current = false;
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const attachToGame = useCallback((state: GameState) => {
    setGameState(state);
    if (state.diceRoll) setLastDiceRoll(state.diceRoll);
    pollingActiveRef.current = true;
    startPolling(state.gameId, state.version);
  }, [startPolling]);

  const createGame = useCallback(async (name: string, token: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      let playerId = myPlayerId;
      if (!playerId) {
        playerId = generatePlayerId();
        await AsyncStorage.setItem('dawaar_playerId', playerId);
        setMyPlayerId(playerId);
      }
      await AsyncStorage.setItem('dawaar_playerName', name);
      setMyPlayerName(name);

      const data = await api('/games', 'POST', { playerName: name, playerId, token });
      const fullState = await api(`/games/${data.gameId}`);
      attachToGame(fullState);
      return data.gameId;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [myPlayerId, attachToGame]);

  const joinGame = useCallback(async (gameId: string, name: string, token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      let playerId = myPlayerId;
      if (!playerId) {
        playerId = generatePlayerId();
        await AsyncStorage.setItem('dawaar_playerId', playerId);
        setMyPlayerId(playerId);
      }
      await AsyncStorage.setItem('dawaar_playerName', name);
      setMyPlayerName(name);

      const state = await api(`/games/${gameId}/join`, 'POST', { playerName: name, playerId, token });
      attachToGame(state);
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [myPlayerId, attachToGame]);

  const startGame = useCallback(async () => {
    if (!gameState || !myPlayerId) return;
    setError(null);
    try {
      const state = await api(`/games/${gameState.gameId}/start`, 'POST', { playerId: myPlayerId });
      setGameState(state);
    } catch (e: any) {
      setError(e.message);
    }
  }, [gameState, myPlayerId]);

  const rollDice = useCallback(async () => {
    if (!gameState || !myPlayerId) return null;
    setError(null);
    try {
      const data = await api(`/games/${gameState.gameId}/roll`, 'POST', { playerId: myPlayerId });
      setGameState(data.gameState);
      setLastDiceRoll(data.dice);
      return { dice: data.dice, isDoubles: data.isDoubles };
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, [gameState, myPlayerId]);

  const buyProperty = useCallback(async () => {
    if (!gameState || !myPlayerId) return;
    setError(null);
    try {
      const state = await api(`/games/${gameState.gameId}/buy`, 'POST', { playerId: myPlayerId });
      setGameState(state);
    } catch (e: any) {
      setError(e.message);
    }
  }, [gameState, myPlayerId]);

  const endTurn = useCallback(async () => {
    if (!gameState || !myPlayerId) return;
    setError(null);
    try {
      const state = await api(`/games/${gameState.gameId}/end-turn`, 'POST', { playerId: myPlayerId });
      setGameState(state);
    } catch (e: any) {
      setError(e.message);
    }
  }, [gameState, myPlayerId]);

  const buildHouse = useCallback(async (propertyIndex: number) => {
    if (!gameState || !myPlayerId) return;
    setError(null);
    try {
      const state = await api(`/games/${gameState.gameId}/build`, 'POST', { playerId: myPlayerId, propertyIndex });
      setGameState(state);
    } catch (e: any) {
      setError(e.message);
    }
  }, [gameState, myPlayerId]);

  const mortgageProperty = useCallback(async (propertyIndex: number, action: 'mortgage' | 'unmortgage') => {
    if (!gameState || !myPlayerId) return;
    setError(null);
    try {
      const state = await api(`/games/${gameState.gameId}/mortgage`, 'POST', { playerId: myPlayerId, propertyIndex, action });
      setGameState(state);
    } catch (e: any) {
      setError(e.message);
    }
  }, [gameState, myPlayerId]);

  const proposeTrade = useCallback(async (toPlayerId: string, offeredProps: number[], requestedProps: number[], offeredMoney: number, requestedMoney: number) => {
    if (!gameState || !myPlayerId) return;
    setError(null);
    try {
      const state = await api(`/games/${gameState.gameId}/trade`, 'POST', {
        fromPlayerId: myPlayerId,
        toPlayerId,
        offeredPropertyIndices: offeredProps,
        requestedPropertyIndices: requestedProps,
        offeredMoney,
        requestedMoney,
      });
      setGameState(state);
    } catch (e: any) {
      setError(e.message);
    }
  }, [gameState, myPlayerId]);

  const acceptTrade = useCallback(async () => {
    if (!gameState || !myPlayerId) return;
    setError(null);
    try {
      const state = await api(`/games/${gameState.gameId}/trade`, 'POST', {
        fromPlayerId: gameState.pendingTrade?.fromPlayerId,
        toPlayerId: myPlayerId,
        offeredPropertyIndices: [],
        requestedPropertyIndices: [],
        offeredMoney: 0,
        requestedMoney: 0,
        accept: true,
      });
      setGameState(state);
    } catch (e: any) {
      setError(e.message);
    }
  }, [gameState, myPlayerId]);

  const leaveGame = useCallback(() => {
    stopPolling();
    setGameState(null);
    setLastDiceRoll(null);
    setError(null);
  }, [stopPolling]);

  const myPlayer = gameState?.players.find(p => p.id === myPlayerId) || null;
  const isMyTurn = !!(gameState && gameState.currentPlayerId === myPlayerId);

  return (
    <GameContext.Provider value={{
      gameState,
      myPlayerId,
      myPlayerName,
      isLoading,
      error,
      isMyTurn,
      myPlayer,
      createGame,
      joinGame,
      startGame,
      rollDice,
      buyProperty,
      endTurn,
      buildHouse,
      mortgageProperty,
      proposeTrade,
      acceptTrade,
      clearError: () => setError(null),
      lastDiceRoll,
      leaveGame,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
