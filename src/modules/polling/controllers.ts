import type { Request, Response } from "express";
import {
  handleDevicePolling,
  setPendingRelayCommand,
  getDeviceConnectivity,
} from "./services.js";
import { pollingQuerySchema, type PollingQuery } from "./schemas.js";

/**
 * GET /next
 * Main polling endpoint for ESP32 devices
 * Requires device authentication
 */
export const pollForUpdates = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // This endpoint requires device authentication middleware
    // req.device should be populated by deviceAuth middleware
    const device = (req as any).device;
    if (!device) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Device authentication required",
      });
      return;
    }

    // Parse query parameters
    const query: PollingQuery = pollingQuerySchema.parse(req.query);

    // Handle polling logic
    const response = await handleDevicePolling(device.id, query);

    res.json(response);
  } catch (error: any) {
    if (error.message === "Device not found") {
      res.status(404).json({
        error: "Not Found",
        message: error.message,
      });
      return;
    }
    throw error;
  }
};

/**
 * POST /devices/:id/relay
 * Admin endpoint to send relay commands to device
 * Requires admin authentication
 */
export const sendRelayCommand = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deviceId = req.params.id;
    if (!deviceId) {
      res.status(400).json({
        error: "Bad Request",
        message: "Device ID is required",
      });
      return;
    }

    const { action } = req.body;
    if (!action || (action !== "on" && action !== "off")) {
      res.status(400).json({
        error: "Bad Request",
        message: "Action must be 'on' or 'off'",
      });
      return;
    }

    const relayOn = action === "on";
    await setPendingRelayCommand(deviceId, relayOn);

    res.json({
      success: true,
      message: `Relay command '${action}' queued for device`,
      command: {
        deviceId,
        action,
        queuedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    if (error.message === "Device not found") {
      res.status(404).json({
        error: "Not Found",
        message: error.message,
      });
      return;
    }
    throw error;
  }
};

/**
 * GET /devices/:id/connectivity
 * Get device connectivity status
 */
export const getConnectivityStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deviceId = req.params.id;
    if (!deviceId) {
      res.status(400).json({
        error: "Bad Request",
        message: "Device ID is required",
      });
      return;
    }

    const status = await getDeviceConnectivity(deviceId);
    res.json(status);
  } catch (error: any) {
    if (error.message === "Device not found") {
      res.status(404).json({
        error: "Not Found",
        message: error.message,
      });
      return;
    }
    throw error;
  }
};
