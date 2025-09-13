import type { Request, Response } from "express";
import { getSchedule, saveSchedule } from "../services/schedule.service";
import type { ScheduleDTO } from "../core/types";

export async function getScheduleHandler(
  _req: Request,
  res: Response<ScheduleDTO>
) {
  res.json(await getSchedule());
}

export async function saveScheduleHandler(
  req: Request,
  res: Response<ScheduleDTO>
) {
  const saved = await saveSchedule(req.body);
  res.json(saved);
}
