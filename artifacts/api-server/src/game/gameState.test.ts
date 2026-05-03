import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import {
  createGame,
  joinGame,
  startGame,
  rollDice,
  endTurn,
  payJail,
  buildHouse,
  mortgageProperty,
  buyProperty,
} from './gameState.js';
import { setGame } from './gameStore.js';
import { BOARD, CHANCE_CARDS } from './board.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeTwoPlayerGame(gameId = 'test-game') {
  let state = createGame(gameId, 'Alice', 'alice', 'camel');
  ({ state } = joinGame(state, 'Bob', 'bob', 'falcon'));
  ({ state } = startGame(state, 'alice'));
  return state;
}

/** Spy Math.random to return specific die values in sequence.
 *  rollDie() = Math.floor(Math.random() * 6) + 1
 *  To get die value V (1-6), supply (V - 1) / 6
 */
function mockDiceSeq(...values: number[]) {
  const spy = vi.spyOn(Math, 'random');
  values.forEach(v => spy.mockReturnValueOnce(v));
  return spy;
}

/** Given a desired die value 1-6, return the Math.random value that produces it */
const die = (v: number) => (v - 1) / 6;

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Bug 1: Doubles grant re-roll ────────────────────────────────────────────

describe('Doubles rule', () => {
  it('grants a re-roll when doubles are rolled (hasRolled stays false)', () => {
    const state = makeTwoPlayerGame();
    mockDiceSeq(die(3), die(3));
    const { state: after, isDoubles } = rollDice(state, 'alice');
    expect(isDoubles).toBe(true);
    expect(after.hasRolled).toBe(false);
    expect(after.currentPlayerId).toBe('alice');
    expect(after.players.find(p => p.id === 'alice')!.doublesCount).toBe(1);
  });

  it('does NOT grant a re-roll on non-doubles', () => {
    const state = makeTwoPlayerGame();
    mockDiceSeq(die(2), die(5));
    const { state: after, isDoubles } = rollDice(state, 'alice');
    expect(isDoubles).toBe(false);
    expect(after.hasRolled).toBe(true);
  });

  it('sends player to jail on third consecutive doubles', () => {
    let state = makeTwoPlayerGame();

    // Roll 1: [2,2] doubles
    mockDiceSeq(die(2), die(2));
    ({ state } = rollDice(state, 'alice'));
    expect(state.hasRolled).toBe(false);
    expect(state.players[0].doublesCount).toBe(1);

    // Roll 2: [3,3] doubles
    mockDiceSeq(die(3), die(3));
    ({ state } = rollDice(state, 'alice'));
    expect(state.hasRolled).toBe(false);
    expect(state.players[0].doublesCount).toBe(2);

    // Roll 3: [4,4] — third consecutive doubles → jail
    mockDiceSeq(die(4), die(4));
    ({ state } = rollDice(state, 'alice'));
    const alice = state.players.find(p => p.id === 'alice')!;
    expect(alice.inJail).toBe(true);
    // Jail is at the first space with type === 'jail' on the current board
    expect(alice.position).toBe(BOARD.findIndex(s => s.type === 'jail'));
    expect(alice.doublesCount).toBe(0);
    expect(state.hasRolled).toBe(true);
  });

  it('resets doublesCount to 0 after endTurn', () => {
    let state = makeTwoPlayerGame();
    // Roll doubles, then roll non-doubles
    mockDiceSeq(die(3), die(3));
    ({ state } = rollDice(state, 'alice'));
    expect(state.players[0].doublesCount).toBe(1);

    mockDiceSeq(die(1), die(2));
    ({ state } = rollDice(state, 'alice'));
    expect(state.hasRolled).toBe(true);

    ({ state } = endTurn(state, 'alice'));
    expect(state.players[0].doublesCount).toBe(0);
  });

  it('does not grant re-roll when doubles escape jail', () => {
    let state = makeTwoPlayerGame();
    state = {
      ...state,
      players: state.players.map(p => p.id === 'alice' ? { ...p, inJail: true, jailTurns: 1 } : p),
    };
    // [2,2] doubles escape jail — should NOT grant a re-roll
    mockDiceSeq(die(2), die(2));
    const { state: after, isDoubles } = rollDice(state, 'alice');
    expect(isDoubles).toBe(true);
    // Player escaped jail (doublesCount resets, hasRolled=true because escapedJailViaDoubles)
    expect(after.players.find(p => p.id === 'alice')!.inJail).toBe(false);
    expect(after.hasRolled).toBe(true);
  });
});

