import type { Request, Response } from "express";
import { getStatus } from "../services/status.service";
import type { StatusDTO } from "../core/types";

export async function statusHandler(_req: Request, res: Response<StatusDTO>) {
  const data = await getStatus();
  res.json(data);
}
