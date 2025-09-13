import type { StatusDTO } from "../core/types";

export async function getStatus(): Promise<StatusDTO> {
  return {
    power: 100,
    voltage: 200,
    current: 0.5,
    relayOn: true,
    kwhTotal: 1,
    ts: Date.now(),
  };
}