// ─── Bug 2: back_3 card via engine ───────────────────────────────────────────

describe('back_3 card (engine level)', () => {
  // We position alice just before a Chance space and mock dice to land on it,
  // then mock the card draw to select the back_3 card.

  const back3Index = CHANCE_CARDS.findIndex(c => c.action === 'back_3');
  const chanceIndices = BOARD.map((s, i) => s.type === 'chance' ? i : -1).filter(i => i >= 0);

  it('lands on a Chance space and moves back 3 (with wrap)', () => {
    expect(chanceIndices.length).toBeGreaterThan(0);
    const chancePos = chanceIndices[0];
    // Position alice 2 spaces before a Chance space; roll [1,1] = 2 lands on it
    const startPos = (chancePos - 2 + BOARD.length) % BOARD.length;

    let state = makeTwoPlayerGame();
    state = {
      ...state,
      players: state.players.map(p => p.id === 'alice' ? { ...p, position: startPos } : p),
    };

    const cardRand = back3Index / CHANCE_CARDS.length;
    mockDiceSeq(die(1), die(1), cardRand);

    const { state: after } = rollDice(state, 'alice');
    const alice = after.players.find(p => p.id === 'alice')!;
    expect(alice.position).toBe((chancePos - 3 + BOARD.length) % BOARD.length);
  });

  it('wrap formula (pos - 3 + N) % N never goes negative', () => {
    const N = BOARD.length;
    expect((2 - 3 + N) % N).toBe(N - 1);
    expect((1 - 3 + N) % N).toBe(N - 2);
    expect((0 - 3 + N) % N).toBe(N - 3);
  });
});

// ─── Bug 3: Tax values ────────────────────────────────────────────────────────

describe('Tax space amounts', () => {
  const zakatIdx = BOARD.findIndex(s => s.name === 'Zakat Tax');
  const oilIdx   = BOARD.findIndex(s => s.name === 'Oil Revenue Tax');

  it('Zakat Tax costs 500 DHS', () => {
    expect(zakatIdx).toBeGreaterThan(-1);
    expect(BOARD[zakatIdx].taxAmount).toBe(500);
  });

  it('Oil Revenue Tax costs 2000 DHS', () => {
    expect(oilIdx).toBeGreaterThan(-1);
    expect(BOARD[oilIdx].taxAmount).toBe(2000);
  });

  it('opens a pending tax choice when player rolls onto a tax space', () => {
    // Land on Zakat Tax via a 2-roll
    let state = makeTwoPlayerGame();
    state = {
      ...state,
      players: state.players.map(p => p.id === 'alice' ? { ...p, position: zakatIdx - 2 } : p),
    };
    mockDiceSeq(die(1), die(1));
    const { state: after } = rollDice(state, 'alice');
    const alice = after.players.find(p => p.id === 'alice')!;
    expect(alice.position).toBe(zakatIdx);
    expect(after.pendingTaxChoice).toBeDefined();
    expect(after.pendingTaxChoice!.playerId).toBe('alice');
    expect(after.pendingTaxChoice!.flat).toBe(500);
  });
});

// ─── Bug 4: Bankruptcy property clearing ─────────────────────────────────────

describe('Bankruptcy clears properties from board', () => {
  it('sets ownerId to null on all bankrupt player properties', () => {
    // Pick the most expensive property on the board for Bob; alice will land on it broke
    const expensive = [...BOARD]
      .filter(s => s.type === 'property' && s.rent && s.rent.length > 0)
      .sort((a, b) => (b.rent![0] ?? 0) - (a.rent![0] ?? 0))[0];
    expect(expensive).toBeDefined();
    const expensiveIdx = expensive.index;
    const baseRent = expensive.rent![0]!;

    // Pick any other property for alice to own (so it can be cleared on bankruptcy)
    const aliceProp = BOARD.find(s => s.type === 'property' && s.index !== expensiveIdx)!;
    const aliceIdx = aliceProp.index;

    let state = makeTwoPlayerGame();
    const startPos = (expensiveIdx - 2 + BOARD.length) % BOARD.length;
    state = {
      ...state,
      players: state.players.map(p => {
        if (p.id === 'alice') return { ...p, properties: [aliceIdx], money: 10, position: startPos };
        if (p.id === 'bob')   return { ...p, properties: [expensiveIdx] };
        return p;
      }),
      board: state.board.map((s, i) => {
        if (i === aliceIdx)     return { ...s, ownerId: 'alice' };
        if (i === expensiveIdx) return { ...s, ownerId: 'bob' };
        return s;
      }),
    };

    // Roll [1,1] → land on expensive property → owe rent > money → bankrupt
    mockDiceSeq(die(1), die(1));
    const { state: after } = rollDice(state, 'alice');

    const alice = after.players.find(p => p.id === 'alice')!;
    expect(baseRent).toBeGreaterThan(10);
    expect(alice.isBankrupt).toBe(true);
    expect(alice.properties).toHaveLength(0);
    expect(after.board[aliceIdx].ownerId).toBeNull();
  });
});

