import type { ScheduleRule } from "./schemas.js";

// Schedule response interface
export interface ScheduleResponse {
  id: string;
  deviceId: string;
  version: number;
  timezone: string;
  rules: ScheduleRule[];
  createdAt: Date;
  device?: {
    id: string;
    name: string;
  };
}

// Edge list response interface
export interface EdgeListResponse {
  id: string;
  deviceId: string;
  scheduleVersion: number;
  generatedAt: Date;
  validUntil: Date;
  edges: EdgeEvent[];
}

// Individual edge event
export interface EdgeEvent {
  tsUtc: string; // ISO timestamp in UTC
  on: boolean; // true = turn on, false = turn off
  ruleName?: string; // Which rule triggered this edge
}

// Schedule compilation response
export interface ScheduleCompilationResponse {
  success: true;
  schedule: {
    id: string;
    version: number;
    deviceId: string;
  };
  edgeList: {
    id: string;
    edgeCount: number;
    validUntil: string;
    generatedAt: string;
  };
  stats: {
    compilationTimeMs: number;
    rulesProcessed: number;
    edgesGenerated: number;
  };
}

// Simple list response
export type ScheduleListResponse = ScheduleResponse[];
