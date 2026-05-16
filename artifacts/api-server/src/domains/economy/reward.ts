import type { GameState } from '../turns/state.js';

const REWARD = 1500;

export function claimAdReward(state: GameState, playerId: string): { state: GameState; error?: string } {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return { state, error: 'Player not found' };
  if (player.isBankrupt) return { state, error: 'Player is bankrupt' };

  return {
    state: {
      ...state,
      players: state.players.map(p =>
        p.id === playerId ? { ...p, money: p.money + REWARD } : p
      ),
      version: state.version + 1,
      log: [
        ...state.log,
        {
          message: `${player.name} watched a sponsored video and earned ${REWARD} DHS!`,
          timestamp: new Date().toISOString(),
          playerId,
        },
      ].slice(-50),
    },
  };
}
