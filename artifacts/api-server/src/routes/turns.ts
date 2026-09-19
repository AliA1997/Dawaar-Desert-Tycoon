import { Router, type IRouter } from 'express';
import { joinGame, startGame, endTurn, payJail, setReady } from '../domains/turns/lifecycle.js';
import { getGame, setGame, onGameChange, waiterCount } from '../domains/services/gameStore.js';
import { config } from '../config.js';

const router: IRouter = Router();

// POST /api/games/:gameId/join
router.post('/:gameId/join', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { playerName, playerId, token } = req.body;
  if (!playerName || !playerId || !token) {
    return res.status(400).json({ error: 'playerName, playerId, and token are required' });
  }
  const { state: newState, error } = joinGame(state, playerName, playerId, token);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  return res.json(newState);
});

// POST /api/games/:gameId/start
router.post('/:gameId/start', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { playerId } = req.body;
  if (!playerId) return res.status(400).json({ error: 'playerId is required' });
  const { state: newState, error } = startGame(state, playerId);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  return res.json(newState);
});

// POST /api/games/:gameId/end-turn
router.post('/:gameId/end-turn', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { playerId } = req.body;
  if (!playerId) return res.status(400).json({ error: 'playerId is required' });
  const { state: newState, error } = endTurn(state, playerId);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  return res.json(newState);
});

// POST /api/games/:gameId/pay-jail — pay 500 DHS to leave jail
router.post('/:gameId/pay-jail', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { playerId } = req.body;
  if (!playerId) return res.status(400).json({ error: 'playerId is required' });
  const { state: newState, error } = payJail(state, playerId);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  return res.json(newState);
});

// POST /api/games/:gameId/ready — toggle ready state in lobby
router.post('/:gameId/ready', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { playerId, ready } = req.body;
  if (!playerId) return res.status(400).json({ error: 'playerId is required' });
  if (typeof ready !== 'boolean') return res.status(400).json({ error: 'ready (boolean) is required' });
  const { state: newState, error } = setReady(state, playerId, ready);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  return res.json(newState);
});

/**
 * Parse the client's `?version=`.
 *
 * `parseInt(req.query.version as string)` lied: a repeated query parameter makes
 * `req.query.version` an array, `parseInt` returns NaN, `|| 0` turns that into
 * 0, and the server answers immediately with the full state — so the client
 * re-polls at once and the pair spin in a hot loop, burning battery and CPU.
 */
function parseClientVersion(raw: unknown): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string') return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

// GET /api/games/:gameId/poll — event-driven long-poll for updates
router.get('/:gameId/poll', (req, res): void => {
  const gameId = req.params.gameId;
  const state = getGame(gameId);
  if (!state) { res.status(404).json({ error: 'Game not found' }); return; }

  const clientVersion = parseClientVersion(req.query.version);

  if (state.version > clientVersion) {
    res.json(state);
    return;
  }

  // Bound the parked connections per game. A game holds at most 6 players, so a
  // much larger number here means something is retrying without backing off;
  // answering immediately keeps one game from pinning sockets and listeners.
  if (waiterCount(gameId) >= config.maxPollWaitersPerGame) {
    res.json(state);
    return;
  }

  let settled = false;
  // Assigned before any path can call finish(); see the subscription below.
  let unsubscribe: () => void = () => {};

  const onChange = (changedId: string) => {
    if (settled || changedId !== gameId) return;
    const latest = getGame(gameId);
    if (!latest) {
      // Evicted or deleted while parked. 404 matches the error convention and
      // lets the client stop cleanly; the bare 304 this used to send fell into
      // the client's generic failure branch and retried forever.
      finish(() => res.status(404).json({ error: 'Game not found' }));
      return;
    }
    if (latest.version > clientVersion) {
      finish(() => res.json(latest));
    }
  };

  const timeout = setTimeout(() => {
    const latest = getGame(gameId);
    finish(() => {
      // Answering the timeout with the unchanged state re-sends a payload the
      // client already has. It stays that way on purpose: the client treats any
      // non-200/404 as a failure and backs off, so returning 304 here would
      // show every player a "reconnecting" banner every 20 seconds. Changing it
      // requires a client change first — see NOTES.md.
      if (latest) res.json(latest);
      else res.status(404).json({ error: 'Game not found' });
    });
  }, config.pollTimeoutMs);

  function finish(send: () => void) {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    unsubscribe();
    send();
  }

  // Per-game subscription. The previous single global 'change' listener meant a
  // change in ANY game invoked the closure of EVERY parked poll on the server —
  // one player's dice roll doing work proportional to every game in flight, and
  // each closure holding its own `res` alive.
  unsubscribe = onGameChange(gameId, onChange);

  res.on('close', () => {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    unsubscribe();
  });
});

export default router;
