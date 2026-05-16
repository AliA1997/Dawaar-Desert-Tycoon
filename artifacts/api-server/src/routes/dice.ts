import { Router, type IRouter } from 'express';
import { rollDice } from '../domains/dice/roll.js';
import { getGame, setGame } from '../domains/services/gameStore.js';

const router: IRouter = Router();

// POST /api/games/:gameId/roll
router.post('/:gameId/roll', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { playerId } = req.body;
  if (!playerId) return res.status(400).json({ error: 'playerId is required' });
  const { state: newState, dice, isDoubles, error } = rollDice(state, playerId);
  if (error) return res.status(400).json({ error });
  setGame(req.params.gameId, newState);
  return res.json({ dice, isDoubles, gameState: newState });
});

export default router;
