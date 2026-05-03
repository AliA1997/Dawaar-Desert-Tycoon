import { Router, type IRouter } from 'express';
import { getPlayerProfile, awardReward } from '../game/playerStore.js';

const router: IRouter = Router();

// GET /api/players/:id/profile
router.get('/:id/profile', (req, res) => {
  const profile = getPlayerProfile(req.params.id);
  res.json(profile);
});

// POST /api/players/:id/reward { points, challengeId? }
router.post('/:id/reward', (req, res) => {
  const { points, challengeId } = req.body ?? {};
  if (typeof points !== 'number' || points <= 0) {
    return res.status(400).json({ error: 'points must be a positive number' });
  }
  if (points > 10000) {
    return res.status(400).json({ error: 'points exceeds maximum allowed' });
  }
  const profile = awardReward(req.params.id, points, challengeId);
  res.json(profile);
});

export default router;
