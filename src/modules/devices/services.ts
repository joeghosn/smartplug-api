import { PrismaClient } from "../../../generated/prisma/index.js";
import crypto from "crypto";
import type {
  DeviceResponse,
  DeviceRegistrationResponse,
  DeviceListResponse,
} from "./types.js";
import type {
  DeviceRegisterRequest,
  DeviceStatusRequest,
  DeviceUpdateRequest,
  DeviceListQuery,
} from "./schemas.js";

const prisma = new PrismaClient();

/**
 * Format device response with computed fields
 */
const formatDeviceResponse = (device: any): DeviceResponse => {
  const now = new Date();
  const lastSeen = device.lastSeenAt;
  const isOnline = lastSeen
    ? now.getTime() - lastSeen.getTime() < 5 * 60 * 1000
    : false; // 5 minutes

  return {
    id: device.id,
    name: device.name,
    chipId: device.chipId,
    timezone: device.timezone,
    lastSeenAt: device.lastSeenAt,
    lastStatusAt: device.lastStatusAt,
    scheduleVersion: device.scheduleVersion,
    isOnline,
    lastStatus: device.lastStatusJson || undefined,
    createdAt: device.createdAt,
    updatedAt: device.updatedAt,
  };
};

export const registerDevice = async (
  data: DeviceRegisterRequest
): Promise<DeviceRegistrationResponse> => {
  const existingDevice = await prisma.device.findFirst({
    where: { chipId: data.chipId },
  });

  if (existingDevice) {
    throw new Error(`Device with chip ID ${data.chipId} already registered`);
  }

  // Generate secure API token
  const token = crypto.randomBytes(32).toString("hex");
  const apiTokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const device = await prisma.device.create({
    data: {
      name: data.name,
      chipId: data.chipId,
      apiTokenHash,
      timezone: data.timezone || "UTC",
      scheduleVersion: 0,
    },
    select: {
      id: true,
      name: true,
      chipId: true,
      timezone: true,
      scheduleVersion: true,
    },
  });

  return {
    success: true,
    device,
    token,
    config: {
      pollInterval: 30,
      statusInterval: 300,
    },
  };
};

export const updateDeviceStatus = async (
  deviceId: string,
  status: DeviceStatusRequest
): Promise<void> => {
  await prisma.device.update({
    where: { id: deviceId },
    data: {
      lastSeenAt: new Date(),
      lastStatusAt: new Date(),
      lastStatusJson: status,
    },
  });
};

/**
 * Get device by ID
 */
export const getDeviceById = async (
  deviceId: string
): Promise<DeviceResponse | null> => {
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
  });

  if (!device) return null;

  return formatDeviceResponse(device);
};

/**
 * Get device by chip ID
 */
export const getDeviceByChipId = async (
  chipId: string
): Promise<DeviceResponse | null> => {
  const device = await prisma.device.findFirst({
    where: { chipId },
  });

  if (!device) return null;

  return formatDeviceResponse(device);
};

/**
 * List all devices
 */
export const listDevices = async (
  query: DeviceListQuery
): Promise<DeviceListResponse> => {
  const { search } = query;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { chipId: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const devices = await prisma.device.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return devices.map(formatDeviceResponse);
};

/**
 * Update device settings
 */
export const updateDevice = async (
  deviceId: string,
  data: DeviceUpdateRequest
): Promise<DeviceResponse> => {
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.timezone !== undefined) updateData.timezone = data.timezone;

  const device = await prisma.device.update({
    where: { id: deviceId },
    data: updateData,
  });

  return formatDeviceResponse(device);
};

/**
 * Delete device
 */
export const deleteDevice = async (deviceId: string): Promise<void> => {
  await prisma.device.delete({
    where: { id: deviceId },
  });
};