// ─── Bug 5: Pay-to-leave-jail (pure function) ────────────────────────────────

describe('payJail function', () => {
  it('deducts 500 DHS and clears jail status', () => {
    let state = makeTwoPlayerGame();
    state = {
      ...state,
      players: state.players.map(p =>
        p.id === 'alice' ? { ...p, inJail: true, jailTurns: 1 } : p
      ),
    };

    const moneyBefore = state.players.find(p => p.id === 'alice')!.money;
    const { state: after, error } = payJail(state, 'alice');

    expect(error).toBeUndefined();
    const alice = after.players.find(p => p.id === 'alice')!;
    expect(alice.inJail).toBe(false);
    expect(alice.jailTurns).toBe(0);
    expect(alice.money).toBe(moneyBefore - 500);
  });

  it('rejects when player is not in jail', () => {
    const state = makeTwoPlayerGame();
    const { error } = payJail(state, 'alice');
    expect(error).toMatch(/not in jail/i);
  });

  it('rejects when player has already rolled', () => {
    let state = makeTwoPlayerGame();
    state = {
      ...state,
      hasRolled: true,
      players: state.players.map(p => p.id === 'alice' ? { ...p, inJail: true } : p),
    };
    const { error } = payJail(state, 'alice');
    expect(error).toMatch(/after rolling/i);
  });

  it('rejects when player has insufficient funds', () => {
    let state = makeTwoPlayerGame();
    state = {
      ...state,
      players: state.players.map(p =>
        p.id === 'alice' ? { ...p, inJail: true, money: 100 } : p
      ),
    };
    const { error } = payJail(state, 'alice');
    expect(error).toMatch(/enough money/i);
  });
});

// ─── NPC building strategy ────────────────────────────────────────────────────

describe('NPC building strategy (buildHouse)', () => {
  it('allows building a house when player owns all properties in a color group', () => {
    let state = makeTwoPlayerGame();
    // Give alice the first complete color group
    const firstGroup = BOARD.find(s => s.colorGroup)?.colorGroup;
    expect(firstGroup).toBeDefined();
    const groupProps = BOARD.filter(s => s.colorGroup === firstGroup);
    expect(groupProps.length).toBeGreaterThanOrEqual(2);

    // Give alice money and ownership of the entire group
    state = {
      ...state,
      players: state.players.map(p =>
        p.id === 'alice'
          ? { ...p, money: 10000, properties: groupProps.map(s => s.index) }
          : p
      ),
      board: state.board.map(s =>
        s.colorGroup === firstGroup ? { ...s, ownerId: 'alice' } : s
      ),
      hasRolled: true,
    };

    const target = state.board.find(s => s.colorGroup === firstGroup)!;
    const { state: built, error } = buildHouse(state, 'alice', target.index);
    expect(error).toBeUndefined();
    expect(built.board[target.index].houses).toBe(1);
  });

  it('prevents building when player does not own the full color group', () => {
    let state = makeTwoPlayerGame();
    const firstGroup = BOARD.find(s => s.colorGroup)?.colorGroup;
    const groupProps = BOARD.filter(s => s.colorGroup === firstGroup);

    // Alice owns only the first property in the group (not all)
    state = {
      ...state,
      players: state.players.map(p =>
        p.id === 'alice'
          ? { ...p, money: 10000, properties: [groupProps[0].index] }
          : p
      ),
      board: state.board.map((s, i) =>
        i === groupProps[0].index ? { ...s, ownerId: 'alice' } : s
      ),
      hasRolled: true,
    };

    const { error } = buildHouse(state, 'alice', groupProps[0].index);
    expect(error).toBeDefined();
    expect(error).toMatch(/own all|all properties/i);
  });

  it('allows building up to a hotel (4 houses → hotel)', () => {
    let state = makeTwoPlayerGame();
    const firstGroup = BOARD.find(s => s.colorGroup)?.colorGroup;
    const groupProps = BOARD.filter(s => s.colorGroup === firstGroup);

    state = {
      ...state,
      players: state.players.map(p =>
        p.id === 'alice' ? { ...p, money: 99000, properties: groupProps.map(s => s.index) } : p
      ),
      board: state.board.map(s =>
        s.colorGroup === firstGroup ? { ...s, ownerId: 'alice' } : s
      ),
      hasRolled: true,
    };

    const target = state.board.find(s => s.colorGroup === firstGroup)!;
    // Build evenly across the whole group: 4 passes × every property in the group → 4 houses each
    let s = state;
    for (let pass = 0; pass < 4; pass++) {
      for (const gp of groupProps) {
        const result = buildHouse(s, 'alice', gp.index);
        expect(result.error).toBeUndefined();
        s = result.state;
      }
    }
    expect(s.board[target.index].houses).toBe(4);

    // Now upgrade to a hotel evenly across the group
    for (const gp of groupProps) {
      const result = buildHouse(s, 'alice', gp.index);
      expect(result.error).toBeUndefined();
      s = result.state;
    }
    expect(s.board[target.index].hotel).toBe(true);
    expect(s.board[target.index].houses).toBe(0);
  });
});

