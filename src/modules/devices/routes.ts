import { Router } from "express";
import {
  register,
  updateStatus,
  list,
  getById,
  update,
  deleteDeviceById,
} from "./controllers.js";

const router = Router();

// Device registration (public)
router.post("/register", register);

// Device status update (requires device auth)
router.post("/:id/status", updateStatus);

// Admin endpoints (require admin auth)
router.get("/", list);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", deleteDeviceById);

export { router as deviceRoutes };
