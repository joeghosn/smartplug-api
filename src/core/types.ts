export type StatusDTO = {
  power: number;
  voltage: number;
  current: number;
  relayOn: boolean;
  kwhTotal: number;
  ts: number;
};

export type RelaySetDTO = { on: boolean };
export type RelayResponseDTO = { ok: boolean; relayOn: boolean };

export type ScheduleRule = {
  id: string;
  days: number[];
  start: string;
  end: string;
};
export type ScheduleDTO = { rules: ScheduleRule[] };
