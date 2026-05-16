import type { GameState } from '../turns/state.js';

export function chooseTax(state: GameState, playerId: string, choice: 'flat' | 'percent'): { state: GameState; error?: string } {
  const tc = state.pendingTaxChoice;
  if (!tc) return { state, error: 'No pending tax choice' };
  if (tc.playerId !== playerId) return { state, error: 'Not your tax choice' };

  const player = state.players.find(p => p.id === playerId);
  if (!player) return { state, error: 'Player not found' };

  const amount = choice === 'flat' ? tc.flat : tc.percent;
  const newPlayers = state.players.map(p => p.id === playerId ? { ...p, money: p.money - amount } : p);
  const newFreeParkingPool = state.freeParkingPool + amount;

  return {
    state: {
      ...state,
      players: newPlayers,
      freeParkingPool: newFreeParkingPool,
      pendingTaxChoice: null,
      version: state.version + 1,
      log: [...state.log, {
        message: `${player.name} paid ${amount.toLocaleString()} DHS tax (${choice === 'flat' ? 'flat rate' : '10% of net worth'}) — added to Free Parking pool`,
        timestamp: new Date().toISOString(),
        playerId,
      }].slice(-50),
    },
  };
}
