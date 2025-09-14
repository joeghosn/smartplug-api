import type { Request, Response } from "express";
import {
  registerDevice,
  updateDeviceStatus,
  listDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
} from "./services.js";
import {
  deviceRegisterSchema,
  deviceStatusSchema,
  deviceUpdateSchema,
  deviceListQuerySchema,
  type DeviceRegisterRequest,
  type DeviceStatusRequest,
  type DeviceUpdateRequest,
  type DeviceListQuery,
} from "./schemas.js";

/**
 * POST /devices/register
 * Register a new device
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const data: DeviceRegisterRequest = deviceRegisterSchema.parse(req.body);
  const result = await registerDevice(data);
  res.status(201).json(result);
};

/**
 * POST /devices/:id/status
 * Update device status
 */
export const updateStatus = async (
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

    const status: DeviceStatusRequest = deviceStatusSchema.parse(req.body);

    await updateDeviceStatus(deviceId, status);

    res.json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /devices
 * List all devices (admin)
 */
export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: DeviceListQuery = deviceListQuerySchema.parse(req.query);
    const result = await listDevices(query);
    res.json(result);
  } catch (error) {
    throw error;
  }
};

/**
 * GET /devices/:id
 * Get device by ID
 */
export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const deviceId = req.params.id;
    if (!deviceId) {
      res.status(400).json({
        error: "Bad Request",
        message: "Device ID is required",
      });
      return;
    }

    const device = await getDeviceById(deviceId);

    if (!device) {
      res.status(404).json({
        error: "Not Found",
        message: "Device not found",
      });
      return;
    }

    res.json(device);
  } catch (error) {
    throw error;
  }
};

/**
 * PUT /devices/:id
 * Update device settings (admin)
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const deviceId = req.params.id;
    if (!deviceId) {
      res.status(400).json({
        error: "Bad Request",
        message: "Device ID is required",
      });
      return;
    }

    const data: DeviceUpdateRequest = deviceUpdateSchema.parse(req.body);

    const device = await updateDevice(deviceId, data);
    res.json(device);
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE /devices/:id
 * Delete device (admin)
 */
export const deleteDeviceById = async (
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

    await deleteDevice(deviceId);

    res.json({
      success: true,
      message: "Device deleted successfully",
    });
  } catch (error) {
    throw error;
  }
};
