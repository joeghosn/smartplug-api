import type { SetRelayBody } from "../schemas/relay.schema";
import type { RelayResponseDTO } from "../core/types";

// In-memory relay state (would be replaced with actual device communication)
let relayOn = false;

export async function setRelay(data: SetRelayBody): Promise<RelayResponseDTO> {
  relayOn = data.on;
  return { ok: true, relayOn: data.on };
}

export async function getRelay(): Promise<boolean> {
  return relayOn;
}
