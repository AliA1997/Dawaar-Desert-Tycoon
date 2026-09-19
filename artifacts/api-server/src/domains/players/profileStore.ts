import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import { config } from '../../config.js';

const DATA_DIR = config.dataDir;

// The suite exercises the real reward flow, which persists. Writing that to the
// tracked `players.json` meant every `pnpm test:api` run left fixture profiles
// in the working tree — noise that got committed by hand more than once. Tests
// get their own (gitignored) file instead.
const PLAYERS_FILE = path.join(DATA_DIR, config.isTest ? 'players.test.json' : 'players.json');

export interface PlayerProfile {
  playerId: string;
  rewardPoints: number;
  unlockedAdvantages: number[];
  updatedAt: string;
}

const ADVANTAGE_THRESHOLDS = [500, 1000, 2000];

const profiles = new Map<string, PlayerProfile>();

let dirty = false;
let writeTimer: ReturnType<typeof setTimeout> | null = null;
let writingPromise: Promise<void> | null = null;
const DEBOUNCE_MS = 250;
let snapshotFailures = 0;

function loadProfiles(): void {
  try {
    if (fs.existsSync(PLAYERS_FILE)) {
      const raw = fs.readFileSync(PLAYERS_FILE, 'utf-8');
      const obj = JSON.parse(raw) as Record<string, PlayerProfile>;
      for (const [id, p] of Object.entries(obj)) profiles.set(id, p);
    }
  } catch (err) {
    console.error('[profileStore] Could not read profiles; starting empty.', err);
  }
}

async function writeNow(): Promise<void> {
  dirty = false;
  try {
    await fsp.mkdir(DATA_DIR, { recursive: true });
    const obj: Record<string, PlayerProfile> = {};
    for (const [id, p] of profiles.entries()) obj[id] = p;
    const tmp = PLAYERS_FILE + '.tmp';
    await fsp.writeFile(tmp, JSON.stringify(obj), 'utf-8');
    await fsp.rename(tmp, PLAYERS_FILE);
  } catch (err) {
    snapshotFailures += 1;
    if (snapshotFailures === 1 || snapshotFailures % 20 === 0) {
      console.error(`[profileStore] Snapshot write failed (${snapshotFailures} consecutive).`, err);
    }
    return;
  }
  if (snapshotFailures > 0) {
    console.warn(`[profileStore] Snapshot recovered after ${snapshotFailures} failed attempt(s).`);
    snapshotFailures = 0;
  }
}

function scheduleWrite(): void {
  dirty = true;
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    writingPromise = writeNow().finally(() => { writingPromise = null; });
  }, DEBOUNCE_MS);
  writeTimer.unref?.();
}

export async function flushPlayersToFile(): Promise<void> {
  if (writeTimer) { clearTimeout(writeTimer); writeTimer = null; }
  if (writingPromise) { try { await writingPromise; } catch { /* writeNow already logged it */ } }
  if (dirty) await writeNow();
}

loadProfiles();

function computeUnlocks(points: number): number[] {
  const unlocked: number[] = [];
  ADVANTAGE_THRESHOLDS.forEach((cost, i) => { if (points >= cost) unlocked.push(i); });
  return unlocked;
}

/**
 * Read a profile, materialising a default for an unknown player.
 *
 * Deliberately does NOT insert: this is reachable unauthenticated as
 * `GET /api/players/:playerId/profile`, and inserting on read let anyone grow
 * the map without bound by requesting random ids. A profile is created only by
 * a write path (`addRewardPoints` / `setRewardPoints`).
 */
export function getProfile(playerId: string): PlayerProfile {
  const existing = profiles.get(playerId);
  if (existing) return existing;
  return {
    playerId,
    rewardPoints: 0,
    unlockedAdvantages: [],
    updatedAt: new Date().toISOString(),
  };
}

export function addRewardPoints(playerId: string, delta: number): PlayerProfile {
  const current = getProfile(playerId);
  const next: PlayerProfile = {
    ...current,
    rewardPoints: Math.max(0, current.rewardPoints + delta),
    updatedAt: new Date().toISOString(),
  };
  next.unlockedAdvantages = computeUnlocks(next.rewardPoints);
  profiles.set(playerId, next);
  scheduleWrite();
  return next;
}

export function setRewardPoints(playerId: string, points: number): PlayerProfile {
  const current = getProfile(playerId);
  const next: PlayerProfile = {
    ...current,
    rewardPoints: Math.max(0, points),
    updatedAt: new Date().toISOString(),
  };
  next.unlockedAdvantages = computeUnlocks(next.rewardPoints);
  profiles.set(playerId, next);
  scheduleWrite();
  return next;
}

