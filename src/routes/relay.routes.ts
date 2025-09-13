import { Router } from "express";
import { asyncHandler } from "../core/asyncHandler";
import { relayHandler } from "../controllers/relay.controller";
import { validate } from "../middlewares/validate";
import { setRelayBody } from "../schemas/relay.schema";

export const relayRouter = Router();

relayRouter.post(
  "/relay",
  validate.body(setRelayBody),
  asyncHandler(relayHandler)
);
