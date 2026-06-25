import { Router, type IRouter } from 'express';
import { chooseTax } from '../domains/economy/tax.js';
import { claimAdReward } from '../domains/economy/reward.js';
import { getGame, setGame } from '../domains/services/gameStore.js';

const router: IRouter = Router();

// POST /api/games/:gameId/choose-tax — flat or percent
router.post('/:gameId/choose-tax', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { playerId, choice } = req.body;
  if (!playerId || !choice) return res.status(400).json({ error: 'playerId and choice are required' });
  if (choice !== 'flat' && choice !== 'percent') return res.status(400).json({ error: 'choice must be flat or percent' });
  const { state: newState, error } = chooseTax(state, playerId, choice);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  return res.json(newState);
});

// POST /api/games/:gameId/reward — claim ad-watch reward (1,500 Dawaar Dollars)
router.post('/:gameId/reward', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { playerId } = req.body;
  if (!playerId) return res.status(400).json({ error: 'playerId is required' });
  const { state: newState, error } = claimAdReward(state, playerId);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  return res.json(newState);
});

export default router;
