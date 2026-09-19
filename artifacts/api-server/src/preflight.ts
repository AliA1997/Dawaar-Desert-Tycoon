import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import { gameCount } from './domains/services/gameStore.js';

const DATA_DIR = config.dataDir;

/**
 * Boot-time checks for the assumptions a present variable does not prove.
 *
 * A preflight check LOGS AND DOES NOT EXIT. A crash-looping container gives you
 * restart counts; a running one that says exactly what is wrong gives you the
 * answer in a line — and it still answers /api/healthz while you read it.
 */
export function runPreflight(): void {
  checkSnapshotDirWritable();
  checkCorsConfigured();
  reportLoadedGames();
}

/**
 * The snapshot is the only crash-recovery this server has, and a read-only or
 * full data directory makes every write fail silently forever. Find out at boot
 * rather than after losing a game.
 */
function checkSnapshotDirWritable(): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const probe = path.join(DATA_DIR, '.preflight-probe');
    fs.writeFileSync(probe, 'ok');
    fs.unlinkSync(probe);
    console.log(`[preflight] OK: snapshot directory is writable (${DATA_DIR}).`);
  } catch (err) {
    console.error(
      `[preflight] PROBLEM: cannot write to ${DATA_DIR}. Games are held in memory ` +
      'and will be lost on restart. Mount a writable volume there, or set a data ' +
      'directory the process owns.',
      err,
    );
  }
}

function checkCorsConfigured(): void {
  if (config.corsAllowedOrigins.length > 0) {
    console.log(`[preflight] OK: CORS allowlist = ${config.corsAllowedOrigins.join(', ')}`);
    return;
  }
  if (config.isProduction) {
    console.warn(
      '[preflight] PROBLEM: CORS_ALLOWED_ORIGINS is unset, so every browser origin ' +
      'is accepted. The mobile client sends no Origin and is unaffected, but any web ' +
      'page can drive this API. Set CORS_ALLOWED_ORIGINS to the origins you actually serve.',
    );
  } else {
    console.log('[preflight] CORS: no allowlist set (development) — all origins accepted.');
  }
}

function reportLoadedGames(): void {
  console.log(`[preflight] Restored ${gameCount()} game(s) from the snapshot.`);
}
