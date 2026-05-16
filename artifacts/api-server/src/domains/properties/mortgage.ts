import type { GameState } from '../turns/state.js';

export function mortgageProperty(state: GameState, playerId: string, propertyIndex: number, action: 'mortgage' | 'unmortgage'): { state: GameState; error?: string } {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return { state, error: 'Player not found' };
  const space = state.board[propertyIndex];
  if (!space) return { state, error: 'Invalid property' };
  if (space.ownerId !== playerId) return { state, error: 'You do not own this property' };

  const mortgageValue = space.mortgageValue || 0;

  if (action === 'mortgage') {
    if (space.isMortgaged) return { state, error: 'Already mortgaged' };
    if (space.houses > 0 || space.hotel) return { state, error: 'Sell buildings first' };
    const newBoard = state.board.map((s, i) => i === propertyIndex ? { ...s, isMortgaged: true } : s);
    const newPlayers = state.players.map(p => p.id === playerId ? { ...p, money: p.money + mortgageValue } : p);
    return {
      state: {
        ...state,
        players: newPlayers,
        board: newBoard,
        version: state.version + 1,
        log: [...state.log, { message: `${player.name} mortgaged ${space.name} for ${mortgageValue} DHS`, timestamp: new Date().toISOString(), playerId }].slice(-50),
      },
    };
  } else {
    if (!space.isMortgaged) return { state, error: 'Not mortgaged' };
    const unmortgageCost = Math.floor(mortgageValue * 1.1);
    if (player.money < unmortgageCost) return { state, error: 'Not enough money' };
    const newBoard = state.board.map((s, i) => i === propertyIndex ? { ...s, isMortgaged: false } : s);
    const newPlayers = state.players.map(p => p.id === playerId ? { ...p, money: p.money - unmortgageCost } : p);
    return {
      state: {
        ...state,
        players: newPlayers,
        board: newBoard,
        version: state.version + 1,
        log: [...state.log, { message: `${player.name} unmortgaged ${space.name} for ${unmortgageCost} DHS`, timestamp: new Date().toISOString(), playerId }].slice(-50),
      },
    };
  }
}
