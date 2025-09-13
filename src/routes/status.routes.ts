import { Router } from "express";
import { asyncHandler } from "../core/asyncHandler";
import { statusHandler } from "../controllers/status.controller";

export const statusRouter = Router();
statusRouter.get("/status", asyncHandler(statusHandler));
