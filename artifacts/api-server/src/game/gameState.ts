import { BOARD, CHANCE_CARDS, COMMUNITY_CARDS } from './board.js';

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface Player {
  id: string;
  name: string;
  token: string;
  money: number;
  position: number;
  properties: number[];
  inJail: boolean;
  jailTurns: number;
  isBankrupt: boolean;
  color: string;
  doublesCount: number;
}

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

export interface GameState {
  gameId: string;
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
}

const PLAYER_COLORS = ['#C0392B', '#2980B9', '#27AE60', '#8E44AD', '#F39C12', '#1ABC9C'];
const STARTING_MONEY = 15000;

export function createInitialBoard(): BoardProperty[] {
  return BOARD.map(space => ({
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
    ownerId: null,
    houses: 0,
    hotel: false,
    isMortgaged: false,
  }));
}

export function createGame(gameId: string, playerName: string, playerId: string, token: string): GameState {
  const player: Player = {
    id: playerId,
    name: playerName,
    token,
    money: STARTING_MONEY,
    position: 0,
    properties: [],
    inJail: false,
    jailTurns: 0,
    isBankrupt: false,
    color: PLAYER_COLORS[0],
    doublesCount: 0,
  };

  return {
    gameId,
    status: 'waiting',
    players: [player],
    board: createInitialBoard(),
    currentPlayerId: null,
    diceRoll: null,
    hasRolled: false,
    version: 1,
    log: [{ message: `${playerName} created the game`, timestamp: new Date().toISOString(), playerId }],
    winnerId: null,
    pendingTrade: null,
  };
}

export function joinGame(state: GameState, playerName: string, playerId: string, token: string): { state: GameState; error?: string } {
  if (state.status !== 'waiting') return { state, error: 'Game has already started' };
  if (state.players.length >= 6) return { state, error: 'Game is full (max 6 players)' };
  if (state.players.find(p => p.id === playerId)) return { state, error: 'You are already in this game' };

  const colorIndex = state.players.length;
  const player: Player = {
    id: playerId,
    name: playerName,
    token,
    money: STARTING_MONEY,
    position: 0,
    properties: [],
    inJail: false,
    jailTurns: 0,
    isBankrupt: false,
    color: PLAYER_COLORS[colorIndex],
    doublesCount: 0,
  };

  const newState = {
    ...state,
    players: [...state.players, player],
    version: state.version + 1,
    log: [...state.log, { message: `${playerName} joined the game`, timestamp: new Date().toISOString(), playerId }],
  };
  return { state: newState };
}

export function startGame(state: GameState, playerId: string): { state: GameState; error?: string } {
  if (state.status !== 'waiting') return { state, error: 'Game already started' };
  if (state.players[0].id !== playerId) return { state, error: 'Only the host can start the game' };
  if (state.players.length < 2) return { state, error: 'Need at least 2 players to start' };

  const newState = {
    ...state,
    status: 'playing' as GameStatus,
    currentPlayerId: state.players[0].id,
    version: state.version + 1,
    log: [...state.log, { message: 'Game started! Good luck!', timestamp: new Date().toISOString() }],
  };
  return { state: newState };
}

function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function getNextPlayerId(state: GameState, currentId: string): string {
  const activePlayers = state.players.filter(p => !p.isBankrupt);
  const idx = activePlayers.findIndex(p => p.id === currentId);
  return activePlayers[(idx + 1) % activePlayers.length].id;
}

function countRailroadsOwned(state: GameState, ownerId: string): number {
  return state.board.filter(s => s.type === 'railroad' && s.ownerId === ownerId).length;
}

function countUtilitiesOwned(state: GameState, ownerId: string): number {
  return state.board.filter(s => s.type === 'utility' && s.ownerId === ownerId).length;
}

function ownsColorGroup(state: GameState, ownerId: string, colorGroup: string): boolean {
  const groupSpaces = state.board.filter(s => s.colorGroup === colorGroup);
  return groupSpaces.every(s => s.ownerId === ownerId);
}