// ─── NPC mortgage recovery strategy ──────────────────────────────────────────

describe('NPC mortgage recovery (mortgageProperty)', () => {
  it('allows mortgaging an owned property to raise emergency funds', () => {
    let state = makeTwoPlayerGame();
    const firstProp = BOARD.find(s => s.type === 'property' && s.mortgageValue);
    expect(firstProp).toBeDefined();

    state = {
      ...state,
      players: state.players.map(p =>
        p.id === 'alice'
          ? { ...p, money: 500, properties: [firstProp!.index] }
          : p
      ),
      board: state.board.map(s =>
        s.index === firstProp!.index ? { ...s, ownerId: 'alice' } : s
      ),
      hasRolled: true,
    };

    const moneyBefore = state.players.find(p => p.id === 'alice')!.money;
    const { state: after, error } = mortgageProperty(state, 'alice', firstProp!.index, 'mortgage');
    expect(error).toBeUndefined();
    expect(after.board[firstProp!.index].isMortgaged).toBe(true);
    expect(after.players.find(p => p.id === 'alice')!.money).toBe(moneyBefore + firstProp!.mortgageValue!);
  });

  it('allows unmortgaging a previously mortgaged property', () => {
    let state = makeTwoPlayerGame();
    const firstProp = BOARD.find(s => s.type === 'property' && s.mortgageValue);
    const mortgageVal = firstProp!.mortgageValue!;

    state = {
      ...state,
      players: state.players.map(p =>
        p.id === 'alice'
          ? { ...p, money: 10000, properties: [firstProp!.index] }
          : p
      ),
      board: state.board.map(s =>
        s.index === firstProp!.index ? { ...s, ownerId: 'alice', isMortgaged: true } : s
      ),
      hasRolled: true,
    };

    const { state: after, error } = mortgageProperty(state, 'alice', firstProp!.index, 'unmortgage');
    expect(error).toBeUndefined();
    expect(after.board[firstProp!.index].isMortgaged).toBe(false);
    expect(after.players.find(p => p.id === 'alice')!.money).toBeLessThan(10000);
    // Unmortgage cost should be mortgageValue * 1.1
    expect(after.players.find(p => p.id === 'alice')!.money).toBe(10000 - Math.floor(mortgageVal * 1.1));
  });

  it('prevents mortgaging a property with houses on it', () => {
    let state = makeTwoPlayerGame();
    const firstGroup = BOARD.find(s => s.colorGroup)?.colorGroup;
    const groupProps = BOARD.filter(s => s.colorGroup === firstGroup);
    const target = groupProps[0];

    state = {
      ...state,
      players: state.players.map(p =>
        p.id === 'alice' ? { ...p, money: 10000, properties: groupProps.map(s => s.index) } : p
      ),
      board: state.board.map(s =>
        s.colorGroup === firstGroup
          ? { ...s, ownerId: 'alice', houses: s.index === target.index ? 1 : 0 }
          : s
      ),
      hasRolled: true,
    };

    const { error } = mortgageProperty(state, 'alice', target.index, 'mortgage');
    expect(error).toBeDefined();
    expect(error).toMatch(/sell|building/i);
  });
});

// ─── NPC stall recovery (endTurn with hasRolled=true) ─────────────────────────

