import { GameState } from './gameState.js';

// In-memory game store
const games = new Map<string, GameState>();

export function getGame(gameId: string): GameState | undefined {
  return games.get(gameId);
}

export function setGame(gameId: string, state: GameState): void {
  games.set(gameId, state);
}

export function generateGameId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
