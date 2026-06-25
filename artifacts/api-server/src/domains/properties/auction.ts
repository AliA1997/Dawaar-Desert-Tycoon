import type { GameState } from '../turns/state.js';

export function auctionBuy(state: GameState, winnerId: string, propertyIndex: number, price: number): { state: GameState; error?: string } {
  const winner = state.players.find(p => p.id === winnerId);
  if (!winner) return { state, error: 'Player not found' };
  if (winner.isBankrupt) return { state, error: 'Bankrupt players cannot bid' };

  const space = state.board[propertyIndex];
  if (!space) return { state, error: 'Invalid property' };
  if (space.ownerId) return { state, error: 'Property is already owned' };
  if (!space.price) return { state, error: 'Property cannot be purchased' };
  if (price < 1) return { state, error: 'Bid must be at least 1 Dawaar Dollars' };
  if (winner.money < price) return { state, error: 'Not enough money' };

  const newBoard = state.board.map((s, i) => i === propertyIndex ? { ...s, ownerId: winnerId } : s);
  const newPlayers = state.players.map(p =>
    p.id === winnerId ? { ...p, money: p.money - price, properties: [...p.properties, propertyIndex] } : p
  );

  return {
    state: {
      ...state,
      players: newPlayers,
      board: newBoard,
      version: state.version + 1,
      log: [
        ...state.log,
        { message: `${winner.name} won the auction for ${space.name} at ${price.toLocaleString()} Dawaar Coins`, timestamp: new Date().toISOString(), playerId: winnerId },
      ].slice(-50),
    },
  };
}
