import { Router } from "express";
import {
  pollForUpdates,
  sendRelayCommand,
  getConnectivityStatus,
} from "./controllers.js";

const router = Router();

// Main polling endpoint (requires device authentication)
router.get("/next", pollForUpdates);

// Admin relay control endpoints (require admin authentication)
router.post("/devices/:id/relay", sendRelayCommand);
router.get("/devices/:id/connectivity", getConnectivityStatus);

export { router as pollingRoutes };
