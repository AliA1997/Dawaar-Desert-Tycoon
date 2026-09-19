// Backward-compatibility re-export facade. See `../domains/services/gameStore.ts`.
export {
  getGame,
  setGame,
  deleteGame,
  generateGameId,
  gameEvents,
  onGameChange,
  waiterCount,
  evictStaleGames,
  gameCount,
  startEvictionSweep,
  stopEvictionSweep,
  flushGamesToFile,
  IDLE_TTL_MS,
  FINISHED_TTL_MS,
  MAX_GAMES,
} from '../domains/services/gameStore.js';
