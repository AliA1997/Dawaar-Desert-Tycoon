import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
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
  chooseTax,
  setPlayerReady,
} from './gameState.js';
import { setGame, gameEvents } from './gameStore.js';
import { _resetForTest as _resetPlayers } from './playerStore.js';
import { BOARD, CHANCE_CARDS } from './board.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────
//
// NOTE: The Dawaar board has 28 cells (0-27). Key landmarks:
//   - Index 7  = Jail
//   - Index 9  = Zakat Tax (500 DHS)
//   - Index 16 = Chance (the only Chance space)
//   - Index 23 = Oil Revenue Tax (2000 DHS)
//   - Index 27 = Mecca (most expensive property)

function makeTwoPlayerGame(gameId = 'test-game') {
  let state = createGame(gameId, 'Alice', 'alice', 'camel');
  ({ state } = joinGame(state, 'Bob', 'bob', 'falcon'));
  ({ state } = startGame(state, 'alice'));
  return state;
}

/** Spy Math.random to return specific die values in sequence. */
function mockDiceSeq(...values: number[]) {
  const spy = vi.spyOn(Math, 'random');
  values.forEach(v => spy.mockReturnValueOnce(v));
  return spy;
}

/** Given a desired die value 1-6, return the Math.random value that produces it */
const die = (v: number) => (v - 1) / 6;

const JAIL_INDEX = BOARD.findIndex(s => s.type === 'jail');
const CHANCE_INDEX = BOARD.findIndex(s => s.type === 'chance');

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Doubles rule ─────────────────────────────────────────────────────────────

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

    mockDiceSeq(die(2), die(2));
    ({ state } = rollDice(state, 'alice'));
    expect(state.players[0].doublesCount).toBe(1);

    mockDiceSeq(die(3), die(3));
    ({ state } = rollDice(state, 'alice'));
    expect(state.players[0].doublesCount).toBe(2);

    mockDiceSeq(die(4), die(4));
    ({ state } = rollDice(state, 'alice'));
    const alice = state.players.find(p => p.id === 'alice')!;
    expect(alice.inJail).toBe(true);
    expect(alice.position).toBe(JAIL_INDEX);
    expect(alice.doublesCount).toBe(0);
    expect(state.hasRolled).toBe(true);
  });

  it('resets doublesCount to 0 after endTurn', () => {
    let state = makeTwoPlayerGame();
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
    mockDiceSeq(die(2), die(2));
    const { state: after, isDoubles } = rollDice(state, 'alice');
    expect(isDoubles).toBe(true);
    expect(after.players.find(p => p.id === 'alice')!.inJail).toBe(false);
    expect(after.hasRolled).toBe(true);
  });
});

// ─── back_3 card via engine ───────────────────────────────────────────────────

describe('back_3 card (engine level)', () => {
  const back3Index = CHANCE_CARDS.findIndex(c => c.action === 'back_3');

  it('lands on Chance and moves back 3 spaces', () => {
    let state = makeTwoPlayerGame();
    // Position alice at 14, roll [1,1] = 2 → lands on 16 (Chance)
    state = {
      ...state,
      players: state.players.map(p => p.id === 'alice' ? { ...p, position: 14 } : p),
    };

    const cardRand = back3Index / CHANCE_CARDS.length;
    mockDiceSeq(die(1), die(1), cardRand);

    const { state: after } = rollDice(state, 'alice');
    const alice = after.players.find(p => p.id === 'alice')!;
    expect(alice.position).toBe(CHANCE_INDEX - 3);
  });

  it('wrap formula handles boundaries on a 28-cell board', () => {
    const N = BOARD.length;
    expect((2 - 3 + N) % N).toBe(N - 1);
    expect((1 - 3 + N) % N).toBe(N - 2);
    expect((0 - 3 + N) % N).toBe(N - 3);
    expect((CHANCE_INDEX - 3 + N) % N).toBe(CHANCE_INDEX - 3);
  });
});

// ─── Tax space amounts ───────────────────────────────────────────────────────

