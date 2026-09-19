import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Configuration, read once at boot into typed values.
 *
 * Nothing else in the server reads `process.env` directly: a variable consulted
 * in five modules is a variable that means five slightly different things, and a
 * missing one surfaces on the first request instead of in the deploy log.
 */

/**
 * Where the JSON snapshots live.
 *
 * Resolved HERE, and only here, on purpose. The two stores each derived it
 * themselves with `path.join(__dirname, '..', '..', '..', 'data')` — a climb
 * that counts the *source* file's nesting. esbuild flattens every module into
 * `dist/index.cjs`, so in the built server that same climb landed three levels
 * above the package instead of in `artifacts/api-server/data`: the deployed
 * process read and wrote a different directory than dev, and restored zero
 * games from a snapshot that was sitting right there.
 *
 * This file sits one level below the package root, which is exactly where
 * `dist/index.cjs` sits too — so `../data` is correct in both. `DATA_DIR`
 * overrides it when the deploy wants an explicit mounted volume.
 */
function resolveDataDir(): string {
  const override = process.env['DATA_DIR'];
  if (override) return path.resolve(override);
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.join(here, '..', 'data');
}

/**
 * Resolve the listen port, failing loudly if it is missing or nonsense.
 *
 * Deliberately a function rather than a field on `config`: only the process
 * entry binds a port, and the test suite imports `app.ts` without ever
 * listening. Requiring PORT at module scope made importing the app fail under
 * vitest — a boot check is meant to catch a misconfigured deploy, not to make
 * the app unimportable.
 */
export function requirePort(): number {
  const raw = process.env['PORT'];
  if (!raw) {
    throw new Error(
      'PORT environment variable is required but was not provided. ' +
      'Set PORT (the deploy platform normally injects it; local dev uses 3001).',
    );
  }
  const port = Number(raw);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${raw}". Expected a positive integer.`);
  }
  return port;
}

function parseOrigins(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw.split(',').map(o => o.trim()).filter(Boolean);
}

function positiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

const nodeEnv = process.env['NODE_ENV'] ?? 'development';

export const config = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: !!process.env['VITEST'] || nodeEnv === 'test',

  /** Directory holding the JSON snapshots. See `resolveDataDir`. */
  dataDir: resolveDataDir(),

  /**
   * Comma-separated browser origins permitted to call the API.
   *
   * The React Native client sends no `Origin`, so it is unaffected either way.
   * Empty means "no allowlist configured" — see `preflight.ts`, which says so
   * out loud in production rather than letting `*` pass unnoticed.
   */
  corsAllowedOrigins: parseOrigins(process.env['CORS_ALLOWED_ORIGINS']),

  /** Largest accepted request body. The biggest legitimate one is a trade, well under 8 KB. */
  bodyLimit: process.env['BODY_LIMIT'] ?? '64kb',

  /** How long a long-poll is parked before answering with the current state. */
  pollTimeoutMs: positiveInt(process.env['POLL_TIMEOUT_MS'], 20_000),

  /** Concurrent long-polls allowed per game; beyond this the server answers immediately. */
  maxPollWaitersPerGame: positiveInt(process.env['MAX_POLL_WAITERS_PER_GAME'], 24),

  /** Grace period for in-flight requests during shutdown. */
  shutdownTimeoutMs: positiveInt(process.env['SHUTDOWN_TIMEOUT_MS'], 25_000),
} as const;

export type Config = typeof config;
