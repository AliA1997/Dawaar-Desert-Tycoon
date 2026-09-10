import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import type { GameState } from '../turns/state.js';
import { config } from '../../config.js';

const DATA_DIR = config.dataDir;

// The suite drives the real store, so pointing it at the tracked snapshot meant
// every `pnpm test:api` run permanently injected its fixture games into the file
// the server loads at boot — 53 of them had accumulated before this was fixed.
// Tests get their own (gitignored) file, matching what profileStore already did.
const GAMES_FILE = path.join(DATA_DIR, config.isTest ? 'games.test.json' : 'games.json');

const games = new Map<string, GameState>();

/**
 * Last-touch time per game, kept OUTSIDE `GameState` on purpose.
 *
 * Eviction needs a clock, but `GameState` is duplicated by hand in the client
 * (`artifacts/dawaar/context/GameContext.tsx`) and mirrored in the OpenAPI
 * schema, so adding a field there is a contract change. Holding the timestamp in
 * a side map keeps eviction purely server-side and the wire shape untouched.
 */
const lastTouched = new Map<string, number>();

export const gameEvents: EventEmitter = new EventEmitter();

/**
 * Listener ceiling per event name.
 *
 * This file used to call `setMaxListeners(0)`, which disables
 * `MaxListenersExceededWarning` entirely — the one signal Node gives you that
 * listeners are accumulating. A finite threshold set just above the designed
 * maximum keeps the diagnostic: a game holds at most 6 players, waiters are
 * capped per game, and the small margin absorbs a burst of concurrent
 * subscribes racing the cap check. If this warning ever fires, something really
 * is leaking.
 */
const LISTENER_WARN_THRESHOLD = config.maxPollWaitersPerGame + 8;
gameEvents.setMaxListeners(LISTENER_WARN_THRESHOLD);

/** Games with no write and no read for this long are evicted. */
export const IDLE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
/** Finished games are kept briefly so every client can poll the final state. */
export const FINISHED_TTL_MS = 5 * 60 * 1000; // 5 minutes
/** Hard ceiling on live games; the least-recently-touched are evicted first. */
export const MAX_GAMES = 5000;
const SWEEP_INTERVAL_MS = 60 * 1000;

let dirty = false;
let writeTimer: ReturnType<typeof setTimeout> | null = null;
let writingPromise: Promise<void> | null = null;
const DEBOUNCE_MS = 250;
let snapshotFailures = 0;

function touch(gameId: string): void {
  lastTouched.set(gameId, Date.now());
}

/**
 * When a restored game was last actually active.
 *
 * Stamping every restored game with the boot time restarts its idle window on
 * each deploy, so a snapshot full of long-dead games would outlive every
 * restart and never be swept. The last log entry already carries a real
 * timestamp, so use it — no schema change, and eviction survives a restart.
 */
export function restoredTouchTime(state: GameState): number {
  const last = state.log[state.log.length - 1];
  if (last) {
    const parsed = Date.parse(last.timestamp);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Date.now();
}

function loadGamesFromFile(): void {
  try {
    if (fs.existsSync(GAMES_FILE)) {
      const raw = fs.readFileSync(GAMES_FILE, 'utf-8');
      const saved = JSON.parse(raw) as Record<string, GameState>;
      for (const [id, state] of Object.entries(saved)) {
        if (state.status !== 'finished') {
          games.set(id, state);
          lastTouched.set(id, restoredTouchTime(state));
        }
      }
    }
  } catch (err) {
    // Corrupt snapshot — start fresh, but say so. Booting silently with an empty
    // store looks identical to "no games yet", which is how a lost snapshot goes
    // unnoticed until someone asks where their game went.
    console.error('[gameStore] Could not read snapshot; starting with an empty store.', err);
  }
}

async function writeNow(): Promise<void> {
  dirty = false;
  try {
    await fsp.mkdir(DATA_DIR, { recursive: true });
    const obj: Record<string, GameState> = {};
    // Finished games are dropped at load anyway, so writing them is pure cost.
    for (const [id, state] of games.entries()) {
      if (state.status !== 'finished') obj[id] = state;
    }
    const tmp = GAMES_FILE + '.tmp';
    await fsp.writeFile(tmp, JSON.stringify(obj), 'utf-8');
    await fsp.rename(tmp, GAMES_FILE);
    if (snapshotFailures > 0) {
      console.warn(`[gameStore] Snapshot recovered after ${snapshotFailures} failed attempt(s).`);
      snapshotFailures = 0;
    }
  } catch (err) {
    // In-memory state still serves requests, so this is not fatal — but a store
    // that has silently stopped persisting is a crash away from losing every
    // live game, and nothing else would ever report it. Log the first failure
    // and then every 20th, so a read-only disk is visible without flooding.
    snapshotFailures += 1;
    if (snapshotFailures === 1 || snapshotFailures % 20 === 0) {
      console.error(`[gameStore] Snapshot write failed (${snapshotFailures} consecutive).`, err);
    }
  }
}

function scheduleWrite(): void {
  dirty = true;
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    writingPromise = writeNow().finally(() => { writingPromise = null; });
  }, DEBOUNCE_MS);
  // Never let a pending snapshot hold the process open.
  writeTimer.unref?.();
}

