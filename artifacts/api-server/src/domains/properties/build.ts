import { ownsColorGroup, type GameState } from '../turns/state.js';

export function buildHouse(state: GameState, playerId: string, propertyIndex: number): { state: GameState; error?: string } {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return { state, error: 'Player not found' };

  const space = state.board[propertyIndex];
  if (!space) return { state, error: 'Invalid property' };
  if (space.ownerId !== playerId) return { state, error: 'You do not own this property' };
  if (space.type !== 'property') return { state, error: 'Can only build on properties' };
  if (!space.colorGroup) return { state, error: 'No color group' };
  if (!ownsColorGroup(state, playerId, space.colorGroup)) return { state, error: 'You need to own all properties in this color group' };
  if (space.hotel) return { state, error: 'Already has a hotel' };

  const groupSpaces = state.board.filter(s => s.colorGroup === space.colorGroup);

  if (groupSpaces.some(s => s.isMortgaged)) {
    return { state, error: 'Cannot build while any property in this color group is mortgaged' };
  }

  if (space.houses < 4) {
    const minHouses = Math.min(...groupSpaces.map(s => s.hotel ? 5 : s.houses));
    if (space.houses > minHouses) {
      return { state, error: 'Build evenly — add a house to another property in this group first' };
    }
  } else {
    const othersReady = groupSpaces.filter(s => s.index !== propertyIndex).every(s => s.houses === 4 || s.hotel);
    if (!othersReady) {
      return { state, error: 'All properties in this group need 4 houses before building a hotel' };
    }
  }

  const cost = space.houses < 4 ? (space.houseCost || 1000) : (space.hotelCost || 1000);
  if (player.money < cost) return { state, error: 'Not enough money' };

  const newBoard = state.board.map((s, i) => {
    if (i === propertyIndex) {
      if (s.houses < 4) return { ...s, houses: s.houses + 1 };
      return { ...s, hotel: true, houses: 0 };
    }
    return s;
  });

  const newPlayers = state.players.map(p => p.id === playerId ? { ...p, money: p.money - cost } : p);
  const isHotel = space.houses === 4;
  const buildText = isHotel ? 'built a hotel' : `built a house (${space.houses + 1}/4)`;

  return {
    state: {
      ...state,
      players: newPlayers,
      board: newBoard,
      version: state.version + 1,
      log: [...state.log, { message: `${player.name} ${buildText} on ${space.name}`, timestamp: new Date().toISOString(), playerId }].slice(-50),
    },
  };
}

export function sellHouse(state: GameState, playerId: string, propertyIndex: number): { state: GameState; error?: string } {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return { state, error: 'Player not found' };

  const space = state.board[propertyIndex];
  if (!space) return { state, error: 'Invalid property' };
  if (space.ownerId !== playerId) return { state, error: 'You do not own this property' };
  if (!space.hotel && space.houses === 0) return { state, error: 'No buildings to sell' };

  let newBoard: typeof state.board;
  let refund: number;
  let logMessage: string;

  if (space.hotel) {
    refund = Math.floor((space.hotelCost || 1000) / 2);
    newBoard = state.board.map((s, i) => i === propertyIndex ? { ...s, hotel: false, houses: 4 } : s);
    logMessage = `${player.name} sold the hotel on ${space.name} for ${refund.toLocaleString()} DHS`;
  } else {
    refund = Math.floor((space.houseCost || 1000) / 2);
    newBoard = state.board.map((s, i) => i === propertyIndex ? { ...s, houses: s.houses - 1 } : s);
    logMessage = `${player.name} sold a house on ${space.name} for ${refund.toLocaleString()} DHS`;
  }

  const newPlayers = state.players.map(p => p.id === playerId ? { ...p, money: p.money + refund } : p);
  return {
    state: {
      ...state,
      players: newPlayers,
      board: newBoard,
      version: state.version + 1,
      log: [...state.log, { message: logMessage, timestamp: new Date().toISOString(), playerId }].slice(-50),
    },
  };
}
