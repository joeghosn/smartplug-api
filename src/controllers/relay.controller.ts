import type { Request, Response } from "express";
import type { RelayResponseDTO } from "../core/types";
import { setRelay } from "../services/relay.service";

export async function relayHandler(
  req: Request,
  res: Response<RelayResponseDTO>
) {
  const result = await setRelay(req.body);
  res.json(result);
}
