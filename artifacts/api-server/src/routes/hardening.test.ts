import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { setGame, getGame, evictStaleGames } from '../domains/services/gameStore.js';
import { getProfile } from '../domains/players/profileStore.js';
import { appendLog, MAX_LOG_ENTRIES, type GameLog, type GameState } from '../domains/turns/state.js';
import { createGame, joinGame, startGame } from '../domains/turns/lifecycle.js';
import { rollDice } from '../domains/dice/roll.js';

afterEach(() => { vi.restoreAllMocks(); });

function entry(message: string): GameLog {
  return { message, timestamp: new Date().toISOString() };
}

function twoPlayerGame(gameId: string): GameState {
  let state = createGame(gameId, 'Alice', 'alice', 'camel');
  ({ state } = joinGame(state, 'Bob', 'bob', 'falcon'));
  ({ state } = startGame(state, 'alice'));
  return state;
}

const die = (v: number) => (v - 1) / 6;

// ─── The log is the only unbounded field on GameState ─────────────────────────

describe('appendLog', () => {
  it('capsTheLogAtTheCeiling_gameLog', () => {
    let log: GameLog[] = [];
    for (let i = 0; i < MAX_LOG_ENTRIES * 3; i++) log = appendLog(log, entry(`m${i}`));
    expect(log).toHaveLength(MAX_LOG_ENTRIES);
  });

  it('keepsTheMostRecentEntries_gameLog', () => {
    let log: GameLog[] = [];
    for (let i = 0; i < 60; i++) log = appendLog(log, entry(`m${i}`));
    expect(log[log.length - 1]!.message).toBe('m59');
    expect(log[0]!.message).toBe('m10');
  });

  it('capsWhenManyEntriesArriveAtOnce_gameLog', () => {
    const burst = Array.from({ length: 120 }, (_, i) => entry(`b${i}`));
    expect(appendLog([], ...burst)).toHaveLength(MAX_LOG_ENTRIES);
  });

  it('returnsTheSameArrayWhenNothingIsAppended_gameLog', () => {
    const log = [entry('only')];
    expect(appendLog(log)).toBe(log);
  });

  it('doesNotMutateTheInputLog_gameLog', () => {
    const log = [entry('first')];
    appendLog(log, entry('second'));
    // Domain functions must never mutate the state they were handed.
    expect(log).toHaveLength(1);
  });

  it('capsTheLogOnTheStuckInJailBranch_diceRoll', () => {
    // This branch returns early and used to skip the cap entirely.
    let state = twoPlayerGame('jail-cap');
    const alice = state.players.find(p => p.id === 'alice')!;
    state = {
      ...state,
      players: state.players.map(p => p.id === 'alice' ? { ...p, inJail: true, jailTurns: 1 } : p),
      log: Array.from({ length: MAX_LOG_ENTRIES }, (_, i) => entry(`old${i}`)),
    };
    expect(alice).toBeDefined();

    vi.spyOn(Math, 'random').mockReturnValueOnce(die(2)).mockReturnValueOnce(die(5));
    const { state: after } = rollDice(state, 'alice');

    expect(after.log.length).toBeLessThanOrEqual(MAX_LOG_ENTRIES);
    expect(after.log[after.log.length - 1]!.message).toContain('stuck in jail');
  });

  it('capsTheLogWhenAPlayerJoins_gameLifecycle', () => {
    let state = createGame('join-cap', 'Alice', 'alice', 'camel');
    state = { ...state, log: Array.from({ length: MAX_LOG_ENTRIES }, (_, i) => entry(`old${i}`)) };
    const { state: after } = joinGame(state, 'Bob', 'bob', 'falcon');
    expect(after.log).toHaveLength(MAX_LOG_ENTRIES);
    expect(after.log[after.log.length - 1]!.message).toContain('joined the game');
  });

  it('capsTheLogWhenTheGameStarts_gameLifecycle', () => {
    let state = createGame('start-cap', 'Alice', 'alice', 'camel');
    ({ state } = joinGame(state, 'Bob', 'bob', 'falcon'));
    state = { ...state, log: Array.from({ length: MAX_LOG_ENTRIES }, (_, i) => entry(`old${i}`)) };
    const { state: after } = startGame(state, 'alice');
    expect(after.log).toHaveLength(MAX_LOG_ENTRIES);
  });
});

