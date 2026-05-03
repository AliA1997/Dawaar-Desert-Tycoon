import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');

export interface PlayerProfile {
  id: string;
  rewardPoints: number;
  challengesCompleted: string[];
  updatedAt: string;
}

const players = new Map<string, PlayerProfile>();

let dirty = false;
let writeTimer: ReturnType<typeof setTimeout> | null = null;
let writingPromise: Promise<void> | null = null;
const WRITE_DEBOUNCE_MS = 250;

function loadFromFile(): void {
  try {
    if (fs.existsSync(PLAYERS_FILE)) {
      const raw = fs.readFileSync(PLAYERS_FILE, 'utf-8');
      const saved = JSON.parse(raw) as Record<string, PlayerProfile>;
      for (const [id, profile] of Object.entries(saved)) {
        players.set(id, profile);
      }
    }
  } catch {
    // ignore
  }
}

async function writeNow(): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
  }
  const obj: Record<string, PlayerProfile> = {};
  for (const [id, p] of players.entries()) obj[id] = p;
  const tmp = PLAYERS_FILE + '.tmp';
  await fs.promises.writeFile(tmp, JSON.stringify(obj), 'utf-8');
  await fs.promises.rename(tmp, PLAYERS_FILE);
}

async function flushIfDirty(): Promise<void> {
  if (!dirty) return;
  if (writingPromise) await writingPromise;
  if (!dirty) return;
  dirty = false;
  writingPromise = writeNow().catch(() => { dirty = true; }).finally(() => {
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

loadFromFile();

if (process.env.NODE_ENV !== 'test') {
  for (const sig of ['SIGTERM', 'SIGINT'] as const) {
    process.once(sig, async () => {
      if (writeTimer) { clearTimeout(writeTimer); writeTimer = null; }
      try { await flushIfDirty(); } catch {}
    });
  }
}

export function getPlayerProfile(id: string): PlayerProfile {
  let p = players.get(id);
  if (!p) {
    p = { id, rewardPoints: 0, challengesCompleted: [], updatedAt: new Date().toISOString() };
    players.set(id, p);
    scheduleSave();
  }
  return p;
}

export function awardReward(id: string, points: number, challengeId?: string): PlayerProfile {
  const p = getPlayerProfile(id);
  if (challengeId && p.challengesCompleted.includes(challengeId)) {
    return p;
  }
  const next: PlayerProfile = {
    ...p,
    rewardPoints: p.rewardPoints + points,
    challengesCompleted: challengeId ? [...p.challengesCompleted, challengeId] : p.challengesCompleted,
    updatedAt: new Date().toISOString(),
  };
  players.set(id, next);
  scheduleSave();
  return next;
}

export async function flushPlayersForTest(): Promise<void> {
  await flushIfDirty();
}

export function _resetForTest(): void {
  players.clear();
  dirty = false;
}
