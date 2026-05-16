import type { GameState } from '../turns/state.js';

export function buyProperty(state: GameState, playerId: string): { state: GameState; error?: string } {
  if (state.currentPlayerId !== playerId) return { state, error: 'Not your turn' };
  const player0 = state.players.find(p => p.id === playerId);
  if (!state.hasRolled && (!player0 || player0.doublesCount === 0)) return { state, error: 'Roll dice first' };

  const player = state.players.find(p => p.id === playerId)!;
  const space = state.board[player.position];

  if (!space.price) return { state, error: 'This space cannot be purchased' };
  if (space.ownerId) return { state, error: 'Property already owned' };
  if (player.money < space.price) return { state, error: 'Not enough money' };

  const newPlayers = state.players.map(p => p.id === playerId ? { ...p, money: p.money - space.price!, properties: [...p.properties, player.position] } : p);
  const newBoard = state.board.map((s, i) => i === player.position ? { ...s, ownerId: playerId } : s);

  return {
    state: {
      ...state,
      players: newPlayers,
      board: newBoard,
      version: state.version + 1,
      log: [...state.log, { message: `${player.name} bought ${space.name} for ${space.price} DHS`, timestamp: new Date().toISOString(), playerId }].slice(-50),
    },
  };
}
