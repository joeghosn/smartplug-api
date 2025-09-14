import type { Request, Response } from "express";
import {
  createSchedule,
  getSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getCompiledEdgeList,
} from "./services.js";
import {
  createScheduleSchema,
  updateScheduleSchema,
  scheduleListQuerySchema,
  type CreateScheduleRequest,
  type UpdateScheduleRequest,
  type ScheduleListQuery,
} from "./schemas.js";

/**
 * POST /schedules
 * Create a new schedule
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateScheduleRequest = createScheduleSchema.parse(req.body);
    const result = await createSchedule(data);
    res.status(201).json(result);
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
 * GET /schedules
 * List schedules with optional filtering
 */
export const list = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: ScheduleListQuery = scheduleListQuerySchema.parse(req.query);
    const schedules = await getSchedules(query);
    res.json(schedules);
  } catch (error) {
    throw error;
  }
};

/**
 * GET /schedules/:id
 * Get schedule by ID
 */
export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const scheduleId = req.params.id;
    if (!scheduleId) {
      res.status(400).json({
        error: "Bad Request",
        message: "Schedule ID is required",
      });
      return;
    }

    const schedule = await getScheduleById(scheduleId);

    if (!schedule) {
      res.status(404).json({
        error: "Not Found",
        message: "Schedule not found",
      });
      return;
    }

    res.json(schedule);
  } catch (error) {
    throw error;
  }
};

/**
 * PUT /schedules/:id
 * Update schedule
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const scheduleId = req.params.id;
    if (!scheduleId) {
      res.status(400).json({
        error: "Bad Request",
        message: "Schedule ID is required",
      });
      return;
    }

    const data: UpdateScheduleRequest = updateScheduleSchema.parse(req.body);
    const result = await updateSchedule(scheduleId, data);
    res.json(result);
  } catch (error: any) {
    if (error.message === "Schedule not found") {
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
 * DELETE /schedules/:id
 * Delete schedule
 */
export const deleteById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const scheduleId = req.params.id;
    if (!scheduleId) {
      res.status(400).json({
        error: "Bad Request",
        message: "Schedule ID is required",
      });
      return;
    }

    await deleteSchedule(scheduleId);

    res.json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error: any) {
    if (error.message.includes("Record to delete does not exist")) {
      res.status(404).json({
        error: "Not Found",
        message: "Schedule not found",
      });
      return;
    }
    throw error;
  }
};

/**
 * GET /devices/:id/schedule/compiled
 * Get compiled edge list for device
 */
export const getCompiledSchedule = async (
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

    const version = req.query.version ? Number(req.query.version) : undefined;
    const edgeList = await getCompiledEdgeList(deviceId, version);

    if (!edgeList) {
      res.status(404).json({
        error: "Not Found",
        message: "No compiled schedule found for device",
      });
      return;
    }

    res.json(edgeList);
  } catch (error) {
    throw error;
  }
};
