import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import { GameState } from './gameState.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const GAMES_FILE = path.join(DATA_DIR, 'games.json');

const games = new Map<string, GameState>();

export const gameEvents = new EventEmitter();
gameEvents.setMaxListeners(0);

let dirty = false;
let writeTimer: ReturnType<typeof setTimeout> | null = null;
let writingPromise: Promise<void> | null = null;
const DEBOUNCE_MS = 250;

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

async function writeNow(): Promise<void> {
  dirty = false;
  try {
    await fsp.mkdir(DATA_DIR, { recursive: true });
    const obj: Record<string, GameState> = {};
    for (const [id, state] of games.entries()) obj[id] = state;
    const tmp = GAMES_FILE + '.tmp';
    await fsp.writeFile(tmp, JSON.stringify(obj), 'utf-8');
    await fsp.rename(tmp, GAMES_FILE);
  } catch {
    // Ignore write errors — in-memory state still works
  }
}

function scheduleWrite(): void {
  dirty = true;
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    writingPromise = writeNow().finally(() => { writingPromise = null; });
  }, DEBOUNCE_MS);
}

export async function flushGamesToFile(): Promise<void> {
  if (writeTimer) { clearTimeout(writeTimer); writeTimer = null; }
  if (writingPromise) {
    try { await writingPromise; } catch { /* ignore */ }
  }
  if (dirty) await writeNow();
}

loadGamesFromFile();

export function getGame(gameId: string): GameState | undefined {
  return games.get(gameId);
}

export function setGame(gameId: string, state: GameState): void {
  games.set(gameId, state);
  scheduleWrite();
  gameEvents.emit('change', gameId, state);
}

export function deleteGame(gameId: string): void {
  if (games.delete(gameId)) {
    scheduleWrite();
    gameEvents.emit('change', gameId);
  }
}

export function generateGameId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// Graceful shutdown — flush pending writes before exit. Skip in test runs.
const isTest = !!process.env.VITEST || process.env.NODE_ENV === 'test';
let shuttingDown = false;
async function gracefulShutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  try { await flushGamesToFile(); } finally { process.exit(0); }
}
if (!isTest) {
  process.once('SIGTERM', gracefulShutdown);
  process.once('SIGINT', gracefulShutdown);
}
