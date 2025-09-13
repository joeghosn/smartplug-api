import type { ScheduleBody } from "../schemas/schedule.schema";
import type { ScheduleDTO } from "../core/types";

let schedule: ScheduleDTO = {
  rules: [
    { id: "r1", days: [1, 2, 3, 4, 5], start: "22:00", end: "06:00" }, // example
  ],
};

export async function getSchedule(): Promise<ScheduleDTO> {
  return schedule;
}

export async function saveSchedule(body: ScheduleBody): Promise<ScheduleDTO> {
  // naive overlap check (MVP): same day & exact same time range
  const seen = new Set<string>();
  for (const r of body.rules) {
    for (const d of r.days) {
      const key = `${d}-${r.start}-${r.end}`;
      if (seen.has(key)) throw new Error("Duplicate rule windows detected");
      seen.add(key);
    }
  }
  schedule = body; // replace all for MVP
  return schedule;
}
