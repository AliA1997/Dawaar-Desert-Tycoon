import { Router, type IRouter } from "express";
import healthRouter from "./health";
import gameRouter from "./game.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/games", gameRouter);

export default router;
