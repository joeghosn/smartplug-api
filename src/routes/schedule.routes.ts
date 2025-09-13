import { Router } from "express";
import { asyncHandler } from "../core/asyncHandler";
import {
  getScheduleHandler,
  saveScheduleHandler,
} from "../controllers/schedule.controller";
import { validate } from "../middlewares/validate";
import { scheduleBody } from "../schemas/schedule.schema";

export const scheduleRouter = Router();

scheduleRouter.get("/schedule", asyncHandler(getScheduleHandler));
scheduleRouter.post(
  "/schedule",
  validate.body(scheduleBody, "body"),
  asyncHandler(saveScheduleHandler)
);
