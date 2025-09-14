// Polling response interface
export interface PollingResponse {
  // Device identification
  deviceId: string;
  timestamp: string; // ISO string

  // Relay command (if any)
  relayCommand?: {
    action: "on" | "off";
    commandId: string; // For tracking/debugging
  };

  // Schedule updates (if any)
  scheduleUpdate?: {
    version: number;
    hasNewSchedule: boolean;
    downloadUrl?: string; // URL to get compiled edge list
  };

  // Configuration updates
  config: {
    pollInterval: number; // seconds
    statusInterval: number; // seconds
  };

  // Server status
  serverTime: string; // ISO string for time sync
}