function calculateRent(state: GameState, spaceIdx: number, diceTotal: number): number {
  const space = state.board[spaceIdx];
  if (!space.ownerId || space.isMortgaged) return 0;

  if (space.type === 'railroad') {
    const count = countRailroadsOwned(state, space.ownerId);
    return (space as any).railroadRent ? [250, 500, 1000, 2000][count - 1] : 250 * count;
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

export function rollDice(state: GameState, playerId: string): { state: GameState; dice: number[]; isDoubles: boolean; error?: string } {
  if (state.status !== 'playing') return { state, dice: [], isDoubles: false, error: 'Game not in progress' };
  if (state.currentPlayerId !== playerId) return { state, dice: [], isDoubles: false, error: 'Not your turn' };
  if (state.hasRolled) return { state, dice: [], isDoubles: false, error: 'Already rolled this turn' };

  const player = state.players.find(p => p.id === playerId)!;
  const wasInJail = player.inJail;
  const d1 = rollDie();
  const d2 = rollDie();
  const total = d1 + d2;
  const isDoubles = d1 === d2;
  const logs: GameLog[] = [];
  let newPlayers = [...state.players];
  let newBoard = [...state.board];

  // Handle jail
  if (player.inJail) {
    if (isDoubles) {
      logs.push({ message: `${player.name} rolled doubles [${d1},${d2}] and escaped jail!`, timestamp: new Date().toISOString(), playerId });
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, inJail: false, jailTurns: 0 } : p);
    } else {
      const jailTurns = player.jailTurns + 1;
      if (jailTurns >= 3) {
        logs.push({ message: `${player.name} paid 500 DHS bail after 3 turns in jail`, timestamp: new Date().toISOString(), playerId });
        newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, inJail: false, jailTurns: 0, money: p.money - 500, doublesCount: 0 } : p);
      } else {
        logs.push({ message: `${player.name} is stuck in jail (turn ${jailTurns})`, timestamp: new Date().toISOString(), playerId });
        newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, jailTurns, doublesCount: 0 } : p);
        return {
          state: { ...state, players: newPlayers, diceRoll: [d1, d2], hasRolled: true, version: state.version + 1, log: [...state.log, ...logs] },
          dice: [d1, d2],
          isDoubles: false,
        };
      }
    }
  }

  // Move player
  const updatedPlayer = newPlayers.find(p => p.id === playerId)!;
  let newPosition = (updatedPlayer.position + total) % 40;
  let moneyDelta = 0;

  // Passed GO
  if (!updatedPlayer.inJail && newPosition < updatedPlayer.position) {
    moneyDelta += 2000;
    logs.push({ message: `${player.name} passed GO and collected 2000 DHS!`, timestamp: new Date().toISOString() });
  }

  newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: newPosition, money: p.money + moneyDelta } : p);
  const landedSpace = newBoard[newPosition];
  logs.push({ message: `${player.name} rolled [${d1},${d2}] and moved to ${landedSpace.name}`, timestamp: new Date().toISOString(), playerId });

  // Handle space effects
  if (landedSpace.type === 'go_to_jail') {
    newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: 10, inJail: true, jailTurns: 0 } : p);
    logs.push({ message: `${player.name} is sent to jail!`, timestamp: new Date().toISOString() });
  } else if (landedSpace.type === 'tax') {
    const tax = (BOARD[newPosition] as any).taxAmount ?? 0;
    newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money - tax } : p);
    logs.push({ message: `${player.name} paid ${tax} DHS tax`, timestamp: new Date().toISOString() });
  } else if (landedSpace.type === 'chance') {
    const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
    logs.push({ message: `CHANCE: ${card.text}`, timestamp: new Date().toISOString() });
    ({ newPlayers, newBoard } = applyCardAction(card.action, playerId, newPlayers, newBoard, state, total, logs));
    newPosition = newPlayers.find(p => p.id === playerId)!.position;
  } else if (landedSpace.type === 'community') {
    const card = COMMUNITY_CARDS[Math.floor(Math.random() * COMMUNITY_CARDS.length)];
    logs.push({ message: `COMMUNITY CHEST: ${card.text}`, timestamp: new Date().toISOString() });
    ({ newPlayers, newBoard } = applyCardAction(card.action, playerId, newPlayers, newBoard, state, total, logs));
    newPosition = newPlayers.find(p => p.id === playerId)!.position;
  } else if ((landedSpace.type === 'property' || landedSpace.type === 'railroad' || landedSpace.type === 'utility') && landedSpace.ownerId && landedSpace.ownerId !== playerId) {
    const rent = calculateRent({ ...state, board: newBoard, players: newPlayers }, newPosition, total);
    if (rent > 0) {
      newPlayers = newPlayers.map(p => {
        if (p.id === playerId) return { ...p, money: p.money - rent };
        if (p.id === landedSpace.ownerId) return { ...p, money: p.money + rent };
        return p;
      });
      logs.push({ message: `${player.name} paid ${rent} DHS rent to ${newPlayers.find(p => p.id === landedSpace.ownerId)?.name}`, timestamp: new Date().toISOString() });
    }
  }

  // Check bankruptcies — clear their properties from the board
  const newlyBankrupt = newPlayers.filter(p => p.money < 0 && !p.isBankrupt);
  if (newlyBankrupt.length > 0) {
    const bankruptIds = new Set(newlyBankrupt.map(p => p.id));
    newBoard = newBoard.map(s => {
      if (s.ownerId && bankruptIds.has(s.ownerId)) {
        return { ...s, ownerId: null, houses: 0, hotel: false, isMortgaged: false };
      }
      return s;
    });
    newPlayers = newPlayers.map(p => {
      if (bankruptIds.has(p.id)) {
        logs.push({ message: `${p.name} is bankrupt! Properties returned to market.`, timestamp: new Date().toISOString() });
        return { ...p, isBankrupt: true, properties: [], doublesCount: 0 };
      }
      return p;
    });
  }

  // Check win condition
  const activePlayers = newPlayers.filter(p => !p.isBankrupt);
  let newStatus: GameStatus = state.status;
  let winnerId: string | null = null;
  if (activePlayers.length === 1) {
    newStatus = 'finished';
    winnerId = activePlayers[0].id;
    logs.push({ message: `${activePlayers[0].name} wins the game!`, timestamp: new Date().toISOString() });
  }

  // ── Doubles rule ────────────────────────────────────────────────────────────
  // If player rolled doubles, grant a re-roll UNLESS:
  //   - they landed in jail (go_to_jail space or card)
  //   - they escaped jail via doubles (first roll after jail escape is not a bonus)
  const playerFinal = newPlayers.find(p => p.id === playerId)!;
  const nowInJail = playerFinal.inJail;
  const escapedJailViaDoubles = wasInJail && isDoubles && !nowInJail;
  let finalHasRolled = true;

  if (isDoubles && !nowInJail && !escapedJailViaDoubles && newStatus !== 'finished') {
    const newDoublesCount = (player.doublesCount ?? 0) + 1;
    if (newDoublesCount >= 3) {
      // Triple consecutive doubles → send to jail
      newPlayers = newPlayers.map(p => p.id === playerId
        ? { ...p, position: 10, inJail: true, jailTurns: 0, doublesCount: 0 }
        : p);
      logs.push({ message: `${player.name} rolled doubles 3 times and is sent to jail!`, timestamp: new Date().toISOString() });
      finalHasRolled = true;
    } else {
      // Grant re-roll
      newPlayers = newPlayers.map(p => p.id === playerId
        ? { ...p, doublesCount: newDoublesCount }
        : p);
      finalHasRolled = false;
    }
  } else {
    // Non-doubles, jail, or escaped via doubles: reset counter
    newPlayers = newPlayers.map(p => p.id === playerId
      ? { ...p, doublesCount: 0 }
      : p);
    finalHasRolled = true;
  }

  const newState: GameState = {
    ...state,
    players: newPlayers,
    board: newBoard,
    diceRoll: [d1, d2],
    hasRolled: finalHasRolled,
    version: state.version + 1,
    log: [...state.log, ...logs].slice(-50),
    status: newStatus,
    winnerId,
  };

  return { state: newState, dice: [d1, d2], isDoubles };
}