describe('Tax space amounts', () => {
  it('Zakat Tax (space 9) costs 500 DHS', () => {
    expect(BOARD[9].name).toBe('Zakat Tax');
    expect(BOARD[9].taxAmount).toBe(500);
  });

  it('Oil Revenue Tax (space 23) costs 2000 DHS', () => {
    expect(BOARD[23].name).toBe('Oil Revenue Tax');
    expect(BOARD[23].taxAmount).toBe(2000);
  });

  it('creates a pendingTaxChoice when player rolls onto Zakat Tax space', () => {
    let state = makeTwoPlayerGame();
    // Position alice at 8, roll [1,0]? Need total = 1. Use [1,?] no, use position 7 + roll [1,1]=2 lands 9.
    state = {
      ...state,
      players: state.players.map(p => p.id === 'alice' ? { ...p, position: 7 } : p),
    };
    const moneyBefore = state.players.find(p => p.id === 'alice')!.money;
    mockDiceSeq(die(1), die(1));
    const { state: after } = rollDice(state, 'alice');
    const alice = after.players.find(p => p.id === 'alice')!;
    expect(alice.position).toBe(9);
    // Engine creates a pending choice — money is unchanged until chooseTax is called
    expect(after.pendingTaxChoice).not.toBeNull();
    expect(after.pendingTaxChoice!.flat).toBe(500);
    expect(alice.money).toBe(moneyBefore);

    // Resolve via flat choice
    const { state: paid } = chooseTax(after, 'alice', 'flat');
    const alicePaid = paid.players.find(p => p.id === 'alice')!;
    expect(alicePaid.money).toBe(moneyBefore - 500);
    expect(paid.pendingTaxChoice).toBeNull();
  });

  it('creates a pendingTaxChoice with 2000 DHS flat for Oil Revenue Tax', () => {
    let state = makeTwoPlayerGame();
    // Position alice at 22, roll [1,0]? Use [1,?] need total 1.
    // Use [1,?] - we need 23 - 22 = 1 → can't roll a single die total of 1 with two dice (min 2).
    // Use position 20, roll [1,2]=3 → 23. But [1,2] are not doubles → no re-roll. Good.
    state = {
      ...state,
      players: state.players.map(p => p.id === 'alice' ? { ...p, position: 20 } : p),
    };
    const moneyBefore = state.players.find(p => p.id === 'alice')!.money;
    mockDiceSeq(die(1), die(2));
    const { state: after } = rollDice(state, 'alice');
    const alice = after.players.find(p => p.id === 'alice')!;
    expect(alice.position).toBe(23);
    expect(after.pendingTaxChoice).not.toBeNull();
    expect(after.pendingTaxChoice!.flat).toBe(2000);

    const { state: paid } = chooseTax(after, 'alice', 'flat');
    expect(paid.players.find(p => p.id === 'alice')!.money).toBe(moneyBefore - 2000);
  });
});

// ─── Bankruptcy property clearing ────────────────────────────────────────────

describe('Bankruptcy clears properties from board', () => {
  it('sets ownerId to null on all bankrupt player properties', () => {
    let state = makeTwoPlayerGame();
    const KUWAIT = 1; // Kuwait City — owned by alice
    const MECCA = 27; // Mecca — owned by bob, base rent 700 DHS

    state = {
      ...state,
      // alice owns Kuwait City, has only 10 DHS, sits at 25 (railroad — bob doesn't own it, so no rent there)
      players: state.players.map(p => {
        if (p.id === 'alice') return { ...p, properties: [KUWAIT], money: 10, position: 25 };
        if (p.id === 'bob')   return { ...p, properties: [MECCA] };
        return p;
      }),
      board: state.board.map((s, i) => {
        if (i === KUWAIT) return { ...s, ownerId: 'alice' };
        if (i === MECCA)  return { ...s, ownerId: 'bob' };
        return s;
      }),
    };

    // Roll [1,1] doubles → 25 + 2 = 27 → Mecca → pay 700 rent → bankrupt
    mockDiceSeq(die(1), die(1));
    const { state: after } = rollDice(state, 'alice');

    const alice = after.players.find(p => p.id === 'alice')!;
    expect(alice.isBankrupt).toBe(true);
    expect(alice.properties).toHaveLength(0);
    expect(after.board[KUWAIT].ownerId).toBeNull();
  });
});

// ─── Pay-to-leave-jail (pure function) ───────────────────────────────────────

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

// ─── Build/hotel ──────────────────────────────────────────────────────────────

