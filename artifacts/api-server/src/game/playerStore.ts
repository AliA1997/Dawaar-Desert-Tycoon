import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');

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

function loadProfiles(): void {
  try {
    if (fs.existsSync(PLAYERS_FILE)) {
      const raw = fs.readFileSync(PLAYERS_FILE, 'utf-8');
      const obj = JSON.parse(raw) as Record<string, PlayerProfile>;
      for (const [id, p] of Object.entries(obj)) profiles.set(id, p);
    }
  } catch { /* corrupt — fresh */ }
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
  } catch { /* ignore */ }
}

function scheduleWrite(): void {
  dirty = true;
  if (writeTimer) return;
  writeTimer = setTimeout(() => {
    writeTimer = null;
    writingPromise = writeNow().finally(() => { writingPromise = null; });
  }, DEBOUNCE_MS);
}

export async function flushPlayersToFile(): Promise<void> {
  if (writeTimer) { clearTimeout(writeTimer); writeTimer = null; }
  if (writingPromise) { try { await writingPromise; } catch {} }
  if (dirty) await writeNow();
}

loadProfiles();

function computeUnlocks(points: number): number[] {
  const unlocked: number[] = [];
  ADVANTAGE_THRESHOLDS.forEach((cost, i) => { if (points >= cost) unlocked.push(i); });
  return unlocked;
}

export function getProfile(playerId: string): PlayerProfile {
  let p = profiles.get(playerId);
  if (!p) {
    p = {
      playerId,
      rewardPoints: 0,
      unlockedAdvantages: [],
      updatedAt: new Date().toISOString(),
    };
    profiles.set(playerId, p);
  }
  return p;
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

const isTest = !!process.env.VITEST || process.env.NODE_ENV === 'test';
let shuttingDown = false;
async function gracefulShutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  try { await flushPlayersToFile(); } finally { /* gameStore handles process.exit */ }
}
if (!isTest) {
  process.once('SIGTERM', gracefulShutdown);
  process.once('SIGINT', gracefulShutdown);
}
