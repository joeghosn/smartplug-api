import { PrismaClient } from "../../../generated/prisma/index.js";
import type {
  ScheduleResponse,
  EdgeListResponse,
  ScheduleCompilationResponse,
  ScheduleListResponse,
  EdgeEvent,
} from "./types.js";
import type {
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ScheduleListQuery,
  ScheduleRule,
} from "./schemas.js";

const prisma = new PrismaClient();

/**
 * Create a new schedule for a device
 */
export const createSchedule = async (
  data: CreateScheduleRequest
): Promise<ScheduleCompilationResponse> => {
  const startTime = Date.now();

  // Get current device schedule version
  const device = await prisma.device.findUnique({
    where: { id: data.deviceId },
    select: { scheduleVersion: true, timezone: true },
  });

  if (!device) {
    throw new Error("Device not found");
  }

  const newVersion = device.scheduleVersion + 1;

  // Create schedule in transaction
  const result = await prisma.$transaction(async tx => {
    // Create schedule
    const schedule = await tx.schedule.create({
      data: {
        deviceId: data.deviceId,
        version: newVersion,
        timezone: data.timezone,
        rulesJson: data.rules,
      },
    });

    // Compile edge list
    const edgeList = await compileScheduleToEdges(
      data.rules,
      data.timezone,
      data.deviceId,
      newVersion,
      tx
    );

    // Update device schedule version
    await tx.device.update({
      where: { id: data.deviceId },
      data: { scheduleVersion: newVersion },
    });

    return { schedule, edgeList };
  });

  const compilationTime = Date.now() - startTime;

  return {
    success: true,
    schedule: {
      id: result.schedule.id,
      version: result.schedule.version,
      deviceId: result.schedule.deviceId,
    },
    edgeList: {
      id: result.edgeList.id,
      edgeCount: (result.edgeList.edgesJson as EdgeEvent[]).length,
      validUntil: result.edgeList.validUntil.toISOString(),
      generatedAt: result.edgeList.generatedAt.toISOString(),
    },
    stats: {
      compilationTimeMs: compilationTime,
      rulesProcessed: data.rules.length,
      edgesGenerated: (result.edgeList.edgesJson as EdgeEvent[]).length,
    },
  };
};

/**
 * Get schedules with optional filtering
 */
export const getSchedules = async (
  query: ScheduleListQuery
): Promise<ScheduleListResponse> => {
  const where: any = {};

  if (query.deviceId) {
    where.deviceId = query.deviceId;
  }

  if (query.version) {
    where.version = query.version;
  }

  const schedules = await prisma.schedule.findMany({
    where,
    include: {
      device: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [{ deviceId: "asc" }, { version: "desc" }],
  });

  return schedules.map(formatScheduleResponse);
};

/**
 * Get schedule by ID
 */
export const getScheduleById = async (
  scheduleId: string
): Promise<ScheduleResponse | null> => {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: {
      device: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!schedule) return null;

  return formatScheduleResponse(schedule);
};

/**
 * Update schedule
 */
export const updateSchedule = async (
  scheduleId: string,
  data: UpdateScheduleRequest
): Promise<ScheduleCompilationResponse> => {
  const startTime = Date.now();

  // Get existing schedule
  const existingSchedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: { device: true },
  });

  if (!existingSchedule) {
    throw new Error("Schedule not found");
  }

  const newVersion = existingSchedule.device.scheduleVersion + 1;

  // Update in transaction
  const result = await prisma.$transaction(async tx => {
    // Create new schedule version
    const newSchedule = await tx.schedule.create({
      data: {
        deviceId: existingSchedule.deviceId,
        version: newVersion,
        timezone: data.timezone ?? existingSchedule.timezone,
        rulesJson: (data.rules ?? existingSchedule.rulesJson) as any,
      },
    });

    // Compile new edge list
    const rules = (data.rules ?? existingSchedule.rulesJson) as ScheduleRule[];
    const timezone = data.timezone ?? existingSchedule.timezone;

    const edgeList = await compileScheduleToEdges(
      rules,
      timezone,
      existingSchedule.deviceId,
      newVersion,
      tx
    );

    // Update device schedule version
    await tx.device.update({
      where: { id: existingSchedule.deviceId },
      data: { scheduleVersion: newVersion },
    });

    return { schedule: newSchedule, edgeList };
  });

  const compilationTime = Date.now() - startTime;

  return {
    success: true,
    schedule: {
      id: result.schedule.id,
      version: result.schedule.version,
      deviceId: result.schedule.deviceId,
    },
    edgeList: {
      id: result.edgeList.id,
      edgeCount: (result.edgeList.edgesJson as EdgeEvent[]).length,
      validUntil: result.edgeList.validUntil.toISOString(),
      generatedAt: result.edgeList.generatedAt.toISOString(),
    },
    stats: {
      compilationTimeMs: compilationTime,
      rulesProcessed: (result.schedule.rulesJson as ScheduleRule[]).length,
      edgesGenerated: (result.edgeList.edgesJson as EdgeEvent[]).length,
    },
  };
};

