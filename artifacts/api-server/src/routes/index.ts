import { Router, type IRouter } from 'express';
import healthRouter from './health.js';
import gamesRouter from './games.js';
import turnsRouter from './turns.js';
import diceRouter from './dice.js';
import propertiesRouter from './properties.js';
import tradingRouter from './trading.js';
import economyRouter from './economy.js';
import playersRouter from './players.js';

const router: IRouter = Router();

router.use(healthRouter);

// All game routers share the `/games` prefix; each one defines its own
// `/:gameId/<action>` sub-paths to keep handlers thin and per-domain.
router.use('/games', gamesRouter);
router.use('/games', turnsRouter);
router.use('/games', diceRouter);
router.use('/games', propertiesRouter);
router.use('/games', tradingRouter);
router.use('/games', economyRouter);

router.use('/players', playersRouter);

// Anything under /api that matched no route above. Without this, Express answers
// a typo'd path with an HTML error page; the client calls `res.json()` on it,
// the parse throws, and its generic catch retries forever with backoff — so a
// permanently wrong URL reports as "reconnecting" instead of as a 404.
router.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.baseUrl}${req.path}` });
});

export default router;
