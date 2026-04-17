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
  taxAmount?: number;
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

export interface PendingTaxChoice {
  playerId: string;
  flat: number;
  percent: number;
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
  freeParkingPool: number;
  pendingTaxChoice: PendingTaxChoice | null;
}

export type NpcDifficulty = 'easy' | 'medium' | 'hard';

export const TOKENS = [
  { id: 'camel',    label: 'Camel',    image: require('../assets/tokens/camel.png') },
  { id: 'falcon',   label: 'Falcon',   image: require('../assets/tokens/falcon.png') },
  { id: 'dhow',     label: 'Tiger',    image: require('../assets/tokens/tiger.png') },
  { id: 'palm',     label: 'Panther',  image: require('../assets/tokens/big.png') },
  { id: 'crescent', label: 'Gazelle',  image: require('../assets/tokens/mammal.png') },
  { id: 'lamp',     label: 'Lantern',  image: require('../assets/tokens/lantern.png') },
];

export function getTokenImage(tokenId: string): any {
  return TOKENS.find(t => t.id === tokenId)?.image ?? require('../assets/tokens/camel.png');
}

export const NPC_NAMES = ['Khalid', 'Tariq', 'Omar', 'Layla', 'Zaid'];
export const NPC_TOKENS = ['falcon', 'dhow', 'palm', 'crescent', 'lamp'];

