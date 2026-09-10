import type { Server } from 'http';
import app from './app.js';
import { config, requirePort } from './config.js';
import { runPreflight } from './preflight.js';
import { flushGamesToFile, stopEvictionSweep } from './domains/services/gameStore.js';
import { flushPlayersToFile } from './domains/players/profileStore.js';

const port = requirePort();

const server: Server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);

  // After `listen`, never before: /api/healthz must answer for the platform
  // health check even when something else is misconfigured, and a container that
  // boots and explains itself beats one that crash-loops.
  runPreflight();
});

let shuttingDown = false;

/**
 * One shutdown path for the whole process.
 *
 * Both stores used to register their own `process.once('SIGTERM')` as a module
 * side effect, and the game store called `process.exit(0)` as soon as ITS flush
 * resolved — so whether reward points survived a deploy came down to which of
 * two unordered promises finished first. Ordering the flushes here makes that
 * deterministic, and closing the server first means in-flight requests (a
 * long-poll can be parked for 20s) get to finish instead of being severed.
 */
async function shutdown(signal: string, exitCode = 0): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[shutdown] ${signal} received; draining.`);

  // A stuck socket must not hold the deploy open forever.
  const forced = setTimeout(() => {
    console.error('[shutdown] Drain deadline exceeded; forcing exit.');
    process.exit(exitCode);
  }, config.shutdownTimeoutMs);
  forced.unref?.();

  stopEvictionSweep();

  await new Promise<void>(resolve => server.close(() => resolve()));

  // Sequential, not concurrent: each flush must actually complete before exit.
  try {
    await flushGamesToFile();
    await flushPlayersToFile();
  } catch (err) {
    console.error('[shutdown] Error while flushing state.', err);
  }

  clearTimeout(forced);
  console.log('[shutdown] Drain complete.');
  process.exit(exitCode);
}

process.once('SIGTERM', () => { void shutdown('SIGTERM'); });
process.once('SIGINT', () => { void shutdown('SIGINT'); });

// A process that keeps serving after an uncaught throw is in an unknown state,
// and the next request gets served by it. Log with the error object so the stack
// is preserved, then drain through the same path.
process.on('uncaughtException', (err) => {
  console.error('[fatal] Uncaught exception.', err);
  void shutdown('uncaughtException', 1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[fatal] Unhandled promise rejection.', reason);
  void shutdown('unhandledRejection', 1);
});

export default server;
