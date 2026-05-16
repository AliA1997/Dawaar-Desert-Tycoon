import { Router, type IRouter } from 'express';
import { proposeTrade, acceptTrade, declineTrade } from '../domains/trading/trade.js';
import { getGame, setGame } from '../domains/services/gameStore.js';

const router: IRouter = Router();

// POST /api/games/:gameId/trade
router.post('/:gameId/trade', (req, res) => {
  const state = getGame(req.params.gameId);
  if (!state) return res.status(404).json({ error: 'Game not found' });
  const { fromPlayerId, toPlayerId, offeredPropertyIndices, requestedPropertyIndices, offeredMoney, requestedMoney, accept, decline } = req.body;

  if (decline) {
    const { state: newState, error } = declineTrade(state, toPlayerId || fromPlayerId);
    if (error) return res.status(400).json({ error });
    setGame(req.params.gameId, newState);
    return res.json(newState);
  }

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
  return res.json(newState);
});

export default router;
