// Device response interface
export interface DeviceResponse {
  id: string;
  name: string;
  chipId: string;
  timezone: string | null;
  lastSeenAt: Date | null;
  lastStatusAt: Date | null;
  scheduleVersion: number;
  isOnline: boolean;
  lastStatus?: {
    relayState: boolean;
    wifiSignal?: number;
    uptime?: number;
    freeHeap?: number;
    temperature?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceRegistrationResponse {
  success: true;
  device: {
    id: string;
    name: string;
    chipId: string;
    timezone: string | null;
    scheduleVersion: number;
  };
  token: string;
  config: {
    pollInterval: number;
    statusInterval: number;
  };
}

export type DeviceListResponse = DeviceResponse[];
