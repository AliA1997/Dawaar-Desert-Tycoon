import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GameState } from './gameState.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const GAMES_FILE = path.join(DATA_DIR, 'games.json');

const games = new Map<string, GameState>();

function loadGamesFromFile(): void {
  try {
    if (fs.existsSync(GAMES_FILE)) {
      const raw = fs.readFileSync(GAMES_FILE, 'utf-8');
      const saved = JSON.parse(raw) as Record<string, GameState>;
      for (const [id, state] of Object.entries(saved)) {
        if (state.status !== 'finished') {
          games.set(id, state);
        }
      }
    }
  } catch {
    // Corrupt file — start fresh
  }
}

function saveGamesToFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const obj: Record<string, GameState> = {};
    for (const [id, state] of games.entries()) {
      obj[id] = state;
    }
    fs.writeFileSync(GAMES_FILE, JSON.stringify(obj), 'utf-8');
  } catch {
    // Ignore write errors — in-memory state still works
  }
}

// Load persisted games on server start
loadGamesFromFile();

export function getGame(gameId: string): GameState | undefined {
  return games.get(gameId);
}

export function setGame(gameId: string, state: GameState): void {
  games.set(gameId, state);
  saveGamesToFile();
}

export function generateGameId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