function applyCardAction(action: string, playerId: string, players: Player[], board: BoardProperty[], state: GameState, diceTotal: number, logs: GameLog[]): { newPlayers: Player[]; newBoard: BoardProperty[] } {
  let newPlayers = [...players];
  const newBoard = [...board];
  const player = newPlayers.find(p => p.id === playerId)!;

  switch (action) {
    case 'go_to_go':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: 0, money: p.money + 2000 } : p);
      break;
    case 'go_to_39':
      if (player.position > 39) newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 2000 } : p);
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: 39 } : p);
      break;
    case 'go_to_26':
      if (player.position > 26) newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 2000 } : p);
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: 26 } : p);
      break;
    case 'go_to_jail':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: 10, inJail: true, jailTurns: 0 } : p);
      break;
    case 'collect_500':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 500 } : p);
      break;
    case 'collect_1500':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 1500 } : p);
      break;
    case 'collect_2000':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 2000 } : p);
      break;
    case 'collect_2500':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 2500 } : p);
      break;
    case 'collect_200':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 200 } : p);
      break;
    case 'collect_1000_each': {
      const amount = 1000;
      let total = 0;
      newPlayers = newPlayers.map(p => {
        if (p.id !== playerId && !p.isBankrupt) { total += amount; return { ...p, money: p.money - amount }; }
        return p;
      });
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + total } : p);
      break;
    }
    case 'pay_1000':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money - 1000 } : p);
      break;
    case 'pay_1500':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money - 1500 } : p);
      break;
    case 'pay_500':
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money - 500 } : p);
      break;
    case 'nearest_railroad': {
      const railroads = [5, 15, 25, 35];
      const pos = player.position;
      const nearest = railroads.find(r => r > pos) || railroads[0];
      if (nearest < pos) newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + 2000 } : p);
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: nearest } : p);
      break;
    }
    case 'back_3':
      // Correct board wrap: position 1 - 3 = position 38 (not 0)
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: (p.position - 3 + 40) % 40 } : p);
      break;
  }

  return { newPlayers, newBoard };
}

