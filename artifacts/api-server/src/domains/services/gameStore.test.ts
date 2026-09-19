import { describe, it, expect, beforeEach } from 'vitest';
import {
  getGame,
  setGame,
  deleteGame,
  evictStaleGames,
  gameCount,
  onGameChange,
  waiterCount,
  generateGameId,
  restoredTouchTime,
  type EvictionLimits,
} from './gameStore.js';
import { createGame, joinGame, startGame } from '../turns/lifecycle.js';
import type { GameState } from '../turns/state.js';

/**
 * Eviction and per-game change events.
 *
 * These exist because the store previously had no eviction at all — an eviction
 * policy with no test is a leak with extra steps.
 */

const LIMITS: EvictionLimits = {
  maxGames: 3,
  idleTtlMs: 60_000,
  finishedTtlMs: 5_000,
};

function twoPlayerGame(gameId: string): GameState {
  let state = createGame(gameId, 'Alice', 'alice', 'camel');
  ({ state } = joinGame(state, 'Bob', 'bob', 'falcon'));
  ({ state } = startGame(state, 'alice'));
  return state;
}

function clearStore(): void {
  // The store is a module singleton; drop everything this file created so each
  // test reasons about a known set.
  evictStaleGames(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000, LIMITS);
}

beforeEach(clearStore);

describe('gameStore eviction', () => {
  it('evictsFinishedGamesAfterTheirGracePeriod_gameStore', () => {
    const state = twoPlayerGame('finished-1');
    setGame('finished-1', { ...state, status: 'finished', winnerId: 'alice' });
    const touchedAt = Date.now();

    // Still inside the grace period: every client must get a chance to poll the
    // final state before it disappears.
    expect(evictStaleGames(touchedAt + 1_000, LIMITS)).not.toContain('finished-1');
    expect(getGame('finished-1')).toBeDefined();

    expect(evictStaleGames(touchedAt + 6_000, LIMITS)).toContain('finished-1');
    expect(getGame('finished-1')).toBeUndefined();
  });

  it('evictsIdleGamesPastTheIdleTtl_gameStore', () => {
    setGame('idle-1', twoPlayerGame('idle-1'));
    const touchedAt = Date.now();

    expect(evictStaleGames(touchedAt + 30_000, LIMITS)).not.toContain('idle-1');
    expect(evictStaleGames(touchedAt + 61_000, LIMITS)).toContain('idle-1');
    expect(getGame('idle-1')).toBeUndefined();
  });

  it('keepsAGameAliveWhileItIsStillBeingRead_gameStore', () => {
    setGame('active-1', twoPlayerGame('active-1'));
    const start = Date.now();

    // A lobby whose players are only polling never writes, so a write-only
    // clock would evict a game people are actively waiting in.
    const later = start + 59_000;
    getGame('active-1');

    expect(evictStaleGames(later, LIMITS)).not.toContain('active-1');
    expect(getGame('active-1')).toBeDefined();
  });

  it('evictsLeastRecentlyTouchedGamesOverTheCeiling_gameStore', () => {
    // Four games, ceiling of three: the oldest-touched one must go even though
    // none of them is past its TTL.
    for (const id of ['cap-1', 'cap-2', 'cap-3', 'cap-4']) {
      setGame(id, twoPlayerGame(id));
    }
    expect(gameCount()).toBe(4);

    // Touch three of them so cap-1 is the least recent.
    getGame('cap-2'); getGame('cap-3'); getGame('cap-4');

    const evicted = evictStaleGames(Date.now(), LIMITS);
    expect(evicted).toContain('cap-1');
    expect(gameCount()).toBe(3);
    expect(getGame('cap-4')).toBeDefined();
  });

  it('wakesPollersParkedOnAnEvictedGame_gameStore', () => {
    setGame('evict-wake', twoPlayerGame('evict-wake'));
    const touchedAt = Date.now();

    let woke = false;
    const unsubscribe = onGameChange('evict-wake', () => { woke = true; });

    evictStaleGames(touchedAt + 61_000, LIMITS);

    // Without this the parked long-poll would hold its socket for the full
    // timeout after the game had already gone.
    expect(woke).toBe(true);
    unsubscribe();
  });

  it('reportsZeroGamesAfterEverythingIsEvicted_gameStore', () => {
    setGame('count-1', twoPlayerGame('count-1'));
    setGame('count-2', twoPlayerGame('count-2'));
    expect(gameCount()).toBe(2);
    clearStore();
    expect(gameCount()).toBe(0);
  });
});

