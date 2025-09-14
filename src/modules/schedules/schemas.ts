import { z } from "zod";

// Schedule rule types
const windowRuleSchema = z.object({
  type: z.literal("window"),
  name: z.string().nonempty().max(100),
  days: z.array(z.number().min(0).max(6)), // 0=Sunday, 6=Saturday
  startTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  action: z.enum(["on", "off"]),
});

const durationRuleSchema = z.object({
  type: z.literal("duration"),
  name: z.string().nonempty().max(100),
  startTime: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  durationMinutes: z.number().min(1).max(1440), // 1 minute to 24 hours
  days: z.array(z.number().min(0).max(6)),
  action: z.enum(["on", "off"]),
});

const countdownRuleSchema = z.object({
  type: z.literal("countdown"),
  name: z.string().nonempty().max(100),
  triggerAfterMinutes: z.number().min(1).max(10080), // 1 minute to 7 days
  action: z.enum(["on", "off"]),
  oneTime: z.boolean().default(true),
});

// Union of all rule types
const scheduleRuleSchema = z.discriminatedUnion("type", [
  windowRuleSchema,
  durationRuleSchema,
  countdownRuleSchema,
]);

// Create schedule schema
export const createScheduleSchema = z.object({
  deviceId: z.string().nonempty("Device ID is required"),
  timezone: z.string().nonempty("Timezone is required"),
  rules: z
    .array(scheduleRuleSchema)
    .min(1, "At least one rule is required")
    .max(50),
});

// Update schedule schema
export const updateScheduleSchema = z.object({
  timezone: z.string().nonempty().optional(),
  rules: z.array(scheduleRuleSchema).min(1).max(50).optional(),
});

// Query schema
export const scheduleListQuerySchema = z.object({
  deviceId: z.string().optional(),
  version: z.coerce.number().optional(),
});

// Export inferred types
export type ScheduleRule = z.infer<typeof scheduleRuleSchema>;
export type WindowRule = z.infer<typeof windowRuleSchema>;
export type DurationRule = z.infer<typeof durationRuleSchema>;
export type CountdownRule = z.infer<typeof countdownRuleSchema>;
export type CreateScheduleRequest = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleRequest = z.infer<typeof updateScheduleSchema>;
export type ScheduleListQuery = z.infer<typeof scheduleListQuerySchema>;
