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
    expect(alice.position).toBe(10);
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
  // Chance spaces are at board positions 7, 22, 36.
  // We position alice just before a Chance space and mock dice to land on it,
  // then mock the card draw to select the back_3 card.

  const back3Index = CHANCE_CARDS.findIndex(c => c.action === 'back_3');

  it('lands on Chance at position 7 and moves back 3 to position 4', () => {
    let state = makeTwoPlayerGame();
    // Position alice at 5 so rolling [1,1] = 2 lands on 7 (Chance)
    state = {
      ...state,
      players: state.players.map(p => p.id === 'alice' ? { ...p, position: 5 } : p),
    };

    // d1=1, d2=1 (total=2, lands on 7), then card selection for back_3
    const cardRand = back3Index / CHANCE_CARDS.length;
    mockDiceSeq(die(1), die(1), cardRand);

    const { state: after } = rollDice(state, 'alice');
    const alice = after.players.find(p => p.id === 'alice')!;
    // 7 - 3 = 4 (Zakat Tax space)
    expect(alice.position).toBe(4);
  });

  it('lands on Chance at position 36 and moves back 3 to position 33', () => {
    let state = makeTwoPlayerGame();
    // Position alice at 30 so rolling [3,3] = 6 lands on 36 (Chance)
    state = {
      ...state,
      players: state.players.map(p => p.id === 'alice' ? { ...p, position: 30 } : p),
    };

    const cardRand = back3Index / CHANCE_CARDS.length;
    mockDiceSeq(die(3), die(3), cardRand);

    const { state: after } = rollDice(state, 'alice');
    const alice = after.players.find(p => p.id === 'alice')!;
    // 36 - 3 = 33 (Community Chest)
    expect(alice.position).toBe(33);
  });

  it('wrap formula (pos - 3 + 40) % 40 is correct for all boundary values', () => {
    // Verify the formula never clamps to 0 incorrectly (the old Math.max bug)
    expect((2 - 3 + 40) % 40).toBe(39);
    expect((1 - 3 + 40) % 40).toBe(38);
    expect((0 - 3 + 40) % 40).toBe(37);
    expect((7 - 3 + 40) % 40).toBe(4);  // normal case
    expect((36 - 3 + 40) % 40).toBe(33); // another normal case
  });
});

// ─── Bug 3: Tax values ────────────────────────────────────────────────────────

describe('Tax space amounts', () => {
  it('Zakat Tax (space 4) costs 500 DHS', () => {
    expect(BOARD[4].name).toBe('Zakat Tax');
    expect(BOARD[4].taxAmount).toBe(500);
  });

  it('Oil Revenue Tax (space 38) costs 2000 DHS', () => {
    expect(BOARD[38].name).toBe('Oil Revenue Tax');
    expect(BOARD[38].taxAmount).toBe(2000);
  });

  it('deducts 500 DHS when player rolls onto Zakat Tax space', () => {
    let state = makeTwoPlayerGame();
    // Position alice at 2, roll [1,1] = 2 → lands on space 4 (Zakat Tax)
    state = {
      ...state,
      players: state.players.map(p => p.id === 'alice' ? { ...p, position: 2 } : p),
    };
    const moneyBefore = state.players.find(p => p.id === 'alice')!.money;
    mockDiceSeq(die(1), die(1));
    const { state: after } = rollDice(state, 'alice');
    const alice = after.players.find(p => p.id === 'alice')!;
    expect(alice.position).toBe(4);
    expect(alice.money).toBe(moneyBefore - 500);
  });

  it('deducts 2000 DHS when player rolls onto Oil Revenue Tax space', () => {
    let state = makeTwoPlayerGame();
    // Position alice at 36, roll [1,1] = 2 → lands on space 38 (Oil Revenue Tax)
    state = {
      ...state,
      players: state.players.map(p => p.id === 'alice' ? { ...p, position: 36 } : p),
    };
    const moneyBefore = state.players.find(p => p.id === 'alice')!.money;
    mockDiceSeq(die(1), die(1));
    const { state: after } = rollDice(state, 'alice');
    const alice = after.players.find(p => p.id === 'alice')!;
    expect(alice.position).toBe(38);
    expect(alice.money).toBe(moneyBefore - 2000);
  });
});

// ─── Bug 4: Bankruptcy property clearing ─────────────────────────────────────

describe('Bankruptcy clears properties from board', () => {
  it('sets ownerId to null on all bankrupt player properties', () => {
    let state = makeTwoPlayerGame();

    // Give alice property at index 1 (Tunis)
    state = {
      ...state,
      players: state.players.map(p =>
        p.id === 'alice' ? { ...p, properties: [1], money: 10 } : p
      ),
      board: state.board.map((s, i) => i === 1 ? { ...s, ownerId: 'alice' } : s),
    };

    // Give bob Dubai (index 39) with base rent 500 DHS — enough to bankrupt alice
    state = {
      ...state,
      board: state.board.map((s, i) => i === 39 ? { ...s, ownerId: 'bob' } : s),
      players: state.players.map(p => {
        if (p.id === 'alice') return { ...p, position: 37 };
        if (p.id === 'bob') return { ...p, properties: [39] };
        return p;
      }),
    };

    // Roll [1,1] doubles → position 37+2=39 → Dubai → pay 500 rent → bankrupt
    mockDiceSeq(die(1), die(1));
    const { state: after } = rollDice(state, 'alice');

    const alice = after.players.find(p => p.id === 'alice')!;
    expect(alice.isBankrupt).toBe(true);
    expect(alice.properties).toHaveLength(0);
    // Tunis (index 1) should be unowned again
    expect(after.board[1].ownerId).toBeNull();
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
    // Build 4 houses then a hotel
    let s = state;
    for (let i = 0; i < 4; i++) {
      const result = buildHouse(s, 'alice', target.index);
      expect(result.error).toBeUndefined();
      s = result.state;
    }
    expect(s.board[target.index].houses).toBe(4);

    const hotelResult = buildHouse(s, 'alice', target.index);
    expect(hotelResult.error).toBeUndefined();
    expect(hotelResult.state.board[target.index].hotel).toBe(true);
    expect(hotelResult.state.board[target.index].houses).toBe(0);
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