describe('gameStore change events', () => {
  it('notifiesOnlyTheChangedGamesWaiters_gameStore', () => {
    setGame('fanout-a', twoPlayerGame('fanout-a'));
    setGame('fanout-b', twoPlayerGame('fanout-b'));

    let aCalls = 0;
    let bCalls = 0;
    const offA = onGameChange('fanout-a', () => { aCalls += 1; });
    const offB = onGameChange('fanout-b', () => { bCalls += 1; });

    setGame('fanout-a', { ...twoPlayerGame('fanout-a'), version: 99 });

    // The whole point of the per-game channel: one player's action must not do
    // work proportional to every other game in flight.
    expect(aCalls).toBe(1);
    expect(bCalls).toBe(0);

    offA(); offB();
  });

  it('stopsNotifyingAfterUnsubscribe_gameStore', () => {
    setGame('unsub-1', twoPlayerGame('unsub-1'));
    let calls = 0;
    const off = onGameChange('unsub-1', () => { calls += 1; });

    setGame('unsub-1', { ...twoPlayerGame('unsub-1'), version: 2 });
    expect(calls).toBe(1);

    off();
    setGame('unsub-1', { ...twoPlayerGame('unsub-1'), version: 3 });

    // A poll that ends without unsubscribing leaks both the listener and, via
    // the closure, its `res` object.
    expect(calls).toBe(1);
    expect(waiterCount('unsub-1')).toBe(0);
  });

  it('countsParkedWaitersPerGame_gameStore', () => {
    setGame('waiters-1', twoPlayerGame('waiters-1'));
    expect(waiterCount('waiters-1')).toBe(0);
    const off1 = onGameChange('waiters-1', () => {});
    const off2 = onGameChange('waiters-1', () => {});
    expect(waiterCount('waiters-1')).toBe(2);
    expect(waiterCount('waiters-other')).toBe(0);
    off1(); off2();
    expect(waiterCount('waiters-1')).toBe(0);
  });

  it('notifiesWaitersWhenAGameIsDeleted_gameStore', () => {
    setGame('deleted-1', twoPlayerGame('deleted-1'));
    let woke = false;
    const off = onGameChange('deleted-1', () => { woke = true; });
    deleteGame('deleted-1');
    expect(woke).toBe(true);
    expect(getGame('deleted-1')).toBeUndefined();
    off();
  });
});

describe('generateGameId', () => {
  it('producesSixCharacterIdsWithoutAmbiguousGlyphs_gameStore', () => {
    for (let i = 0; i < 200; i++) {
      const id = generateGameId();
      expect(id).toHaveLength(6);
      // I/O/0/1 are excluded so a code read aloud or off a screen is unambiguous.
      expect(id).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
    }
  });
});

describe('restoredTouchTime', () => {
  it('usesTheLastLogEntryAsTheActivityClock_gameStore', () => {
    const when = '2026-01-02T03:04:05.000Z';
    const state = {
      ...twoPlayerGame('restore-1'),
      log: [
        { message: 'older', timestamp: '2025-01-01T00:00:00.000Z' },
        { message: 'newest', timestamp: when },
      ],
    };
    // Seeding from boot time would restart every game's idle window on each
    // deploy, so a dead game would outlive every restart.
    expect(restoredTouchTime(state)).toBe(Date.parse(when));
  });

  it('fallsBackToNowWhenTheLogIsEmpty_gameStore', () => {
    const state = { ...twoPlayerGame('restore-2'), log: [] };
    const before = Date.now();
    const got = restoredTouchTime(state);
    expect(got).toBeGreaterThanOrEqual(before);
  });

  it('fallsBackToNowWhenTheTimestampIsUnparseable_gameStore', () => {
    const state = {
      ...twoPlayerGame('restore-3'),
      log: [{ message: 'corrupt', timestamp: 'not-a-date' }],
    };
    const before = Date.now();
    expect(restoredTouchTime(state)).toBeGreaterThanOrEqual(before);
  });
});
