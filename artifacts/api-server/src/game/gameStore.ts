import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { fileURLToPath } from 'url';
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
const WRITE_DEBOUNCE_MS = 250;

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

async function writeGamesNow(): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
  }
  const obj: Record<string, GameState> = {};
  for (const [id, state] of games.entries()) {
    obj[id] = state;
  }
  const tmpFile = GAMES_FILE + '.tmp';
  await fs.promises.writeFile(tmpFile, JSON.stringify(obj), 'utf-8');
  await fs.promises.rename(tmpFile, GAMES_FILE);
}

async function flushIfDirty(): Promise<void> {
  if (!dirty) return;
  if (writingPromise) {
    await writingPromise;
  }
  if (!dirty) return;
  dirty = false;
  writingPromise = writeGamesNow().catch(() => {
    dirty = true;
  }).finally(() => {
    writingPromise = null;
  });
  await writingPromise;
}

function scheduleSave(): void {
  dirty = true;
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    flushIfDirty().catch(() => {});
  }, WRITE_DEBOUNCE_MS);
}

// Load persisted games on server start
loadGamesFromFile();

// Flush on shutdown signals
async function shutdown() {
  if (writeTimer) {
    clearTimeout(writeTimer);
    writeTimer = null;
  }
  try {
    await flushIfDirty();
  } catch {
    // ignore
  }
}

let shutdownRegistered = false;
function registerShutdownHandlers() {
  if (shutdownRegistered) return;
  shutdownRegistered = true;
  for (const sig of ['SIGTERM', 'SIGINT'] as const) {
    process.once(sig, async () => {
      await shutdown();
      process.exit(0);
    });
  }
  process.once('beforeExit', () => { shutdown(); });
}
if (process.env.NODE_ENV !== 'test') {
  registerShutdownHandlers();
}

export function getGame(gameId: string): GameState | undefined {
  return games.get(gameId);
}

export function setGame(gameId: string, state: GameState): void {
  games.set(gameId, state);
  scheduleSave();
  gameEvents.emit(`game:${gameId}`, state);
}

export function generateGameId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function flushGamesForTest(): Promise<void> {
  await flushIfDirty();
}
