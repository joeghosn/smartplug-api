import { z } from "zod";

export const setRelayBody = z.object({
  on: z.boolean(),
});
export type SetRelayBody = z.infer<typeof setRelayBody>;
