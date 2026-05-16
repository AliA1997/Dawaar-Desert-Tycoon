import type { GameState, TradeOffer } from '../turns/state.js';

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

export function declineTrade(state: GameState, playerId: string): { state: GameState; error?: string } {
  const trade = state.pendingTrade;
  if (!trade) return { state, error: 'No pending trade' };
  if (trade.toPlayerId !== playerId) return { state, error: 'Not your trade to decline' };

  const fromPlayer = state.players.find(p => p.id === trade.fromPlayerId);
  const toPlayer = state.players.find(p => p.id === trade.toPlayerId);

  return {
    state: {
      ...state,
      pendingTrade: null,
      version: state.version + 1,
      log: [...state.log, {
        message: `${toPlayer?.name ?? 'Player'} declined ${fromPlayer?.name ?? 'opponent'}'s trade offer`,
        timestamp: new Date().toISOString(),
        playerId,
      }].slice(-50),
    },
  };
}
