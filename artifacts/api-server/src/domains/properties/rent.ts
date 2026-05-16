import { countRailroadsOwned, countUtilitiesOwned, ownsColorGroup, type GameState } from '../turns/state.js';

export function calculateRent(state: GameState, spaceIdx: number, diceTotal: number): number {
  const space = state.board[spaceIdx];
  if (!space || !space.ownerId || space.isMortgaged) return 0;

  if (space.type === 'railroad') {
    const count = countRailroadsOwned(state, space.ownerId);
    const railroadRent = (space as { railroadRent?: number[] }).railroadRent;
    return railroadRent ? railroadRent[count - 1] ?? 250 * count : 250 * count;
  }
  if (space.type === 'utility') {
    const count = countUtilitiesOwned(state, space.ownerId);
    return diceTotal * (count === 2 ? 10 : 4);
  }
  if (space.type === 'property' && space.rent) {
    if (space.hotel) return space.rent[5];
    if (space.houses > 0) return space.rent[space.houses];
    if (ownsColorGroup(state, space.ownerId, space.colorGroup!)) return space.rent[0] * 2;
    return space.rent[0];
  }
  return 0;
}
