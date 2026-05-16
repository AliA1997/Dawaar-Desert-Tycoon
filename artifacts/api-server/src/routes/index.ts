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

export default router;
