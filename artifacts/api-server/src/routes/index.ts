import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gameRouter from "./game.js";
import playersRouter from "./players.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/games", gameRouter);
router.use("/players", playersRouter);

export default router;