export interface SavedGame {
  gameId: string;
  isSinglePlayer: boolean;
  npcPlayerIds: string[];
  myPlayerId: string;
}

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
  savedGame: SavedGame | null;
  npcDifficulty: NpcDifficulty;
  setNpcDifficulty: (d: NpcDifficulty) => void;
  createGame: (name: string, token: string) => Promise<string | null>;
  createSinglePlayerGame: (name: string, token: string, npcCount: number, difficulty?: NpcDifficulty) => Promise<boolean>;
  joinGame: (gameId: string, name: string, token: string) => Promise<boolean>;
  resumeGame: () => Promise<boolean>;
  startGame: () => Promise<void>;
  rollDice: () => Promise<{ dice: number[]; isDoubles: boolean } | null>;
  buyProperty: () => Promise<void>;
  endTurn: () => Promise<void>;
  payJail: () => Promise<void>;
  buildHouse: (propertyIndex: number) => Promise<void>;
  sellHouse: (propertyIndex: number) => Promise<void>;
  auctionBuy: (propertyIndex: number, winnerId: string, price: number) => Promise<void>;
  mortgageProperty: (propertyIndex: number, action: 'mortgage' | 'unmortgage') => Promise<void>;
  proposeTrade: (toPlayerId: string, offeredProps: number[], requestedProps: number[], offeredMoney: number, requestedMoney: number) => Promise<void>;
  acceptTrade: () => Promise<void>;
  declineTrade: () => Promise<void>;
  chooseTax: (choice: 'flat' | 'percent') => Promise<void>;
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
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);
  const [npcDifficulty, setNpcDifficulty] = useState<NpcDifficulty>('medium');

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingActiveRef = useRef(false);
  const npcBotRunningRef = useRef(false);

  const GAME_SAVE_KEY = '@dawaar_saved_game';

  // Load saved player data and any in-progress game
  useEffect(() => {
    AsyncStorage.multiGet(['dawaar_playerId', 'dawaar_playerName', GAME_SAVE_KEY]).then(values => {
      const id = values[0][1];
      const name = values[1][1];
      const savedJson = values[2][1];
      if (id) setMyPlayerId(id);
      if (name) setMyPlayerName(name);
      if (savedJson) {
        try {
          const parsed: SavedGame = JSON.parse(savedJson);
          setSavedGame(parsed);
        } catch { /* ignore corrupt data */ }
      }
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
            pollingRef.current = setTimeout(() => startPolling(gameId, data.version), 500);
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

          // 2. If jailed and has sufficient funds, pay bail instead of gambling on doubles
          const npcBeforeRoll = currentState.players.find(p => p.id === currentId);
          if (npcBeforeRoll?.inJail && npcBeforeRoll.money > 1500) {
            try {
              const bailState = await api(`/games/${currentState.gameId}/pay-jail`, 'POST', { playerId: currentId });
              currentState = bailState as GameState;
              setGameState(currentState);
              await delay(600);
            } catch { /* can't pay — will roll for doubles instead */ }
          }

          // 3. Roll dice
          const rollData = await api(`/games/${currentState.gameId}/roll`, 'POST', { playerId: currentId });
          currentState = rollData.gameState as GameState;
          setGameState(currentState);
          setLastDiceRoll(rollData.dice);

          await delay(1000);

          // Difficulty-based reserve thresholds
          const buyReserve  = npcDifficulty === 'easy' ? 2500 : npcDifficulty === 'hard' ? 800  : 1500;
          const buildReserve = npcDifficulty === 'easy' ? 3000 : npcDifficulty === 'hard' ? 1200 : 2000;
          const mortgageThreshold = npcDifficulty === 'easy' ? 1500 : npcDifficulty === 'hard' ? 500 : 1000;

          // 4. Decide whether to buy the landed property
          const npcPlayer = currentState.players.find(p => p.id === currentId);
          if (npcPlayer) {
            const landedSpace = currentState.board[npcPlayer.position];
            const canBuy =
              landedSpace &&
              (landedSpace.type === 'property' || landedSpace.type === 'railroad' || landedSpace.type === 'utility') &&
              !landedSpace.ownerId &&
              landedSpace.price != null &&
              npcPlayer.money >= landedSpace.price &&
              npcPlayer.money - landedSpace.price >= buyReserve;

            if (canBuy) {
              // Color-group awareness: don't buy if it completes a human player's monopoly
              const wouldCompleteOpponentGroup = landedSpace.colorGroup
                ? (() => {
                    const groupSpaces = currentState.board.filter(s => s.colorGroup === landedSpace.colorGroup);
                    const humanIds = currentState.players.filter(p => !npcPlayerIds.includes(p.id)).map(p => p.id);
                    return humanIds.some(hId => {
                      const humanOwned = groupSpaces.filter(s => s.ownerId === hId).length;
                      return humanOwned === groupSpaces.length - 1;
                    });
                  })()
                : false;

              if (!wouldCompleteOpponentGroup || npcDifficulty === 'hard') {
                await delay(700);
                try {
                  const boughtState = await api(`/games/${currentState.gameId}/buy`, 'POST', { playerId: currentId });
                  currentState = boughtState as GameState;
                  setGameState(currentState);
                  await delay(600);
                } catch { /* ignore */ }
              }
            }
          }

          // 4.5 Auto-resolve tax choice if the NPC has a pending tax choice
          const npcForTax = currentState.players.find(p => p.id === currentId);
          if (npcForTax && currentState.pendingTaxChoice?.playerId === currentId) {
            await delay(500);
            const tc = currentState.pendingTaxChoice;
            const cheaperChoice: 'flat' | 'percent' = tc.flat <= tc.percent ? 'flat' : 'percent';
            try {
              const taxState = await api(`/games/${currentState.gameId}/choose-tax`, 'POST', { playerId: currentId, choice: cheaperChoice });
              currentState = taxState as GameState;
              setGameState(currentState);
              await delay(400);
            } catch { /* ignore */ }
          }

          // 5. Try to build a house if NPC owns a full color group and has reserve
          const npcAfterBuy = currentState.players.find(p => p.id === currentId);
          if (npcAfterBuy && !npcAfterBuy.inJail) {
            const buildableProps = currentState.board.filter(s => {
              if (s.type !== 'property' || !s.colorGroup || s.ownerId !== currentId || s.hotel) return false;
              if (s.isMortgaged) return false;
              const group = currentState.board.filter(b => b.colorGroup === s.colorGroup);
              if (!group.every(b => b.ownerId === currentId)) return false;
              if (group.some(b => b.isMortgaged)) return false;
              const minHouses = Math.min(...group.map(b => b.hotel ? 5 : b.houses));
              return (s.hotel ? 5 : s.houses) <= minHouses;
            });
            if (buildableProps.length > 0) {
              const candidate = buildableProps.sort((a, b) => (a.houseCost ?? 0) - (b.houseCost ?? 0))[0];
              const buildCost = candidate.houses < 4 ? (candidate.houseCost ?? 1000) : (candidate.hotelCost ?? 1000);
              if (npcAfterBuy.money - buildCost >= buildReserve) {
                try {
                  await delay(700);
                  const builtState = await api(`/games/${currentState.gameId}/build`, 'POST', { playerId: currentId, propertyIndex: candidate.index });
                  currentState = builtState as GameState;
                  setGameState(currentState);
                  await delay(500);
                } catch { /* not buildable this turn, ignore */ }
              }
            }
          }

          // 5.5 Strategic unmortgage: if flush with cash, unmortgage cheapest property
          const npcForUnmortgage = currentState.players.find(p => p.id === currentId);
          if (npcForUnmortgage && npcForUnmortgage.money > buildReserve * 2) {
            const mortgaged = currentState.board
              .filter(s => s.ownerId === currentId && s.isMortgaged && s.mortgageValue)
              .sort((a, b) => (a.mortgageValue ?? 0) - (b.mortgageValue ?? 0));
            if (mortgaged.length > 0) {
              const target = mortgaged[0];
              const unmortgageCost = Math.floor((target.mortgageValue ?? 0) * 1.1);
              if (npcForUnmortgage.money - unmortgageCost >= buildReserve) {
                try {
                  const unmortgageState = await api(`/games/${currentState.gameId}/mortgage`, 'POST', {
                    playerId: currentId, propertyIndex: target.index, action: 'unmortgage',
                  });
                  currentState = unmortgageState as GameState;
                  setGameState(currentState);
                  await delay(400);
                } catch { /* ignore */ }
              }
            }
          }

          // 5.6 NPC trading: if NPC owns 2 of 3 in a color group and a human has the missing one
          const npcForTrade = currentState.players.find(p => p.id === currentId);
          if (npcForTrade && npcForTrade.money > buildReserve * 1.5 && !currentState.pendingTrade && isSinglePlayer) {
            const humanIds = currentState.players.filter(p => !npcPlayerIds.includes(p.id) && !p.isBankrupt).map(p => p.id);
            const colorGroups = [...new Set(currentState.board.filter(s => s.type === 'property' && s.colorGroup).map(s => s.colorGroup!))];
            let tradeMade = false;
            for (const group of colorGroups) {
              if (tradeMade) break;
              const groupSpaces = currentState.board.filter(s => s.colorGroup === group);
              const npcOwned = groupSpaces.filter(s => s.ownerId === currentId);
              if (npcOwned.length !== groupSpaces.length - 1) continue;
              for (const humanId of humanIds) {
                const humanOwned = groupSpaces.filter(s => s.ownerId === humanId);
                if (humanOwned.length !== 1) continue;
                const targetProp = humanOwned[0];
                const offerAmount = Math.floor((targetProp.price ?? 0) * 1.5);
                if (offerAmount > 0 && npcForTrade.money - offerAmount >= buyReserve) {
                  try {
                    await delay(600);
                    const tradeState = await api(`/games/${currentState.gameId}/trade`, 'POST', {
                      fromPlayerId: currentId, toPlayerId: humanId,
                      offeredPropertyIndices: [], requestedPropertyIndices: [targetProp.index],
                      offeredMoney: offerAmount, requestedMoney: 0,
                    });
                    currentState = tradeState as GameState;
                    setGameState(currentState);
                    tradeMade = true;
                  } catch { /* ignore */ }
                  break;
                }
              }
            }
          }

          // 6. If doubles were rolled and player is not in jail, loop for re-roll
          const npcNow = currentState.players.find(p => p.id === currentId);
          if (rollData.isDoubles && npcNow && !npcNow.inJail && !currentState.hasRolled) {
            grantedReRoll = true;
            await delay(600);
          }
        } while (grantedReRoll);

        // 7. Emergency mortgage: if very low on money, mortgage an unmortgaged property
        const npcFinal = currentState.players.find(p => p.id === currentId);
        const emergencyThreshold = npcDifficulty === 'easy' ? 1500 : npcDifficulty === 'hard' ? 500 : 1000;
        if (npcFinal && npcFinal.money < emergencyThreshold) {
          const mortgageable = currentState.board.find(
            s => s.ownerId === currentId && !s.isMortgaged && !s.houses && !s.hotel && s.mortgageValue
          );
          if (mortgageable) {
            try {
              const mortState = await api(`/games/${currentState.gameId}/mortgage`, 'POST', {
                playerId: currentId,
                propertyIndex: mortgageable.index,
                action: 'mortgage',
              });
              currentState = mortState as GameState;
              setGameState(currentState);
              await delay(500);
            } catch { /* ignore */ }
          }
        }

        // 8. End turn
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
    npcDifficulty,
  ]);

  // Reset bot lock when turn changes
  useEffect(() => {
    npcBotRunningRef.current = false;
  }, [gameState?.currentPlayerId]);

  // Stall recovery: if NPC's turn shows hasRolled=true but bot isn't running, force end-turn
  useEffect(() => {
    if (!isSinglePlayer || !gameState || gameState.status !== 'playing') return;
    const currentId = gameState.currentPlayerId;
    if (!currentId || !npcPlayerIds.includes(currentId)) return;
    if (!gameState.hasRolled || npcBotRunningRef.current) return;

    const stallTimer = setTimeout(async () => {
      if (npcBotRunningRef.current) return;
      try {
        const endState = await api(`/games/${gameState.gameId}/end-turn`, 'POST', { playerId: currentId });
        setGameState(endState as GameState);
      } catch { /* ignore */ }
    }, 3500);

    return () => clearTimeout(stallTimer);
  }, [isSinglePlayer, gameState?.currentPlayerId, gameState?.hasRolled, gameState?.status, gameState?.gameId]);

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
    npcCount: number,
    difficulty: NpcDifficulty = 'medium'
  ): Promise<boolean> => {
    setNpcDifficulty(difficulty);
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

      // 5. Persist game so the player can resume after closing the app
      const save: SavedGame = { gameId, isSinglePlayer: true, npcPlayerIds: npcIds, myPlayerId: playerId! };
      setSavedGame(save);
      await AsyncStorage.setItem(GAME_SAVE_KEY, JSON.stringify(save));

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
        accept: true,
      });
      setGameState(state);
    } catch (e: any) {
      setError(e.message);
    }
  }, [gameState, myPlayerId]);

  const declineTrade = useCallback(async () => {
    if (!gameState || !myPlayerId) return;
    setError(null);
    try {
      const state = await api(`/games/${gameState.gameId}/trade`, 'POST', {
        toPlayerId: myPlayerId,
        decline: true,
      });
      setGameState(state);
    } catch (e: any) {
      setError(e.message);
    }
  }, [gameState, myPlayerId]);

  const chooseTax = useCallback(async (choice: 'flat' | 'percent') => {
    if (!gameState || !myPlayerId) return;
    setError(null);
    try {
      const state = await api(`/games/${gameState.gameId}/choose-tax`, 'POST', { playerId: myPlayerId, choice });
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

  const sellHouse = useCallback(async (propertyIndex: number) => {
    if (!gameState || !myPlayerId) return;
    setError(null);
    try {
      const state = await api(`/games/${gameState.gameId}/sell-house`, 'POST', { playerId: myPlayerId, propertyIndex });
      setGameState(state);
    } catch (e: any) {
      setError(e.message);
    }
  }, [gameState, myPlayerId]);

  const auctionBuy = useCallback(async (propertyIndex: number, winnerId: string, price: number) => {
    if (!gameState) return;
    setError(null);
    try {
      const state = await api(`/games/${gameState.gameId}/auction-buy`, 'POST', { winnerId, propertyIndex, price });
      setGameState(state);
    } catch (e: any) {
      setError(e.message);
    }
  }, [gameState]);

  const resumeGame = useCallback(async (): Promise<boolean> => {
    if (!savedGame) return false;
    setIsLoading(true);
    setError(null);
    try {
      const state: GameState = await api(`/games/${savedGame.gameId}`);
      if (state.status === 'finished') {
        setSavedGame(null);
        await AsyncStorage.removeItem(GAME_SAVE_KEY);
        return false;
      }
      setMyPlayerId(savedGame.myPlayerId);
      setIsSinglePlayer(savedGame.isSinglePlayer);
      setNpcPlayerIds(savedGame.npcPlayerIds);
      npcBotRunningRef.current = false;
      attachToGame(state);
      return true;
    } catch {
      // Game no longer exists on server — clear saved game
      setSavedGame(null);
      AsyncStorage.removeItem(GAME_SAVE_KEY).catch(() => {});
      setError('Saved game no longer available. Please start a new game.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [savedGame, attachToGame]);

  const leaveGame = useCallback(() => {
    AsyncStorage.removeItem(GAME_SAVE_KEY).catch(() => {});
    setSavedGame(null);
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
      savedGame,
      npcDifficulty,
      setNpcDifficulty,
      createGame,
      createSinglePlayerGame,
      joinGame,
      resumeGame,
      startGame,
      rollDice,
      buyProperty,
      endTurn,
      payJail,
      buildHouse,
      sellHouse,
      auctionBuy,
      mortgageProperty,
      proposeTrade,
      acceptTrade,
      declineTrade,
      chooseTax,
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