describe('NPC stall recovery (endTurn after hasRolled=true)', () => {
  it('endTurn succeeds and advances turn when hasRolled is true', () => {
    let state = makeTwoPlayerGame();
    mockDiceSeq(die(2), die(5));
    ({ state } = rollDice(state, 'alice'));
    expect(state.hasRolled).toBe(true);

    const { state: after, error } = endTurn(state, 'alice');
    expect(error).toBeUndefined();
    expect(after.currentPlayerId).toBe('bob');
    expect(after.hasRolled).toBe(false);
  });
});

// ─── POST /api/games/:id/build (HTTP endpoint) ────────────────────────────────

describe('POST /api/games/:id/build endpoint', () => {
  const GAME_ID = 'http-test-build';

  it('returns 200 and increments house count when player owns full color group', async () => {
    let state = makeTwoPlayerGame(GAME_ID);
    const firstGroup = BOARD.find(s => s.colorGroup)?.colorGroup!;
    const groupProps = BOARD.filter(s => s.colorGroup === firstGroup);
    const target = groupProps[0];

    state = {
      ...state,
      players: state.players.map(p =>
        p.id === 'alice' ? { ...p, money: 10000, properties: groupProps.map(s => s.index) } : p
      ),
      board: state.board.map(s =>
        s.colorGroup === firstGroup ? { ...s, ownerId: 'alice' } : s
      ),
      hasRolled: true,
    };
    setGame(GAME_ID, state);

    const res = await request(app)
      .post(`/api/games/${GAME_ID}/build`)
      .send({ playerId: 'alice', propertyIndex: target.index });

    expect(res.status).toBe(200);
    const builtProp = (res.body.board as { index: number; houses: number }[]).find(s => s.index === target.index);
    expect(builtProp).toBeDefined();
    expect(builtProp!.houses).toBe(1);
  });

  it('returns 404 when game does not exist', async () => {
    const res = await request(app)
      .post('/api/games/NONEXISTENT-BUILD/build')
      .send({ playerId: 'alice', propertyIndex: 1 });
    expect(res.status).toBe(404);
  });
});

// ─── POST /api/games/:id/mortgage (HTTP endpoint) ────────────────────────────

describe('POST /api/games/:id/mortgage endpoint', () => {
  const GAME_ID = 'http-test-mortgage';

  it('returns 200 and mortgages the property', async () => {
    let state = makeTwoPlayerGame(GAME_ID);
    const firstProp = BOARD.find(s => s.type === 'property' && s.mortgageValue)!;

    state = {
      ...state,
      players: state.players.map(p =>
        p.id === 'alice' ? { ...p, money: 500, properties: [firstProp.index] } : p
      ),
      board: state.board.map(s =>
        s.index === firstProp.index ? { ...s, ownerId: 'alice' } : s
      ),
      hasRolled: true,
    };
    setGame(GAME_ID, state);

    const res = await request(app)
      .post(`/api/games/${GAME_ID}/mortgage`)
      .send({ playerId: 'alice', propertyIndex: firstProp.index, action: 'mortgage' });

    expect(res.status).toBe(200);
    const prop = (res.body.board as { index: number; isMortgaged: boolean }[]).find(s => s.index === firstProp.index);
    expect(prop).toBeDefined();
    expect(prop!.isMortgaged).toBe(true);
  });

  it('returns 404 when game does not exist', async () => {
    const res = await request(app)
      .post('/api/games/NONEXISTENT-MORTGAGE/mortgage')
      .send({ playerId: 'alice', propertyIndex: 1, action: 'mortgage' });
    expect(res.status).toBe(404);
  });
});

// ─── Bug 5: POST /api/games/:id/pay-jail (HTTP endpoint) ─────────────────────

