import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { reconcileGameState, reuseUnchanged, shallowEqualRow } from './reconcile.js';
import type { BoardProperty, GameState, Player } from '../context/GameContext';

const player = (over: Partial<Player> = {}): Player => ({
  id: 'p1', name: 'Kenji', token: 'camel', money: 15000, position: 0,
  properties: [], inJail: false, jailTurns: 0, isBankrupt: false,
  color: '#EF4444', doublesCount: 0, ready: true, ...over,
});

const space = (over: Partial<BoardProperty> = {}): BoardProperty => ({
  index: 1, name: 'Souq Waqif', nameAr: 'سوق واقف', type: 'property',
  price: 600, ownerId: null, houses: 0, hotel: false, isMortgaged: false, ...over,
});

const state = (over: Partial<GameState> = {}): GameState => ({
  gameId: 'ABC123', status: 'playing', players: [player()], board: [space()],
  currentPlayerId: 'p1', diceRoll: null, hasRolled: false, version: 1,
  log: [], winnerId: null, pendingTrade: null, freeParkingPool: 0,
  pendingTaxChoice: null, ...over,
});

describe('shallowEqualRow', () => {
  it('treats structurally identical rows as equal', () => {
    assert.equal(shallowEqualRow(player(), player()), true);
    assert.equal(shallowEqualRow(space(), space()), true);
  });

  it('compares arrays of primitives element-wise', () => {
    assert.equal(shallowEqualRow(player({ properties: [1, 2] }), player({ properties: [1, 2] })), true);
    assert.equal(shallowEqualRow(player({ properties: [1, 2] }), player({ properties: [2, 1] })), false);
    assert.equal(shallowEqualRow(player({ properties: [1] }), player({ properties: [1, 2] })), false);
  });

  it('detects a changed scalar', () => {
    assert.equal(shallowEqualRow(player(), player({ money: 14900 })), false);
    assert.equal(shallowEqualRow(space(), space({ houses: 1 })), false);
  });

  it('does not claim equality for differing key sets or non-objects', () => {
    assert.equal(shallowEqualRow({ a: 1 }, { a: 1, b: 2 }), false);
    assert.equal(shallowEqualRow(null, { a: 1 }), false);
    assert.equal(shallowEqualRow(3, 3), true);
  });
});

describe('reuseUnchanged', () => {
  it('returns the previous array when nothing changed', () => {
    const prev = [player(), player({ id: 'p2' })];
    const next = [player(), player({ id: 'p2' })];
    assert.equal(reuseUnchanged(prev, next), prev);
  });

  it('keeps identity for untouched rows and swaps in only the changed one', () => {
    const prev = [player(), player({ id: 'p2' })];
    const next = [player({ position: 4 }), player({ id: 'p2' })];
    const out = reuseUnchanged(prev, next);

    assert.notEqual(out, prev);
    assert.equal(out[0], next[0]);
    assert.equal(out[1], prev[1]);
  });

  it('preserves the unchanged prefix when rows are appended', () => {
    const prev = [{ message: 'rolled 7' }];
    const next = [{ message: 'rolled 7' }, { message: 'bought Souq Waqif' }];
    const out = reuseUnchanged(prev, next);

    assert.equal((out).length, 2);
    assert.equal(out[0], prev[0]);
    assert.equal(out[1], next[1]);
  });

  it('passes through when there is no previous array', () => {
    const next = [player()];
    assert.equal(reuseUnchanged(undefined, next), next);
  });
});

describe('reconcileGameState', () => {
  it('passes a first state straight through', () => {
    const next = state();
    assert.equal(reconcileGameState(null, next), next);
  });

  it('passes through a state for a different game', () => {
    const next = state({ gameId: 'ZZZ999' });
    assert.equal(reconcileGameState(state(), next), next);
  });

  it('keeps board and player identity when only the version moved', () => {
    const prev = state();
    const next = state({ version: 2 });
    const out = reconcileGameState(prev, next);

    assert.equal(out.version, 2);
    assert.equal(out.board, prev.board);
    assert.equal(out.players, prev.players);
  });

  it('replaces only the row that actually changed', () => {
    const prev = state({
      players: [player(), player({ id: 'p2', color: '#3B82F6' })],
      board: [space(), space({ index: 2, name: 'Pearl Tower' })],
    });
    const next = state({
      version: 2,
      players: [player({ position: 6 }), player({ id: 'p2', color: '#3B82F6' })],
      board: [space(), space({ index: 2, name: 'Pearl Tower' })],
    });
    const out = reconcileGameState(prev, next);

    // The whole board is untouched, so the array reference survives — this is
    // what lets the memoised board skip 28 cells.
    assert.equal(out.board, prev.board);
    assert.notEqual(out.players, prev.players);
    assert.equal(out.players[0].position, 6);
    assert.equal(out.players[1], prev.players[1]);
  });

  it('reflects a property being bought', () => {
    const prev = state();
    const next = state({ version: 2, board: [space({ ownerId: 'p1' })] });
    const out = reconcileGameState(prev, next);

    assert.notEqual(out.board, prev.board);
    assert.equal(out.board[0].ownerId, 'p1');
  });
});
