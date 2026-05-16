import { Router, type IRouter } from 'express';
import { getProfile, addRewardPoints, setRewardPoints } from '../domains/players/profileStore.js';

const router: IRouter = Router();

// GET /api/players/:playerId/profile
router.get('/:playerId/profile', (req, res): void => {
  if (!req.params.playerId) {
    res.status(400).json({ error: 'playerId is required' });
    return;
  }
  res.json(getProfile(req.params.playerId));
});

// POST /api/players/:playerId/reward
// body: { points: number, set?: boolean }
router.post('/:playerId/reward', (req, res): void => {
  const { points, set } = req.body ?? {};
  if (typeof points !== 'number' || Number.isNaN(points)) {
    res.status(400).json({ error: 'points (number) is required' });
    return;
  }
  const profile = set
    ? setRewardPoints(req.params.playerId, points)
    : addRewardPoints(req.params.playerId, points);
  res.json(profile);
});

export default router;
