import { CHALLENGE_BOARDS } from '../board/index.js';
import { makePlayer, type Player } from '../players/types.js';
import { createInitialBoard, getNextPlayerId, type GameState, type GameStatus } from './state.js';

export function createGame(gameId: string, playerName: string, playerId: string, token: string, boardId?: string): GameState {
  const player: Player = makePlayer(playerId, playerName, token, 0);
  const sourceBoard = boardId ? CHALLENGE_BOARDS[boardId] : undefined;
  return {
    gameId,
    boardId,
    status: 'waiting',
    players: [player],
    board: createInitialBoard(sourceBoard),
    currentPlayerId: null,
    diceRoll: null,
    hasRolled: false,
    version: 1,
    log: [{ message: `${playerName} created the game`, timestamp: new Date().toISOString(), playerId }],
    winnerId: null,
    pendingTrade: null,
    freeParkingPool: 0,
    pendingTaxChoice: null,
  };
}

export function joinGame(state: GameState, playerName: string, playerId: string, token: string): { state: GameState; error?: string } {
  if (state.status !== 'waiting') return { state, error: 'Game has already started' };
  if (state.players.length >= 6) return { state, error: 'Game is full (max 6 players)' };
  if (state.players.find(p => p.id === playerId)) return { state, error: 'You are already in this game' };

  const player = makePlayer(playerId, playerName, token, state.players.length);

  return {
    state: {
      ...state,
      players: [...state.players, player],
      version: state.version + 1,
      log: [...state.log, { message: `${playerName} joined the game`, timestamp: new Date().toISOString(), playerId }],
    },
  };
}

export function setReady(state: GameState, playerId: string, ready: boolean): { state: GameState; error?: string } {
  if (state.status !== 'waiting') return { state, error: 'Game already started' };
  const player = state.players.find(p => p.id === playerId);
  if (!player) return { state, error: 'Player not found' };
  if (player.ready === ready) return { state };
  return {
    state: {
      ...state,
      players: state.players.map(p => p.id === playerId ? { ...p, ready } : p),
      version: state.version + 1,
      log: [...state.log, {
        message: `${player.name} is ${ready ? 'ready' : 'not ready'}`,
        timestamp: new Date().toISOString(),
        playerId,
      }].slice(-50),
    },
  };
}

export function startGame(state: GameState, playerId: string): { state: GameState; error?: string } {
  if (state.status !== 'waiting') return { state, error: 'Game already started' };
  if (state.players[0].id !== playerId) return { state, error: 'Only the host can start the game' };
  if (state.players.length < 2) return { state, error: 'Need at least 2 players to start' };

  return {
    state: {
      ...state,
      status: 'playing' as GameStatus,
      currentPlayerId: state.players[0].id,
      version: state.version + 1,
      log: [...state.log, { message: 'Game started! Good luck!', timestamp: new Date().toISOString() }],
    },
  };
}

export function endTurn(state: GameState, playerId: string): { state: GameState; error?: string } {
  if (state.currentPlayerId !== playerId) return { state, error: 'Not your turn' };
  if (!state.hasRolled) return { state, error: 'Must roll dice before ending turn' };
  if (state.pendingTaxChoice && state.pendingTaxChoice.playerId === playerId) {
    return { state, error: 'You must choose your tax payment before ending the turn' };
  }

  const nextPlayerId = getNextPlayerId(state, playerId);
  const nextPlayer = state.players.find(p => p.id === nextPlayerId)!;

  return {
    state: {
      ...state,
      currentPlayerId: nextPlayerId,
      hasRolled: false,
      diceRoll: null,
      version: state.version + 1,
      log: [...state.log, { message: `${nextPlayer.name}'s turn`, timestamp: new Date().toISOString() }].slice(-50),
      players: state.players.map(p => p.id === playerId ? { ...p, doublesCount: 0 } : p),
    },
  };
}

export function payJail(state: GameState, playerId: string): { state: GameState; error?: string } {
  if (state.status !== 'playing') return { state, error: 'Game not in progress' };
  if (state.currentPlayerId !== playerId) return { state, error: 'Not your turn' };
  if (state.hasRolled) return { state, error: 'Cannot pay bail after rolling' };

  const player = state.players.find(p => p.id === playerId);
  if (!player) return { state, error: 'Player not found' };
  if (!player.inJail) return { state, error: 'You are not in jail' };
  if (player.money < 500) return { state, error: 'Not enough money to pay bail (500 Dawaar Dollars required)' };

  const newPlayers = state.players.map(p =>
    p.id === playerId ? { ...p, inJail: false, jailTurns: 0, money: p.money - 500, doublesCount: 0 } : p
  );

  return {
    state: {
      ...state,
      players: newPlayers,
      version: state.version + 1,
      log: [...state.log, {
        message: `${player.name} paid 500 Dawaar Dollars bail and is free to roll!`,
        timestamp: new Date().toISOString(),
        playerId,
      }].slice(-50),
    },
  };
}