// ─── HTTP surface ─────────────────────────────────────────────────────────────

describe('API response headers', () => {
  it('forbidsCachingOfMutableGameState_appHeaders', async () => {
    const GAME_ID = 'nostore-' + Date.now();
    setGame(GAME_ID, twoPlayerGame(GAME_ID));

    const res = await request(app).get(`/api/games/${GAME_ID}`);
    expect(res.status).toBe(200);
    // A carrier proxy or CDN caching this shows one player a stale board while
    // their poll version never advances.
    expect(res.headers['cache-control']).toContain('no-store');
  });

  it('forbidsCachingOfThePollEndpoint_appHeaders', async () => {
    const GAME_ID = 'nostore-poll-' + Date.now();
    setGame(GAME_ID, twoPlayerGame(GAME_ID));
    const res = await request(app).get(`/api/games/${GAME_ID}/poll?version=0`);
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toContain('no-store');
  });

  it('sendsNosniffAndNoReferrer_appHeaders', async () => {
    const res = await request(app).get('/api/healthz');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
  });

  it('doesNotAdvertiseTheFramework_appHeaders', async () => {
    const res = await request(app).get('/api/healthz');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('unmatched routes', () => {
  it('returnsJsonNotHtmlForAnUnknownPath_apiRouter', async () => {
    const res = await request(app).get('/api/definitely-not-a-route');
    expect(res.status).toBe(404);
    // The client parses every response as JSON; an HTML error page makes a real
    // 404 indistinguishable from a network failure.
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.error).toContain('No route for');
  });

  it('returnsJsonForAnUnknownGameSubPath_apiRouter', async () => {
    const res = await request(app).post('/api/games/ABC123/not-an-action').send({});
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

describe('request body limits', () => {
  it('rejectsAnOversizedBody_appBodyLimit', async () => {
    const huge = { playerId: 'alice', padding: 'x'.repeat(200_000) };
    const res = await request(app).post('/api/games/ABC123/roll').send(huge);
    expect(res.status).toBe(413);
    expect(res.body.error).toContain('too large');
  });

  it('rejectsMalformedJsonAsJson_appBodyLimit', async () => {
    const res = await request(app)
      .post('/api/games/ABC123/roll')
      .set('Content-Type', 'application/json')
      .send('{"playerId": ');
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

// ─── Long-poll hardening ──────────────────────────────────────────────────────

describe('GET /api/games/:gameId/poll (hardening)', () => {
  it('treatsARepeatedVersionParamAsTheFirstValue_pollRoute', async () => {
    const GAME_ID = 'poll-array-' + Date.now();
    const state = twoPlayerGame(GAME_ID);
    setGame(GAME_ID, state);

    // `parseInt(req.query.version as string)` returned NaN -> 0 here, which made
    // the server answer instantly and the client re-poll in a hot loop.
    const start = Date.now();
    const res = await request(app)
      .get(`/api/games/${GAME_ID}/poll?version=${state.version}&version=${state.version}`)
      .timeout({ deadline: 2000 })
      .catch((err: unknown) => err as { timeout?: boolean });

    // Parked (did not answer immediately) is the correct behaviour.
    expect(Date.now() - start).toBeGreaterThan(900);
    expect((res as { status?: number }).status).not.toBe(200);
  }, 10_000);

  it('treatsAnUnparseableVersionAsZero_pollRoute', async () => {
    const GAME_ID = 'poll-garbage-' + Date.now();
    setGame(GAME_ID, twoPlayerGame(GAME_ID));
    const res = await request(app).get(`/api/games/${GAME_ID}/poll?version=not-a-number`);
    // Version 0 is stale for any live game, so this answers at once.
    expect(res.status).toBe(200);
    expect(res.body.version).toBeGreaterThan(0);
  });

  it('answersImmediatelyOnceTheWaiterCapIsReached_pollRoute', async () => {
    const GAME_ID = 'poll-cap-' + Date.now();
    const state = twoPlayerGame(GAME_ID);
    setGame(GAME_ID, state);

    // Park more pollers than the per-game cap allows; the ones past the cap must
    // be answered rather than pinning a socket and a listener each.
    const parked = Array.from({ length: 30 }, () =>
      request(app)
        .get(`/api/games/${GAME_ID}/poll?version=${state.version}`)
        .timeout({ deadline: 3000 })
        .then(r => r.status)
        .catch(() => 'parked' as const),
    );

    const results = await Promise.all(parked);
    expect(results.filter(r => r === 200).length).toBeGreaterThan(0);
  }, 15_000);

  it('returns404WhenTheGameIsEvictedWhileParked_pollRoute', async () => {
    const GAME_ID = 'poll-evicted-' + Date.now();
    const state = twoPlayerGame(GAME_ID);
    setGame(GAME_ID, state);

    const pending = request(app).get(`/api/games/${GAME_ID}/poll?version=${state.version}`);

    setTimeout(() => {
      // Far-future clock so this game is past its idle TTL.
      evictStaleGames(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }, 50);

    const res = await pending;
    // A bare 304 fell into the client's generic failure branch and retried
    // forever; 404 matches the error convention and lets it stop cleanly.
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Game not found');
    expect(getGame(GAME_ID)).toBeUndefined();
  }, 10_000);
});

// ─── Profile reads must not allocate ──────────────────────────────────────────

describe('GET /api/players/:playerId/profile', () => {
  it('doesNotCreateAProfileOnRead_profileStore', async () => {
    const unknown = 'never-seen-' + Date.now();

    const res = await request(app).get(`/api/players/${unknown}/profile`);
    expect(res.status).toBe(200);
    expect(res.body.rewardPoints).toBe(0);

    // Reading used to insert, so anyone could grow the map without bound by
    // requesting random ids against an unauthenticated endpoint.
    const first = getProfile(unknown);
    const second = getProfile(unknown);
    expect(first).not.toBe(second);
  });

  it('returnsTheStoredProfileAfterAWrite_profileStore', async () => {
    const playerId = 'writer-' + Date.now();
    await request(app).post(`/api/players/${playerId}/reward`).send({ points: 750 });

    const res = await request(app).get(`/api/players/${playerId}/profile`);
    expect(res.status).toBe(200);
    expect(res.body.rewardPoints).toBe(750);
    // 500 crossed, 1000 not.
    expect(res.body.unlockedAdvantages).toEqual([0]);
  });
});

// ─── Shutdown ordering ────────────────────────────────────────────────────────

describe('process shutdown wiring', () => {
  it('leavesSignalHandlingToTheProcessEntry_storeModules', async () => {
    // Both stores used to register their own SIGTERM handler at import, and the
    // game store's called process.exit(0) as soon as ITS flush resolved — so
    // whether reward points survived a deploy came down to which of two
    // unordered promises finished first. Importing a store must now register
    // nothing; index.ts owns the single ordered shutdown path.
    const before = process.listenerCount('SIGTERM') + process.listenerCount('SIGINT');

    await import('../domains/services/gameStore.js');
    await import('../domains/players/profileStore.js');

    const after = process.listenerCount('SIGTERM') + process.listenerCount('SIGINT');
    expect(after).toBe(before);
  });

  it('flushesBothStoresToCompletion_storeModules', async () => {
    const { flushGamesToFile } = await import('../domains/services/gameStore.js');
    const { flushPlayersToFile, addRewardPoints } = await import('../domains/players/profileStore.js');

    const playerId = 'flush-' + Date.now();
    setGame('flush-game-' + Date.now(), twoPlayerGame('flush-game'));
    addRewardPoints(playerId, 42);

    // Sequential, mirroring index.ts: each must actually settle.
    await expect(flushGamesToFile()).resolves.toBeUndefined();
    await expect(flushPlayersToFile()).resolves.toBeUndefined();
  });
});