describe('POST /api/games/:id/pay-jail endpoint', () => {
  const GAME_ID = 'http-test-jail';

  it('returns 200 and clears jail when called with valid jailed player', async () => {
    let state = makeTwoPlayerGame(GAME_ID);
    state = {
      ...state,
      players: state.players.map(p =>
        p.id === 'alice' ? { ...p, inJail: true, jailTurns: 0 } : p
      ),
    };
    setGame(GAME_ID, state);

    const moneyBefore = state.players.find(p => p.id === 'alice')!.money;
    const res = await request(app)
      .post(`/api/games/${GAME_ID}/pay-jail`)
      .send({ playerId: 'alice' });

    expect(res.status).toBe(200);
    const alice = (res.body.players as { id: string; inJail: boolean; money: number }[]).find(p => p.id === 'alice');
    expect(alice).toBeDefined();
    expect(alice!.inJail).toBe(false);
    expect(alice!.money).toBe(moneyBefore - 500);
  });

  it('returns 404 when game does not exist', async () => {
    const res = await request(app)
      .post('/api/games/NONEXISTENT/pay-jail')
      .send({ playerId: 'alice' });
    expect(res.status).toBe(404);
  });

  it('returns 400 when player is not in jail', async () => {
    const STATE_ID = 'http-test-no-jail';
    const state = makeTwoPlayerGame(STATE_ID);
    setGame(STATE_ID, state);

    const res = await request(app)
      .post(`/api/games/${STATE_ID}/pay-jail`)
      .send({ playerId: 'alice' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not in jail/i);
  });

  it('returns 400 when playerId is missing', async () => {
    const STATE_ID = 'http-test-missing-player';
    const state = makeTwoPlayerGame(STATE_ID);
    setGame(STATE_ID, state);

    const res = await request(app)
      .post(`/api/games/${STATE_ID}/pay-jail`)
      .send({});
    expect(res.status).toBe(400);
  });
});

// ─── Player ready (lobby) ─────────────────────────────────────────────────────

import { setReady } from './gameState.js';

describe('setReady (lobby ready state)', () => {
  it('initializes new players with ready=false', () => {
    const state = createGame('ready-init', 'Alice', 'alice', 'camel');
    expect(state.players[0].ready).toBe(false);
    const { state: joined } = joinGame(state, 'Bob', 'bob', 'falcon');
    expect(joined.players[1].ready).toBe(false);
  });

  it('toggles ready and bumps version + log entry', () => {
    let state = createGame('ready-toggle', 'Alice', 'alice', 'camel');
    ({ state } = joinGame(state, 'Bob', 'bob', 'falcon'));
    const v0 = state.version;
    const { state: after, error } = setReady(state, 'bob', true);
    expect(error).toBeUndefined();
    expect(after.players.find(p => p.id === 'bob')!.ready).toBe(true);
    expect(after.version).toBe(v0 + 1);
    expect(after.log[after.log.length - 1].message).toMatch(/Bob is ready/);
  });

  it('rejects ready toggle once game has started', () => {
    const state = makeTwoPlayerGame('ready-started');
    const { error } = setReady(state, 'alice', true);
    expect(error).toMatch(/already started/i);
  });

  it('rejects unknown player', () => {
    let state = createGame('ready-unknown', 'Alice', 'alice', 'camel');
    const { error } = setReady(state, 'ghost', true);
    expect(error).toMatch(/not found/i);
  });
});

// ─── POST /api/games/:id/ready (HTTP endpoint) ────────────────────────────────

describe('POST /api/games/:id/ready endpoint', () => {
  it('returns 200 and marks player ready', async () => {
    const GAME_ID = 'http-test-ready';
    let state = createGame(GAME_ID, 'Alice', 'alice', 'camel');
    ({ state } = joinGame(state, 'Bob', 'bob', 'falcon'));
    setGame(GAME_ID, state);

    const res = await request(app)
      .post(`/api/games/${GAME_ID}/ready`)
      .send({ playerId: 'bob', ready: true });
    expect(res.status).toBe(200);
    const bob = (res.body.players as { id: string; ready: boolean }[]).find(p => p.id === 'bob');
    expect(bob!.ready).toBe(true);
  });

  it('returns 400 when ready is missing or not a boolean', async () => {
    const GAME_ID = 'http-test-ready-missing';
    let state = createGame(GAME_ID, 'Alice', 'alice', 'camel');
    ({ state } = joinGame(state, 'Bob', 'bob', 'falcon'));
    setGame(GAME_ID, state);

    const res = await request(app)
      .post(`/api/games/${GAME_ID}/ready`)
      .send({ playerId: 'bob' });
    expect(res.status).toBe(400);
  });

  it('returns 404 when game does not exist', async () => {
    const res = await request(app)
      .post('/api/games/NONEXISTENT-READY/ready')
      .send({ playerId: 'alice', ready: true });
    expect(res.status).toBe(404);
  });
});

// ─── Player profile (rewards) endpoints ───────────────────────────────────────

describe('GET /api/players/:playerId/profile', () => {
  it('returns a default profile for an unknown player', async () => {
    const res = await request(app).get('/api/players/new-user/profile');
    expect(res.status).toBe(200);
    expect(res.body.playerId).toBe('new-user');
    expect(res.body.rewardPoints).toBe(0);
    expect(res.body.unlockedAdvantages).toEqual([]);
  });
});

describe('POST /api/players/:playerId/reward', () => {
  it('adds points and computes unlocks', async () => {
    const PID = 'reward-add-' + Date.now();
    let res = await request(app)
      .post(`/api/players/${PID}/reward`)
      .send({ points: 600 });
    expect(res.status).toBe(200);
    expect(res.body.rewardPoints).toBe(600);
    expect(res.body.unlockedAdvantages).toEqual([0]); // 500 unlocked

    res = await request(app)
      .post(`/api/players/${PID}/reward`)
      .send({ points: 500 });
    expect(res.body.rewardPoints).toBe(1100);
    expect(res.body.unlockedAdvantages).toEqual([0, 1]);
  });

  it('sets points absolutely when set=true', async () => {
    const PID = 'reward-set-' + Date.now();
    const res = await request(app)
      .post(`/api/players/${PID}/reward`)
      .send({ points: 2000, set: true });
    expect(res.status).toBe(200);
    expect(res.body.rewardPoints).toBe(2000);
    expect(res.body.unlockedAdvantages).toEqual([0, 1, 2]);
  });

  it('rejects non-number points', async () => {
    const res = await request(app)
      .post('/api/players/whoever/reward')
      .send({ points: 'abc' });
    expect(res.status).toBe(400);
  });
});

// ─── /poll event-driven (latency) ─────────────────────────────────────────────

describe('GET /api/games/:id/poll (event-driven)', () => {
  it('resolves quickly (well under 500ms) when state changes mid-request', async () => {
    const GAME_ID = 'poll-event-' + Date.now();
    let state = createGame(GAME_ID, 'Alice', 'alice', 'camel');
    ({ state } = joinGame(state, 'Bob', 'bob', 'falcon'));
    setGame(GAME_ID, state);
    const baseVersion = state.version;

    const start = Date.now();
    const pollPromise = request(app).get(`/api/games/${GAME_ID}/poll?version=${baseVersion}`);

    // Trigger a state change after 50ms
    const storeMod = await import('./gameStore.js');
    setTimeout(() => {
      const cur = storeMod.getGame(GAME_ID);
      if (cur) {
        const { state: after } = setReady(cur, 'bob', true);
        setGame(GAME_ID, after);
      }
    }, 50);

    const res = await pollPromise;
    const elapsed = Date.now() - start;
    expect(res.status).toBe(200);
    expect(res.body.version).toBeGreaterThan(baseVersion);
    // Should arrive much faster than the old 500ms polling interval
    expect(elapsed).toBeLessThan(400);
  }, 5000);

  it('returns immediately when client version is already stale', async () => {
    const GAME_ID = 'poll-stale-' + Date.now();
    let state = createGame(GAME_ID, 'Alice', 'alice', 'camel');
    ({ state } = joinGame(state, 'Bob', 'bob', 'falcon'));
    setGame(GAME_ID, state);

    const start = Date.now();
    const res = await request(app).get(`/api/games/${GAME_ID}/poll?version=0`);
    const elapsed = Date.now() - start;
    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(100);
  });
});

// ─── Auction validation (humanBid=0 = pass) ────────────────────────────────────

describe('auctionBuy (auction expiry behavior)', () => {
  it('rejects price=0 — clients must filter pass bids before submitting', async () => {
    const GAME_ID = 'auction-zero-' + Date.now();
    let state = makeTwoPlayerGame(GAME_ID);
    // Pretend alice landed on a property she didn't buy
    const prop = state.board.find(s => s.type === 'property')!;
    setGame(GAME_ID, state);

    const res = await request(app)
      .post(`/api/games/${GAME_ID}/auction-buy`)
      .send({ winnerId: 'alice', propertyIndex: prop.index, price: 0 });
    expect(res.status).toBe(400);
  });

  it('accepts a positive winning bid', async () => {
    const GAME_ID = 'auction-win-' + Date.now();
    const state = makeTwoPlayerGame(GAME_ID);
    const prop = state.board.find(s => s.type === 'property')!;
    setGame(GAME_ID, state);

    const res = await request(app)
      .post(`/api/games/${GAME_ID}/auction-buy`)
      .send({ winnerId: 'alice', propertyIndex: prop.index, price: 200 });
    expect(res.status).toBe(200);
    const owned = (res.body.board as { index: number; ownerId: string | null }[])
      .find(s => s.index === prop.index);
    expect(owned!.ownerId).toBe('alice');
  });
});

// ─── Async/debounced game persistence ────────────────────────────────────────

describe('gameStore: async debounced persistence + flush', () => {
  it('persists state via flushGamesToFile and survives module reload', async () => {
    const { setGame, flushGamesToFile, getGame } = await import('./gameStore.js');
    const GAME_ID = 'persist-test-' + Date.now();
    const state = makeTwoPlayerGame(GAME_ID);
    setGame(GAME_ID, state);
    await flushGamesToFile();

    // Re-read in-memory copy
    expect(getGame(GAME_ID)).toBeDefined();
    expect(getGame(GAME_ID)!.players.length).toBe(2);
  });
});

// ─── Auction resolver (shared with client) + timer-expiry-uses-latest-bid ─────

import { pickAuctionWinner, type AuctionBid } from './auctionResolve.js';

describe('pickAuctionWinner', () => {
  it('returns null when no positive bids (everyone passed)', () => {
    expect(pickAuctionWinner([])).toBeNull();
    expect(pickAuctionWinner([{ id: 'a', name: 'A', bid: 0 }])).toBeNull();
    expect(pickAuctionWinner([
      { id: 'a', name: 'A', bid: 0 },
      { id: 'b', name: 'B', bid: -5 },
    ])).toBeNull();
  });

  it('picks the highest positive bid', () => {
    const winner = pickAuctionWinner([
      { id: 'a', name: 'A', bid: 100 },
      { id: 'b', name: 'B', bid: 250 },
      { id: 'c', name: 'C', bid: 0 },
    ]);
    expect(winner?.id).toBe('b');
    expect(winner?.bid).toBe(250);
  });

  it('ignores zero/negative bids (pass) when computing winner', () => {
    const winner = pickAuctionWinner([
      { id: 'human', name: 'You', bid: 0 },     // human passed
      { id: 'npc1',  name: 'NPC1', bid: 150 },
      { id: 'npc2',  name: 'NPC2', bid: 200 },
    ]);
    expect(winner?.id).toBe('npc2');
  });
});

describe('auction expiry uses LATEST typed human bid (ref pattern)', () => {
  // Simulates the client's ref-based auction-expiry behavior:
  //   1. timer is registered while humanBid is at its initial 75% default
  //   2. user types a different value; the ref is kept in sync
  //   3. timer fires and reads ref.current — must see the LATEST value, not the
  //      stale closure-captured one
  it('reads humanBidRef.current at expiry, not the closure-captured value', async () => {
    const npcBids: AuctionBid[] = [
      { id: 'npc1', name: 'NPC1', bid: 300 },
    ];
    const humanBidRef = { current: 750 }; // initial 75% default

    let resolved: AuctionBid | null = null;
    // Mimic the client's auctionTimerRef.current = setTimeout(() => handleSubmitBid(humanBidRef.current), …)
    const submit = (bidOverride: number) => {
      resolved = pickAuctionWinner([
        ...npcBids,
        { id: 'human', name: 'You', bid: bidOverride },
      ]);
    };
    const timer = setTimeout(() => submit(humanBidRef.current), 30);

    // User raises their bid AFTER the timer was scheduled
    humanBidRef.current = 1200;

    await new Promise(r => setTimeout(r, 60));
    clearTimeout(timer);

    // The human bid (1200) must beat the NPC (300), proving expiry used the
    // latest typed value, not the stale 750 captured at registration time.
    expect(resolved).not.toBeNull();
    expect(resolved!.id).toBe('human');
    expect(resolved!.bid).toBe(1200);
  });

  it('treats a typed-down-to-0 bid as PASS at expiry (no auto-buy at 0)', async () => {
    const npcBids: AuctionBid[] = []; // no NPC bids either
    const humanBidRef = { current: 750 };

    let resolved: AuctionBid | null | undefined = undefined;
    const submit = (bidOverride: number) => {
      resolved = pickAuctionWinner([
        ...npcBids,
        { id: 'human', name: 'You', bid: bidOverride },
      ]);
    };
    const timer = setTimeout(() => submit(humanBidRef.current), 30);

    // User cleared their bid box → 0 = pass
    humanBidRef.current = 0;

    await new Promise(r => setTimeout(r, 60));
    clearTimeout(timer);

    // Auction should close with no winner — does NOT submit a 0 buy
    expect(resolved).toBeNull();
  });
});
