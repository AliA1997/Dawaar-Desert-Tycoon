import { Router, type IRouter } from 'express';
import { buyProperty } from '../domains/properties/buy.js';
import { buildHouse, sellHouse } from '../domains/properties/build.js';
import { mortgageProperty } from '../domains/properties/mortgage.js';
import { auctionBuy } from '../domains/properties/auction.js';
import { getGame, setGame } from '../domains/services/gameStore.js';

const router: IRouter = Router();

// POST /api/games/:gameId/buy
router.post('/:gameId/buy', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { playerId } = req.body;
  if (!playerId) return res.status(400).json({ error: 'playerId is required' });
  const { state: newState, error } = buyProperty(state, playerId);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  return res.json(newState);
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
  return res.json(newState);
});

// POST /api/games/:gameId/sell-house
router.post('/:gameId/sell-house', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { playerId, propertyIndex } = req.body;
  if (!playerId || propertyIndex === undefined) return res.status(400).json({ error: 'playerId and propertyIndex are required' });
  const { state: newState, error } = sellHouse(state, playerId, propertyIndex);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  return res.json(newState);
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
  return res.json(newState);
});

// POST /api/games/:gameId/auction-buy
router.post('/:gameId/auction-buy', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { winnerId, propertyIndex, price } = req.body;
  if (!winnerId || propertyIndex === undefined || price === undefined) return res.status(400).json({ error: 'winnerId, propertyIndex, and price are required' });
  const { state: newState, error } = auctionBuy(state, winnerId, propertyIndex, price);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  return res.json(newState);
});

export default router;
