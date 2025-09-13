import { z } from "zod";

const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;

export const scheduleRule = z.object({
  id: z.string().min(1),
  days: z.array(z.number().int().min(0).max(6)).min(1),
  start: z.string().regex(timeRe, "HH:MM 24h"),
  end: z.string().regex(timeRe, "HH:MM 24h"),
});

export const scheduleBody = z.object({
  rules: z.array(scheduleRule).max(32),
});

export type ScheduleBody = z.infer<typeof scheduleBody>;