describe('Build house / hotel', () => {
  it('allows building a house when player owns all properties in a color group', () => {
    let state = makeTwoPlayerGame();
    const firstGroup = BOARD.find(s => s.colorGroup)?.colorGroup;
    expect(firstGroup).toBeDefined();
    const groupProps = BOARD.filter(s => s.colorGroup === firstGroup);
    expect(groupProps.length).toBeGreaterThanOrEqual(2);

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

  it('builds 4 houses on each property in the group, then a hotel on the target', () => {
    let state = makeTwoPlayerGame();
    const firstGroup = BOARD.find(s => s.colorGroup)?.colorGroup;
    const groupProps = BOARD.filter(s => s.colorGroup === firstGroup);
    expect(groupProps.length).toBe(2);

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

    // Build evenly: alternate between the two properties to bring both to 4 houses.
    let s = state;
    const a = groupProps[0].index;
    const b = groupProps[1].index;
    const order = [a, b, a, b, a, b, a, b]; // 4 houses each
    for (const idx of order) {
      const r = buildHouse(s, 'alice', idx);
      expect(r.error).toBeUndefined();
      s = r.state;
    }
    expect(s.board[a].houses).toBe(4);
    expect(s.board[b].houses).toBe(4);

    // Now upgrading 'a' to a hotel should work.
    const hotel = buildHouse(s, 'alice', a);
    expect(hotel.error).toBeUndefined();
    expect(hotel.state.board[a].hotel).toBe(true);
    expect(hotel.state.board[a].houses).toBe(0);
  });
});

// ─── Mortgage recovery strategy ───────────────────────────────────────────────

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

// ─── NPC stall recovery ──────────────────────────────────────────────────────

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

// ─── HTTP: /build ─────────────────────────────────────────────────────────────

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

// ─── HTTP: /mortgage ──────────────────────────────────────────────────────────

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

// ─── HTTP: /pay-jail ──────────────────────────────────────────────────────────

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

// ─── Lobby: ready state ───────────────────────────────────────────────────────

describe('Lobby ready flag', () => {
  it('setPlayerReady toggles the player\'s ready flag', () => {
    let state = createGame('ready-test', 'Alice', 'alice', 'camel');
    ({ state } = joinGame(state, 'Bob', 'bob', 'falcon'));
    const { state: after, error } = setPlayerReady(state, 'bob', true);
    expect(error).toBeUndefined();
    expect(after.players.find(p => p.id === 'bob')!.ready).toBe(true);
  });

  it('rejects setting ready after game has started', () => {
    let state = makeTwoPlayerGame('ready-rejected');
    const { error } = setPlayerReady(state, 'bob', true);
    expect(error).toMatch(/already started/i);
  });

  it('POST /:id/ready persists the flag and returns updated state', async () => {
    const GAME_ID = 'http-ready';
    let state = createGame(GAME_ID, 'Alice', 'alice', 'camel');
    ({ state } = joinGame(state, 'Bob', 'bob', 'falcon'));
    setGame(GAME_ID, state);

    const res = await request(app)
      .post(`/api/games/${GAME_ID}/ready`)
      .send({ playerId: 'bob', ready: true });

    expect(res.status).toBe(200);
    const bob = (res.body.players as { id: string; ready?: boolean }[]).find(p => p.id === 'bob');
    expect(bob!.ready).toBe(true);
  });
});

// ─── Event-driven /poll endpoint ──────────────────────────────────────────────

describe('Event-driven /poll', () => {
  it('emits a game event on setGame that the long-poll handler picks up', async () => {
    const GAME_ID = 'poll-test';
    const state = makeTwoPlayerGame(GAME_ID);
    setGame(GAME_ID, state);

    const eventName = `game:${GAME_ID}`;
    const received = new Promise<{ version: number }>(resolve => {
      gameEvents.once(eventName, (payload: { version: number }) => resolve(payload));
    });

    // Mutate state — this should fire the event
    setGame(GAME_ID, { ...state, version: state.version + 1 });

    const payload = await received;
    expect(payload.version).toBe(state.version + 1);
  });

  it('returns immediately with current state when client version is stale', async () => {
    const GAME_ID = 'poll-stale';
    const state = makeTwoPlayerGame(GAME_ID);
    setGame(GAME_ID, state);

    const res = await request(app).get(`/api/games/${GAME_ID}/poll?version=0`);
    expect(res.status).toBe(200);
    expect(res.body.version).toBe(state.version);
  });
});

// ─── Player profile endpoints ─────────────────────────────────────────────────

describe('Player profile endpoints', () => {
  beforeEach(() => {
    _resetPlayers();
  });

  it('GET /api/players/:id/profile returns a default profile for new players', async () => {
    const res = await request(app).get('/api/players/new-player-1/profile');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('new-player-1');
    expect(res.body.rewardPoints).toBe(0);
    expect(Array.isArray(res.body.challengesCompleted)).toBe(true);
  });

  it('POST /api/players/:id/reward awards points and persists in subsequent reads', async () => {
    const id = 'reward-player-1';
    const award = await request(app)
      .post(`/api/players/${id}/reward`)
      .send({ points: 1000, challengeId: 'gulf' });
    expect(award.status).toBe(200);
    expect(award.body.rewardPoints).toBe(1000);

    const profile = await request(app).get(`/api/players/${id}/profile`);
    expect(profile.body.rewardPoints).toBe(1000);
    expect(profile.body.challengesCompleted).toContain('gulf');
  });

  it('does not double-award the same challenge twice', async () => {
    const id = 'reward-player-2';
    await request(app).post(`/api/players/${id}/reward`).send({ points: 1000, challengeId: 'levant' });
    const dupe = await request(app).post(`/api/players/${id}/reward`).send({ points: 1000, challengeId: 'levant' });
    expect(dupe.status).toBe(200);
    expect(dupe.body.rewardPoints).toBe(1000);
  });

  it('rejects invalid points payloads', async () => {
    const res = await request(app).post('/api/players/x/reward').send({ points: -5 });
    expect(res.status).toBe(400);
    const tooMany = await request(app).post('/api/players/x/reward').send({ points: 999999 });
    expect(tooMany.status).toBe(400);
  });
});
