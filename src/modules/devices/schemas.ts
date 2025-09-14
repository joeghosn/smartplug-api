import { z } from "zod";

export const deviceRegisterSchema = z.object({
  chipId: z.string().nonempty("Chip ID is required").max(32),
  name: z.string().nonempty("Device name is required").max(255),
  timezone: z.string().optional().default("UTC"),
});

export const deviceStatusSchema = z.object({
  relayState: z.boolean(),
  wifiSignal: z.number().min(-100).max(0).optional(),
  uptime: z.number().min(0).optional(),
  freeHeap: z.number().min(0).optional(),
  temperature: z.number().optional(),
});

export const deviceUpdateSchema = z.object({
  name: z.string().nonempty().max(255).optional(),
  timezone: z.string().optional(),
});

export const deviceListQuerySchema = z.object({
  search: z.string().optional(),
});

export type DeviceRegisterRequest = z.infer<typeof deviceRegisterSchema>;
export type DeviceStatusRequest = z.infer<typeof deviceStatusSchema>;
export type DeviceUpdateRequest = z.infer<typeof deviceUpdateSchema>;
export type DeviceListQuery = z.infer<typeof deviceListQuerySchema>;
