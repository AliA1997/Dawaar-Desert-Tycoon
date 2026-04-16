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
  doublesCount: number;
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
  { id: 'camel',    label: 'Camel',    image: require('../assets/tokens/camel.png') },
  { id: 'falcon',   label: 'Falcon',   image: require('../assets/tokens/falcon.png') },
  { id: 'dhow',     label: 'Tiger',    image: require('../assets/tokens/tiger.png') },
  { id: 'palm',     label: 'Big Cat',  image: require('../assets/tokens/big.png') },
  { id: 'crescent', label: 'Camel',    image: require('../assets/tokens/mammal.png') },
  { id: 'lamp',     label: 'Lantern',  image: require('../assets/tokens/lantern.png') },
];

export function getTokenImage(tokenId: string): any {
  return TOKENS.find(t => t.id === tokenId)?.image ?? require('../assets/tokens/camel.png');
}

export const NPC_NAMES = ['Khalid', 'Tariq', 'Omar', 'Layla', 'Zaid'];
export const NPC_TOKENS = ['falcon', 'dhow', 'palm', 'crescent', 'lamp'];

interface GameContextType {
  gameState: GameState | null;
  myPlayerId: string | null;
  myPlayerName: string | null;
  isLoading: boolean;
  error: string | null;
  isMyTurn: boolean;
  myPlayer: Player | null;
  isSinglePlayer: boolean;
  npcPlayerIds: string[];
  npcThinking: boolean;
  createGame: (name: string, token: string) => Promise<string | null>;
  createSinglePlayerGame: (name: string, token: string, npcCount: number) => Promise<boolean>;
  joinGame: (gameId: string, name: string, token: string) => Promise<boolean>;
  startGame: () => Promise<void>;
  rollDice: () => Promise<{ dice: number[]; isDoubles: boolean } | null>;
  buyProperty: () => Promise<void>;
  endTurn: () => Promise<void>;
  payJail: () => Promise<void>;
  buildHouse: (propertyIndex: number) => Promise<void>;
  mortgageProperty: (propertyIndex: number, action: 'mortgage' | 'unmortgage') => Promise<void>;
  proposeTrade: (toPlayerId: string, offeredProps: number[], requestedProps: number[], offeredMoney: number, requestedMoney: number) => Promise<void>;
  acceptTrade: () => Promise<void>;
  claimAdReward: () => Promise<void>;
  clearError: () => void;
  lastDiceRoll: number[] | null;
  leaveGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [myPlayerName, setMyPlayerName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDiceRoll, setLastDiceRoll] = useState<number[] | null>(null);
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);
  const [npcPlayerIds, setNpcPlayerIds] = useState<string[]>([]);
  const [npcThinking, setNpcThinking] = useState(false);

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingActiveRef = useRef(false);
  const npcBotRunningRef = useRef(false);

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

  // ─── NPC Bot Logic ───────────────────────────────────────────────────────────
  // Runs whenever the current turn changes in a single-player game
  useEffect(() => {
    if (!isSinglePlayer || !gameState || gameState.status !== 'playing') return;

    const currentId = gameState.currentPlayerId;
    if (!currentId) return;

    const isNpc = npcPlayerIds.includes(currentId);
    if (!isNpc) return;

    // Already running for this state — don't double-trigger
    if (npcBotRunningRef.current) return;
    if (gameState.hasRolled) return; // NPC already rolled; end-turn logic is handled separately

    npcBotRunningRef.current = true;

    const runNpcTurn = async () => {
      try {
        setNpcThinking(true);
        let currentState = gameState!;
        let grantedReRoll = false;

        // Loop to handle doubles re-rolls
        do {
          grantedReRoll = false;

          // 1. Pause to simulate "thinking"
          await delay(1200 + Math.random() * 800);

          // 2. Roll dice
          const rollData = await api(`/games/${currentState.gameId}/roll`, 'POST', { playerId: currentId });
          currentState = rollData.gameState as GameState;
          setGameState(currentState);
          setLastDiceRoll(rollData.dice);

          await delay(1000);

          // 3. Decide whether to buy the landed property
          const npcPlayer = currentState.players.find(p => p.id === currentId);
          if (npcPlayer) {
            const landedSpace = currentState.board[npcPlayer.position];
            const canBuy =
              landedSpace &&
              (landedSpace.type === 'property' || landedSpace.type === 'railroad' || landedSpace.type === 'utility') &&
              !landedSpace.ownerId &&
              landedSpace.price != null &&
              npcPlayer.money >= landedSpace.price &&
              npcPlayer.money - landedSpace.price > 2000;

            if (canBuy) {
              await delay(700);
              const boughtState = await api(`/games/${currentState.gameId}/buy`, 'POST', { playerId: currentId });
              currentState = boughtState as GameState;
              setGameState(currentState);
              await delay(600);
            }
          }

          // 4. If doubles were rolled and player is not in jail, loop for re-roll
          const npcNow = currentState.players.find(p => p.id === currentId);
          if (rollData.isDoubles && npcNow && !npcNow.inJail && !currentState.hasRolled) {
            grantedReRoll = true;
            await delay(600);
          }
        } while (grantedReRoll);

        // 5. End turn
        await delay(800);
        const endState = await api(`/games/${currentState.gameId}/end-turn`, 'POST', { playerId: currentId });
        setGameState(endState as GameState);
      } catch {
        // silently ignore bot errors
      } finally {
        setNpcThinking(false);
        npcBotRunningRef.current = false;
      }
    };

    runNpcTurn();
  }, [
    isSinglePlayer,
    gameState?.currentPlayerId,
    gameState?.hasRolled,
    gameState?.status,
  ]);

  // Reset bot lock when turn changes
  useEffect(() => {
    npcBotRunningRef.current = false;
  }, [gameState?.currentPlayerId]);

  // ─── API Actions ─────────────────────────────────────────────────────────────

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
      setIsSinglePlayer(false);
      setNpcPlayerIds([]);
      attachToGame(fullState);
      return data.gameId;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [myPlayerId, attachToGame]);

  const createSinglePlayerGame = useCallback(async (
    name: string,
    token: string,
    npcCount: number
  ): Promise<boolean> => {
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

      // 1. Create the game
      const created = await api('/games', 'POST', { playerName: name, playerId, token });
      const gameId: string = created.gameId;

      // 2. Join NPCs
      const npcIds: string[] = [];
      const count = Math.min(Math.max(npcCount, 1), 4);
      const usedTokens = new Set([token]);

      for (let i = 0; i < count; i++) {
        const npcId = `npc_${i}_${Date.now()}`;
        const npcName = `${NPC_NAMES[i]} (Bot)`;
        const npcToken = NPC_TOKENS.find(t => !usedTokens.has(t)) || NPC_TOKENS[i % NPC_TOKENS.length];
        usedTokens.add(npcToken);
        await api(`/games/${gameId}/join`, 'POST', { playerName: npcName, playerId: npcId, token: npcToken });
        npcIds.push(npcId);
      }

      // 3. Start immediately
      await api(`/games/${gameId}/start`, 'POST', { playerId });

      // 4. Fetch the full started state
      const fullState = await api(`/games/${gameId}`);

      setIsSinglePlayer(true);
      setNpcPlayerIds(npcIds);
      npcBotRunningRef.current = false;
      attachToGame(fullState);
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
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
      setIsSinglePlayer(false);
      setNpcPlayerIds([]);
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

  const payJail = useCallback(async () => {
    if (!gameState || !myPlayerId) return;
    setError(null);
    try {
      const state = await api(`/games/${gameState.gameId}/pay-jail`, 'POST', { playerId: myPlayerId });
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

  const claimAdReward = useCallback(async () => {
    if (!gameState || !myPlayerId) return;
    setError(null);
    try {
      const state = await api(`/games/${gameState.gameId}/reward`, 'POST', { playerId: myPlayerId });
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
    setIsSinglePlayer(false);
    setNpcPlayerIds([]);
    npcBotRunningRef.current = false;
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
      isSinglePlayer,
      npcPlayerIds,
      npcThinking,
      createGame,
      createSinglePlayerGame,
      joinGame,
      startGame,
      rollDice,
      buyProperty,
      endTurn,
      payJail,
      buildHouse,
      mortgageProperty,
      proposeTrade,
      acceptTrade,
      claimAdReward,
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
