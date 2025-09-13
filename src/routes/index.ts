import { Router } from "express";
import { statusRouter } from "./status.routes";
import { relayRouter } from "./relay.routes";
import { scheduleRouter } from "./schedule.routes";

export const apiRouter = Router();
apiRouter.use(statusRouter);
apiRouter.use(relayRouter);
apiRouter.use(scheduleRouter);
