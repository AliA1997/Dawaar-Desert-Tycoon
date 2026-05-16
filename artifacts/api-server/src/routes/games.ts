import { Router, type IRouter } from 'express';
import { createGame } from '../domains/turns/lifecycle.js';
import { getGame, setGame, generateGameId } from '../domains/services/gameStore.js';

const router: IRouter = Router();

// POST /api/games — create a new game
router.post('/', (req, res) => {
  const { playerName, playerId, token, boardId } = req.body;
  if (!playerName || !playerId || !token) {
    return res.status(400).json({ error: 'playerName, playerId, and token are required' });
  }
  let gameId = generateGameId();
  while (getGame(gameId)) gameId = generateGameId();

  const state = createGame(gameId, playerName, playerId, token, boardId ?? undefined);
  setGame(gameId, state);
  return res.status(201).json({ gameId: state.gameId, status: state.status, players: state.players });
});

// GET /api/games/:gameId — get game state
router.get('/:gameId', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  return res.json(state);
});

export default router;
