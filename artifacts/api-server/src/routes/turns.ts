import { Router, type IRouter } from 'express';
import { joinGame, startGame, endTurn, payJail, setReady } from '../domains/turns/lifecycle.js';
import { getGame, setGame, gameEvents } from '../domains/services/gameStore.js';

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

// POST /api/games/:gameId/pay-jail — pay 500 Dawaar Dollars to leave jail
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

// GET /api/games/:gameId/poll — event-driven long-poll for updates
router.get('/:gameId/poll', (req, res): void => {
  const gameId = req.params.gameId;
  const state = getGame(gameId);
  if (!state) { res.status(404).json({ error: 'Game not found' }); return; }

  const clientVersion = parseInt(req.query.version as string) || 0;

  if (state.version > clientVersion) {
    res.json(state);
    return;
  }

  let settled = false;
  const onChange = (changedId: string) => {
    if (settled || changedId !== gameId) return;
    const latest = getGame(gameId);
    if (!latest) {
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
      if (latest) res.json(latest);
      else res.status(304).send();
    });
  }, 20000);

  function finish(send: () => void) {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    gameEvents.off('change', onChange);
    send();
  }

  gameEvents.on('change', onChange);
  req.on('close', () => {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    gameEvents.off('change', onChange);
  });
});

export default router;
