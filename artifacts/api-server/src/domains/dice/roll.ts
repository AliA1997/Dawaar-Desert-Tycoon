import { CHANCE_CARDS, COMMUNITY_CARDS } from '../board/index.js';
import { applyCardAction } from '../events/cards.js';
import { calculateRent } from '../properties/rent.js';
import {
  computeNetWorth,
  type GameLog,
  type GameState,
  type GameStatus,
  type PendingTaxChoice,
} from '../turns/state.js';

export function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

const CARD_FINE_AMOUNTS: Record<string, number> = {
  pay_500: 500,
  pay_1000: 1000,
  pay_1500: 1500,
};

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
  let newFreeParkingPool = state.freeParkingPool;
  let newPendingTaxChoice: PendingTaxChoice | null = null;

  // Handle jail
  if (player.inJail) {
    if (isDoubles) {
      logs.push({ message: `${player.name} rolled doubles [${d1},${d2}] and escaped jail!`, timestamp: new Date().toISOString(), playerId });
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, inJail: false, jailTurns: 0 } : p);
    } else {
      const jailTurns = player.jailTurns + 1;
      if (jailTurns >= 3) {
        logs.push({ message: `${player.name} paid 500 Dawaar Dollars bail after 3 turns in jail`, timestamp: new Date().toISOString(), playerId });
        newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, inJail: false, jailTurns: 0, money: p.money - 500, doublesCount: 0 } : p);
      } else {
        logs.push({ message: `${player.name} is stuck in jail (turn ${jailTurns})`, timestamp: new Date().toISOString(), playerId });
        newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, jailTurns, doublesCount: 0 } : p);
        return {
          state: { ...state, players: newPlayers, diceRoll: [d1, d2], hasRolled: true, version: state.version + 1, log: [...state.log, ...logs], freeParkingPool: newFreeParkingPool, pendingTaxChoice: null },
          dice: [d1, d2],
          isDoubles: false,
        };
      }
    }
  }

  // Move player
  const updatedPlayer = newPlayers.find(p => p.id === playerId)!;
  const boardLen = newBoard.length;
  let newPosition = (updatedPlayer.position + total) % boardLen;
  let moneyDelta = 0;

  // Passed GO
  if (!updatedPlayer.inJail && newPosition < updatedPlayer.position) {
    moneyDelta += 2000;
    logs.push({ message: `${player.name} passed GO and collected 2000 Dawaar Coins!`, timestamp: new Date().toISOString() });
  }

  newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: newPosition, money: p.money + moneyDelta } : p);
  const landedSpace = newBoard[newPosition];
  logs.push({ message: `${player.name} rolled [${d1},${d2}] and moved to ${landedSpace.name}`, timestamp: new Date().toISOString(), playerId });

  // Handle space effects
  if (landedSpace.type === 'go_to_jail') {
    const jailPos = newBoard.findIndex(s => s.type === 'jail');
    newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, position: jailPos, inJail: true, jailTurns: 0 } : p);
    logs.push({ message: `${player.name} is sent to jail!`, timestamp: new Date().toISOString() });
  } else if (landedSpace.type === 'tax') {
    const flat = (newBoard[newPosition] as { taxAmount?: number }).taxAmount ?? (landedSpace as { taxAmount?: number }).taxAmount ?? 0;
    const currentPlayer = newPlayers.find(p => p.id === playerId)!;
    const netWorth = computeNetWorth(currentPlayer, newBoard);
    const percent = Math.floor(netWorth * 0.1);
    newPendingTaxChoice = { playerId, flat, percent };
    logs.push({ message: `${player.name} must choose: pay ${flat.toLocaleString()} Dawaar Coins flat OR ${percent.toLocaleString()} Dawaar Coins (10% net worth)`, timestamp: new Date().toISOString() });
  } else if (landedSpace.type === 'free_parking') {
    if (newFreeParkingPool > 0) {
      const pool = newFreeParkingPool;
      newPlayers = newPlayers.map(p => p.id === playerId ? { ...p, money: p.money + pool } : p);
      newFreeParkingPool = 0;
      logs.push({ message: `${player.name} landed on Picnic and collected ${pool.toLocaleString()} Dawaar Coins!`, timestamp: new Date().toISOString() });
    } else {
      logs.push({ message: `${player.name} landed on Picnic — pool is empty`, timestamp: new Date().toISOString() });
    }
  } else if (landedSpace.type === 'chance') {
    const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
    logs.push({ message: `CHANCE: ${card.text}`, timestamp: new Date().toISOString() });
    ({ newPlayers, newBoard } = applyCardAction(card.action, playerId, newPlayers, newBoard, state, total, logs));
    newPosition = newPlayers.find(p => p.id === playerId)!.position;
    const cardFine = CARD_FINE_AMOUNTS[card.action];
    if (cardFine) newFreeParkingPool += cardFine;
  } else if (landedSpace.type === 'community') {
    const card = COMMUNITY_CARDS[Math.floor(Math.random() * COMMUNITY_CARDS.length)];
    logs.push({ message: `COMMUNITY CHEST: ${card.text}`, timestamp: new Date().toISOString() });
    ({ newPlayers, newBoard } = applyCardAction(card.action, playerId, newPlayers, newBoard, state, total, logs));
    newPosition = newPlayers.find(p => p.id === playerId)!.position;
    const cardFine = CARD_FINE_AMOUNTS[card.action];
    if (cardFine) newFreeParkingPool += cardFine;
  } else if ((landedSpace.type === 'property' || landedSpace.type === 'railroad' || landedSpace.type === 'utility') && landedSpace.ownerId && landedSpace.ownerId !== playerId) {
    const rent = calculateRent({ ...state, board: newBoard, players: newPlayers }, newPosition, total);
    if (rent > 0) {
      newPlayers = newPlayers.map(p => {
        if (p.id === playerId) return { ...p, money: p.money - rent };
        if (p.id === landedSpace.ownerId) return { ...p, money: p.money + rent };
        return p;
      });
      logs.push({ message: `${player.name} paid ${rent} Dawaar Coins rent to ${newPlayers.find(p => p.id === landedSpace.ownerId)?.name}`, timestamp: new Date().toISOString() });
    }
  }

  // Bankruptcy — clear properties
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

  // Win check
  const activePlayers = newPlayers.filter(p => !p.isBankrupt);
  let newStatus: GameStatus = state.status;
  let winnerId: string | null = null;
  if (activePlayers.length === 1) {
    newStatus = 'finished';
    winnerId = activePlayers[0].id;
    logs.push({ message: `${activePlayers[0].name} wins the game!`, timestamp: new Date().toISOString() });
  }

  // Doubles rule
  const playerFinal = newPlayers.find(p => p.id === playerId)!;
  const nowInJail = playerFinal.inJail;
  const escapedJailViaDoubles = wasInJail && isDoubles && !nowInJail;
  let finalHasRolled = true;

  if (isDoubles && !nowInJail && !escapedJailViaDoubles && newStatus !== 'finished') {
    const newDoublesCount = (player.doublesCount ?? 0) + 1;
    if (newDoublesCount >= 3) {
      const jailPosD = newBoard.findIndex(s => s.type === 'jail');
      newPlayers = newPlayers.map(p => p.id === playerId
        ? { ...p, position: jailPosD, inJail: true, jailTurns: 0, doublesCount: 0 }
        : p);
      logs.push({ message: `${player.name} rolled doubles 3 times and is sent to jail!`, timestamp: new Date().toISOString() });
      finalHasRolled = true;
    } else {
      newPlayers = newPlayers.map(p => p.id === playerId
        ? { ...p, doublesCount: newDoublesCount }
        : p);
      finalHasRolled = false;
    }
  } else {
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
    freeParkingPool: newFreeParkingPool,
    pendingTaxChoice: newPendingTaxChoice,
  };

  return { state: newState, dice: [d1, d2], isDoubles };
}
