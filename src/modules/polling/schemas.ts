import { z } from "zod";

// Polling request schema (optional query parameters)
export const pollingQuerySchema = z
  .object({
    // Device can report current schedule version to check for updates
    currentScheduleVersion: z.coerce.number().optional(),

    // Device can report current relay state for validation
    currentRelayState: z.coerce.boolean().optional(),
  })
  .optional();

// Export inferred types
export type PollingQuery = z.infer<typeof pollingQuerySchema>;