export async function flushGamesToFile(): Promise<void> {
  if (writeTimer) { clearTimeout(writeTimer); writeTimer = null; }
  if (writingPromise) {
    try { await writingPromise; } catch { /* writeNow already logged it */ }
  }
  if (dirty) await writeNow();
}

loadGamesFromFile();

export function getGame(gameId: string): GameState | undefined {
  const state = games.get(gameId);
  // A game being read is a game in use: reading keeps a lobby whose players are
  // waiting (and therefore only polling) from being swept as idle.
  if (state) touch(gameId);
  return state;
}

export function setGame(gameId: string, state: GameState): void {
  games.set(gameId, state);
  touch(gameId);
  scheduleWrite();
  emitChange(gameId, state);
}

export function deleteGame(gameId: string): void {
  if (games.delete(gameId)) {
    lastTouched.delete(gameId);
    scheduleWrite();
    emitChange(gameId);
  }
}

function emitChange(gameId: string, state?: GameState): void {
  // Per-game event name: EventEmitter dispatches by name, so a change in one
  // game wakes only that game's waiters. The old single 'change' event invoked
  // every parked long-poll on the server — one player's roll doing work
  // proportional to every other game in flight.
  gameEvents.emit(changeEvent(gameId), gameId, state);
  // Kept for any legacy listener; with none registered this costs nothing.
  gameEvents.emit('change', gameId, state);
}

function changeEvent(gameId: string): string {
  return `change:${gameId}`;
}

/**
 * Subscribe to changes for a single game. Returns an unsubscribe function.
 *
 * Always call the returned function — a long-poll that ends without
 * unsubscribing leaks a listener and, through the closure, the `res` object.
 */
export function onGameChange(
  gameId: string,
  handler: (changedId: string, state?: GameState) => void,
): () => void {
  const event = changeEvent(gameId);
  gameEvents.on(event, handler);
  return () => { gameEvents.off(event, handler); };
}

/** How many long-polls are currently parked on a game. */
export function waiterCount(gameId: string): number {
  return gameEvents.listenerCount(changeEvent(gameId));
}

export interface EvictionLimits {
  maxGames: number;
  idleTtlMs: number;
  finishedTtlMs: number;
}

const DEFAULT_LIMITS: EvictionLimits = {
  maxGames: MAX_GAMES,
  idleTtlMs: IDLE_TTL_MS,
  finishedTtlMs: FINISHED_TTL_MS,
};

/**
 * Evict games that no longer need to be in memory.
 *
 * Nothing used to remove a game from the store: finished games, abandoned
 * lobbies, and games whose players uninstalled all lived until the process
 * restarted. Returns the ids evicted so a caller (and a test) can assert it.
 *
 * `now` and `limits` are injectable so the policy is testable without waiting
 * two hours or allocating five thousand boards.
 */
export function evictStaleGames(
  now: number = Date.now(),
  limits: EvictionLimits = DEFAULT_LIMITS,
): string[] {
  const evicted: string[] = [];

  for (const [id, state] of games.entries()) {
    const touchedAt = lastTouched.get(id) ?? 0;
    const age = now - touchedAt;
    const ttl = state.status === 'finished' ? limits.finishedTtlMs : limits.idleTtlMs;
    if (age >= ttl) evicted.push(id);
  }

  // Over the hard ceiling, drop the least-recently-touched first.
  if (games.size - evicted.length > limits.maxGames) {
    const dropping = new Set(evicted);
    const survivors = [...games.keys()]
      .filter(id => !dropping.has(id))
      .sort((a, b) => (lastTouched.get(a) ?? 0) - (lastTouched.get(b) ?? 0));
    const excess = survivors.length - limits.maxGames;
    for (let i = 0; i < excess; i++) evicted.push(survivors[i]);
  }

  for (const id of evicted) {
    games.delete(id);
    lastTouched.delete(id);
    // Wake anyone parked on this game so they get an immediate 404 instead of
    // holding a socket open for the full long-poll timeout.
    emitChange(id);
  }

  if (evicted.length > 0) scheduleWrite();
  return evicted;
}

/** Live game count — for tests and diagnostics. */
export function gameCount(): number {
  return games.size;
}

let sweepTimer: ReturnType<typeof setInterval> | null = null;

export function startEvictionSweep(): void {
  if (sweepTimer) return;
  sweepTimer = setInterval(() => { evictStaleGames(); }, SWEEP_INTERVAL_MS);
  // Unref'd so the sweep never keeps the process alive on its own.
  sweepTimer.unref?.();
}

export function stopEvictionSweep(): void {
  if (sweepTimer) { clearInterval(sweepTimer); sweepTimer = null; }
}

if (!config.isTest) startEvictionSweep();

export function generateGameId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