/**
 * Delete schedule
 */
export const deleteSchedule = async (scheduleId: string): Promise<void> => {
  await prisma.schedule.delete({
    where: { id: scheduleId },
  });
};

/**
 * Get compiled edge list for device
 */
export const getCompiledEdgeList = async (
  deviceId: string,
  version?: number
): Promise<EdgeListResponse | null> => {
  const where: any = { deviceId };

  if (version) {
    where.scheduleVersion = version;
  }

  const edgeList = await prisma.edgeList.findFirst({
    where,
    orderBy: { scheduleVersion: "desc" },
  });

  if (!edgeList) return null;

  return {
    id: edgeList.id,
    deviceId: edgeList.deviceId,
    scheduleVersion: edgeList.scheduleVersion,
    generatedAt: edgeList.generatedAt,
    validUntil: edgeList.validUntil,
    edges: edgeList.edgesJson as unknown as EdgeEvent[],
  };
};

/**
 * Compile schedule rules to UTC edge events
 */
const compileScheduleToEdges = async (
  rules: ScheduleRule[],
  timezone: string,
  deviceId: string,
  version: number,
  tx: any
) => {
  // Simple compilation - generate edges for next 14 days
  const edges: EdgeEvent[] = [];
  const now = new Date();
  const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

  // Process each rule
  for (const rule of rules) {
    switch (rule.type) {
      case "window":
        edges.push(...compileWindowRule(rule, timezone, now, endDate));
        break;
      case "duration":
        edges.push(...compileDurationRule(rule, timezone, now, endDate));
        break;
      case "countdown":
        edges.push(...compileCountdownRule(rule, now));
        break;
    }
  }

  // Sort edges by timestamp
  edges.sort(
    (a, b) => new Date(a.tsUtc).getTime() - new Date(b.tsUtc).getTime()
  );

  // Create edge list
  const validUntil = new Date(endDate);

  return await tx.edgeList.create({
    data: {
      deviceId,
      scheduleVersion: version,
      validUntil,
      edgesJson: edges,
    },
  });
};

// Simplified compilation functions (would be more complex in production)
const compileWindowRule = (
  _rule: any,
  _timezone: string,
  _start: Date,
  _end: Date
): EdgeEvent[] => {
  const edges: EdgeEvent[] = [];
  // Basic implementation - would use proper timezone library
  // For now, just create some sample edges
  return edges;
};

const compileDurationRule = (
  _rule: any,
  _timezone: string,
  _start: Date,
  _end: Date
): EdgeEvent[] => {
  const edges: EdgeEvent[] = [];
  // Basic implementation
  return edges;
};

const compileCountdownRule = (_rule: any, _now: Date): EdgeEvent[] => {
  const edges: EdgeEvent[] = [];
  // Basic implementation
  return edges;
};

/**
 * Format schedule response
 */
const formatScheduleResponse = (schedule: any): ScheduleResponse => {
  return {
    id: schedule.id,
    deviceId: schedule.deviceId,
    version: schedule.version,
    timezone: schedule.timezone,
    rules: schedule.rulesJson as ScheduleRule[],
    createdAt: schedule.createdAt,
    ...(schedule.device && {
      device: {
        id: schedule.device.id,
        name: schedule.device.name,
      },
    }),
  };
};
