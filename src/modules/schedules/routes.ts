import { Router } from "express";
import {
  create,
  list,
  getById,
  update,
  deleteById,
  getCompiledSchedule,
} from "./controllers.js";

const router = Router();

// Schedule CRUD endpoints (require admin auth)
router.post("/schedules", create);
router.get("/schedules", list);
router.get("/schedules/:id", getById);
router.put("/schedules/:id", update);
router.delete("/schedules/:id", deleteById);

// Device schedule endpoints
router.get("/devices/:id/schedule/compiled", getCompiledSchedule);

export { router as scheduleRoutes };
