import { BOARD, type BoardSpace } from '../board/index.js';
import type { Player } from '../players/types.js';

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface BoardProperty {
  index: number;
  name: string;
  nameAr: string;
  type: string;
  price?: number;
  rent?: number[];
  houseCost?: number;
  hotelCost?: number;
  mortgageValue?: number;
  colorGroup?: string;
  taxAmount?: number;
  ownerId: string | null;
  houses: number;
  hotel: boolean;
  isMortgaged: boolean;
}

export interface GameLog {
  message: string;
  timestamp: string;
  playerId?: string | null;
}

export interface TradeOffer {
  fromPlayerId: string;
  toPlayerId: string;
  offeredPropertyIndices: number[];
  requestedPropertyIndices: number[];
  offeredMoney: number;
  requestedMoney: number;
}

export interface PendingTaxChoice {
  playerId: string;
  flat: number;
  percent: number;
}

export interface GameState {
  gameId: string;
  boardId?: string;
  status: GameStatus;
  players: Player[];
  board: BoardProperty[];
  currentPlayerId: string | null;
  diceRoll: number[] | null;
  hasRolled: boolean;
  version: number;
  log: GameLog[];
  winnerId: string | null;
  pendingTrade: TradeOffer | null;
  freeParkingPool: number;
  pendingTaxChoice: PendingTaxChoice | null;
}

export function createInitialBoard(sourceBoard?: BoardSpace[]): BoardProperty[] {
  return (sourceBoard ?? BOARD).map(space => ({
    index: space.index,
    name: space.name,
    nameAr: space.nameAr,
    type: space.type,
    price: space.price,
    rent: space.rent,
    houseCost: space.houseCost,
    hotelCost: space.hotelCost,
    mortgageValue: space.mortgageValue,
    colorGroup: space.colorGroup,
    taxAmount: space.taxAmount,
    railroadRent: space.railroadRent,
    ownerId: null,
    houses: 0,
    hotel: false,
    isMortgaged: false,
  } as BoardProperty));
}

export function getNextPlayerId(state: GameState, currentId: string): string {
  const activePlayers = state.players.filter(p => !p.isBankrupt);
  const idx = activePlayers.findIndex(p => p.id === currentId);
  return activePlayers[(idx + 1) % activePlayers.length].id;
}

export function countRailroadsOwned(state: GameState, ownerId: string): number {
  return state.board.filter(s => s.type === 'railroad' && s.ownerId === ownerId).length;
}

export function countUtilitiesOwned(state: GameState, ownerId: string): number {
  return state.board.filter(s => s.type === 'utility' && s.ownerId === ownerId).length;
}

export function ownsColorGroup(state: GameState, ownerId: string, colorGroup: string): boolean {
  const groupSpaces = state.board.filter(s => s.colorGroup === colorGroup);
  return groupSpaces.length > 0 && groupSpaces.every(s => s.ownerId === ownerId);
}

export function computeNetWorth(player: Player, board: BoardProperty[]): number {
  return player.money + board
    .filter(s => s.ownerId === player.id)
    .reduce((sum, s) => {
      const baseVal = s.isMortgaged ? (s.mortgageValue ?? 0) : (s.price ?? 0);
      const buildVal = s.houses * Math.floor((s.houseCost ?? 0) / 2) + (s.hotel ? Math.floor((s.hotelCost ?? 0) / 2) : 0);
      return sum + baseVal + buildVal;
    }, 0);
}
