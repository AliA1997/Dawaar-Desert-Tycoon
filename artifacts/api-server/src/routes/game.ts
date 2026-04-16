import { Router, type IRouter } from 'express';
import {
  createGame,
  joinGame,
  startGame,
  rollDice,
  buyProperty,
  endTurn,
  payJail,
  buildHouse,
  mortgageProperty,
  proposeTrade,
  acceptTrade,
  claimAdReward,
} from '../game/gameState.js';
import { getGame, setGame, generateGameId } from '../game/gameStore.js';

const router: IRouter = Router();

// POST /api/games - Create new game
router.post('/', (req, res) => {
  const { playerName, playerId, token } = req.body;
  if (!playerName || !playerId || !token) {
    return res.status(400).json({ error: 'playerName, playerId, and token are required' });
  }
  let gameId = generateGameId();
  while (getGame(gameId)) gameId = generateGameId();

  const state = createGame(gameId, playerName, playerId, token);
  setGame(gameId, state);
  res.status(201).json({ gameId: state.gameId, status: state.status, players: state.players });
});

// GET /api/games/:gameId - Get game state
router.get('/:gameId', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  res.json(state);
});

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
  res.json(newState);
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
  res.json(newState);
});

// POST /api/games/:gameId/roll
router.post('/:gameId/roll', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { playerId } = req.body;
  if (!playerId) return res.status(400).json({ error: 'playerId is required' });
  const { state: newState, dice, isDoubles, error } = rollDice(state, playerId);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  res.json({ dice, isDoubles, gameState: newState });
});

// POST /api/games/:gameId/buy
router.post('/:gameId/buy', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { playerId } = req.body;
  if (!playerId) return res.status(400).json({ error: 'playerId is required' });
  const { state: newState, error } = buyProperty(state, playerId);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  res.json(newState);
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
  res.json(newState);
});

// POST /api/games/:gameId/build
router.post('/:gameId/build', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { playerId, propertyIndex } = req.body;
  if (!playerId || propertyIndex === undefined) return res.status(400).json({ error: 'playerId and propertyIndex are required' });
  const { state: newState, error } = buildHouse(state, playerId, propertyIndex);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  res.json(newState);
});

// POST /api/games/:gameId/mortgage
router.post('/:gameId/mortgage', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { playerId, propertyIndex, action } = req.body;
  if (!playerId || propertyIndex === undefined || !action) return res.status(400).json({ error: 'playerId, propertyIndex, and action are required' });
  const { state: newState, error } = mortgageProperty(state, playerId, propertyIndex, action);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  res.json(newState);
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
  res.json(newState);
});

// POST /api/games/:gameId/reward — claim ad-watch reward (1,500 DHS)
router.post('/:gameId/reward', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { playerId } = req.body;
  if (!playerId) return res.status(400).json({ error: 'playerId is required' });
  const { state: newState, error } = claimAdReward(state, playerId);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  res.json(newState);
});

// POST /api/games/:gameId/trade
router.post('/:gameId/trade', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { fromPlayerId, toPlayerId, offeredPropertyIndices, requestedPropertyIndices, offeredMoney, requestedMoney, accept } = req.body;

  if (accept) {
    const { state: newState, error } = acceptTrade(state, toPlayerId || fromPlayerId);
    if (error) return res.status(400).json({ error });
    setGame(req.params.gameId, newState);
    return res.json(newState);
  }

  if (!fromPlayerId || !toPlayerId) return res.status(400).json({ error: 'Trade players are required' });
  const { state: newState, error } = proposeTrade(state, {
    fromPlayerId,
    toPlayerId,
    offeredPropertyIndices: offeredPropertyIndices || [],
    requestedPropertyIndices: requestedPropertyIndices || [],
    offeredMoney: offeredMoney || 0,
    requestedMoney: requestedMoney || 0,
  });
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  res.json(newState);
});

// GET /api/games/:gameId/poll - Long-poll for updates
router.get('/:gameId/poll', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });

  const clientVersion = parseInt(req.query.version as string) || 0;

  if (state.version > clientVersion) {
    return res.json(state);
  }

  // Long-poll: wait up to 20 seconds for a change
  const timeout = setTimeout(() => {
    const latestState = getGame(req.params.gameId);
    if (latestState) {
      res.json(latestState);
    } else {
      res.status(304).send();
    }
  }, 20000);

  // Check every 500ms for version change
  const interval = setInterval(() => {
    const latestState = getGame(req.params.gameId);
    if (!latestState) {
      clearInterval(interval);
      clearTimeout(timeout);
      return res.status(404).json({ error: 'Game not found' });
    }
    if (latestState.version > clientVersion) {
      clearInterval(interval);
      clearTimeout(timeout);
      res.json(latestState);
    }
  }, 500);

  req.on('close', () => {
    clearInterval(interval);
    clearTimeout(timeout);
  });
});

export default router;
