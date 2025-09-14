import { PrismaClient } from "../../../generated/prisma/index.js";
import crypto from "crypto";
import type { PollingResponse } from "./types.js";
import type { PollingQuery } from "./schemas.js";

const prisma = new PrismaClient();

/**
 * Handle device polling request
 * This is the core function that ESP32 devices call every 30 seconds
 */
export const handleDevicePolling = async (
  deviceId: string,
  query: PollingQuery = {}
): Promise<PollingResponse> => {
  const now = new Date();

  // Get device with pending commands
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    select: {
      id: true,
      name: true,
      scheduleVersion: true,
      pendingRelayOn: true,
      timezone: true,
    },
  });

  if (!device) {
    throw new Error("Device not found");
  }

  // Generate unique command ID for tracking
  const commandId = crypto.randomBytes(8).toString("hex");

  // Check for pending relay commands
  let relayCommand: PollingResponse["relayCommand"];
  if (device.pendingRelayOn !== null) {
    relayCommand = {
      action: device.pendingRelayOn ? "on" : "off",
      commandId,
    };
  }

  // Check for schedule updates
  let scheduleUpdate: PollingResponse["scheduleUpdate"];
  const currentVersion = query?.currentScheduleVersion ?? 0;
  if (device.scheduleVersion > currentVersion) {
    scheduleUpdate = {
      version: device.scheduleVersion,
      hasNewSchedule: true,
      downloadUrl: `/devices/${deviceId}/schedule/compiled`, // URL to get edge list
    };
  }

  // Update device last seen timestamp
  await prisma.device.update({
    where: { id: deviceId },
    data: {
      lastSeenAt: now,
      // Clear pending relay command after sending it
      ...(relayCommand && { pendingRelayOn: null }),
    },
  });

  // Build response
  const response: PollingResponse = {
    deviceId: device.id,
    timestamp: now.toISOString(),
    serverTime: now.toISOString(),
    config: {
      pollInterval: 30, // Poll every 30 seconds
      statusInterval: 300, // Send status every 5 minutes
    },
    ...(relayCommand && { relayCommand }),
    ...(scheduleUpdate && { scheduleUpdate }),
  };

  return response;
};

/**
 * Set pending relay command for device
 * Called by admin/schedule system to queue commands
 */
export const setPendingRelayCommand = async (
  deviceId: string,
  relayOn: boolean
): Promise<void> => {
  await prisma.device.update({
    where: { id: deviceId },
    data: { pendingRelayOn: relayOn },
  });
};

/**
 * Get device connectivity status
 */
export const getDeviceConnectivity = async (deviceId: string) => {
  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    select: {
      id: true,
      name: true,
      lastSeenAt: true,
      lastStatusAt: true,
    },
  });

  if (!device) {
    throw new Error("Device not found");
  }

  const now = new Date();
  const lastSeen = device.lastSeenAt;

  // Device is considered online if seen within last 2 minutes (4 poll cycles)
  const isOnline = lastSeen
    ? now.getTime() - lastSeen.getTime() < 2 * 60 * 1000
    : false;

  // Device is considered stale if not seen within last 5 minutes
  const isStale = lastSeen
    ? now.getTime() - lastSeen.getTime() > 5 * 60 * 1000
    : true;

  return {
    ...device,
    isOnline,
    isStale,
    lastSeenAgo: lastSeen
      ? Math.floor((now.getTime() - lastSeen.getTime()) / 1000)
      : null,
  };
};