export function buyProperty(state: GameState, playerId: string): { state: GameState; error?: string } {
  if (state.currentPlayerId !== playerId) return { state, error: 'Not your turn' };
  if (!state.hasRolled) return { state, error: 'Roll dice first' };

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

export function endTurn(state: GameState, playerId: string): { state: GameState; error?: string } {
  if (state.currentPlayerId !== playerId) return { state, error: 'Not your turn' };
  if (!state.hasRolled) return { state, error: 'Must roll dice before ending turn' };

  const nextPlayerId = getNextPlayerId(state, playerId);
  const nextPlayer = state.players.find(p => p.id === nextPlayerId)!;

  return {
    state: {
      ...state,
      currentPlayerId: nextPlayerId,
      hasRolled: false,
      diceRoll: null,
      version: state.version + 1,
      log: [...state.log, { message: `${nextPlayer.name}'s turn`, timestamp: new Date().toISOString() }].slice(-50),
      // Reset doubles counter for the player who just ended their turn
      players: state.players.map(p => p.id === playerId ? { ...p, doublesCount: 0 } : p),
    },
  };
}

export function payJail(state: GameState, playerId: string): { state: GameState; error?: string } {
  if (state.status !== 'playing') return { state, error: 'Game not in progress' };
  if (state.currentPlayerId !== playerId) return { state, error: 'Not your turn' };
  if (state.hasRolled) return { state, error: 'Cannot pay bail after rolling' };

  const player = state.players.find(p => p.id === playerId);
  if (!player) return { state, error: 'Player not found' };
  if (!player.inJail) return { state, error: 'You are not in jail' };
  if (player.money < 500) return { state, error: 'Not enough money to pay bail (500 DHS required)' };

  const newPlayers = state.players.map(p =>
    p.id === playerId ? { ...p, inJail: false, jailTurns: 0, money: p.money - 500, doublesCount: 0 } : p
  );

  return {
    state: {
      ...state,
      players: newPlayers,
      version: state.version + 1,
      log: [...state.log, {
        message: `${player.name} paid 500 DHS bail and is free to roll!`,
        timestamp: new Date().toISOString(),
        playerId,
      }].slice(-50),
    },
  };
}

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

export function proposeTrade(state: GameState, trade: TradeOffer): { state: GameState; error?: string } {
  const fromPlayer = state.players.find(p => p.id === trade.fromPlayerId);
  const toPlayer = state.players.find(p => p.id === trade.toPlayerId);
  if (!fromPlayer || !toPlayer) return { state, error: 'Player not found' };

  for (const idx of trade.offeredPropertyIndices) {
    if (state.board[idx]?.ownerId !== trade.fromPlayerId) return { state, error: 'You do not own all offered properties' };
  }
  for (const idx of trade.requestedPropertyIndices) {
    if (state.board[idx]?.ownerId !== trade.toPlayerId) return { state, error: 'Opponent does not own all requested properties' };
  }
  if (fromPlayer.money < trade.offeredMoney) return { state, error: 'Not enough money for trade' };

  return {
    state: {
      ...state,
      pendingTrade: trade,
      version: state.version + 1,
      log: [...state.log, { message: `${fromPlayer.name} proposed a trade with ${toPlayer.name}`, timestamp: new Date().toISOString(), playerId: trade.fromPlayerId }].slice(-50),
    },
  };
}

export function acceptTrade(state: GameState, playerId: string): { state: GameState; error?: string } {
  const trade = state.pendingTrade;
  if (!trade) return { state, error: 'No pending trade' };
  if (trade.toPlayerId !== playerId) return { state, error: 'Not your trade to accept' };

  let newPlayers = [...state.players];
  let newBoard = [...state.board];

  newPlayers = newPlayers.map(p => {
    if (p.id === trade.fromPlayerId) return { ...p, money: p.money - trade.offeredMoney + trade.requestedMoney };
    if (p.id === trade.toPlayerId) return { ...p, money: p.money - trade.requestedMoney + trade.offeredMoney };
    return p;
  });

  for (const idx of trade.offeredPropertyIndices) {
    newBoard = newBoard.map((s, i) => i === idx ? { ...s, ownerId: trade.toPlayerId } : s);
    newPlayers = newPlayers.map(p => {
      if (p.id === trade.fromPlayerId) return { ...p, properties: p.properties.filter(pi => pi !== idx) };
      if (p.id === trade.toPlayerId) return { ...p, properties: [...p.properties, idx] };
      return p;
    });
  }
  for (const idx of trade.requestedPropertyIndices) {
    newBoard = newBoard.map((s, i) => i === idx ? { ...s, ownerId: trade.fromPlayerId } : s);
    newPlayers = newPlayers.map(p => {
      if (p.id === trade.toPlayerId) return { ...p, properties: p.properties.filter(pi => pi !== idx) };
      if (p.id === trade.fromPlayerId) return { ...p, properties: [...p.properties, idx] };
      return p;
    });
  }

  const fromPlayer = state.players.find(p => p.id === trade.fromPlayerId)!;
  const toPlayer = state.players.find(p => p.id === trade.toPlayerId)!;

  return {
    state: {
      ...state,
      players: newPlayers,
      board: newBoard,
      pendingTrade: null,
      version: state.version + 1,
      log: [...state.log, { message: `${toPlayer.name} accepted ${fromPlayer.name}'s trade offer!`, timestamp: new Date().toISOString(), playerId }].slice(-50),
    },
  };
}

export function claimAdReward(state: GameState, playerId: string): { state: GameState; error?: string } {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return { state, error: 'Player not found' };
  if (player.isBankrupt) return { state, error: 'Player is bankrupt' };

  const REWARD = 1500;
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
