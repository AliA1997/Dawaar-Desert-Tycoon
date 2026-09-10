import type { GameState } from '@/context/GameContext';

/**
 * Identity-preserving reconciliation for server state.
 *
 * Every poll and every action response is a freshly parsed JSON document, so
 * `state.board[7]` is a brand-new object even when nothing about that space
 * changed. React.memo compares by reference, which means a board of 28 memoised
 * cells re-rendered in full on every single state delta — the memo was doing
 * nothing but adding a comparison.
 *
 * These helpers walk the new state against the one already on screen and hand
 * back the *previous* object wherever the contents are unchanged. The result is
 * a state tree where reference equality once again means "this did not change",
 * so `memo`, `useMemo` and dependency arrays all start working as intended.
 *
 * Cost is one shallow comparison per row (28 spaces + up to 6 players); the
 * saving is every subtree whose props are now reference-equal.
 */

/** Shallow equality, with element-wise comparison for arrays of primitives. */
export function shallowEqualRow(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;

  const aKeys = Object.keys(a as object);
  const bKeys = Object.keys(b as object);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    const av = (a as Record<string, unknown>)[key];
    const bv = (b as Record<string, unknown>)[key];
    if (av === bv) continue;

    if (Array.isArray(av) && Array.isArray(bv)) {
      if (av.length !== bv.length) return false;
      for (let i = 0; i < av.length; i++) {
        if (av[i] !== bv[i]) return false;
      }
      continue;
    }
    return false;
  }
  return true;
}

/**
 * Returns `next`, but with every unchanged element replaced by the element that sat
 * at the same index in `prev`. If every element is unchanged and the lengths
 * match, `prev` itself is returned so the array reference survives too.
 */
export function reuseUnchanged<T>(prev: readonly T[] | undefined, next: readonly T[]): readonly T[] {
  if (!prev) return next;
  if (prev === next) return prev;

  let allReused = prev.length === next.length;
  const out = next.map((item, i) => {
    const before = prev[i];
    if (before !== undefined && shallowEqualRow(before, item)) return before;
    allReused = false;
    return item;
  });

  return allReused ? prev : out;
}

/**
 * Merge a newly received state onto the one already rendered, keeping object
 * identity for everything that did not actually change. `prev` of `null`, or a
 * state for a different game, passes straight through.
 *
 * Only `board` and `players` are reconciled — see the note inside.
 */
export function reconcileGameState(prev: GameState | null, next: GameState): GameState {
  if (!prev || prev.gameId !== next.gameId) return next;

  const board = reuseUnchanged(prev.board, next.board) as GameState['board'];
  const players = reuseUnchanged(prev.players, next.players) as GameState['players'];

  // `log` is deliberately not reconciled. The server caps it at the last 50
  // entries, so once a game passes 50 log lines every append shifts the whole
  // array and index-matched rows stop lining up — 50 comparisons per delta that
  // can never match. The log also changes on nearly every delta anyway, which
  // is exactly the case reconciliation cannot help.
  if (board === next.board && players === next.players) return next;
  return { ...next, board, players };
}
