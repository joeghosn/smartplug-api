import { DeviceConfig } from "../core/types";
import { DeviceError, TimeoutError } from "../core/errors";
import { logger } from "../core/logger";
import { config } from "../core/env";

export class DeviceClient {
  private baseUrl: string;
  private timeout: number;

  constructor(deviceConfig?: DeviceConfig) {
    this.baseUrl = deviceConfig?.baseUrl || config.device.baseUrl;
    this.timeout = deviceConfig?.timeout || config.device.timeout;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>("GET", endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>("POST", endpoint, data);
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    logger.debug(`Device ${method} request`, { url, data });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new DeviceError(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      logger.debug(`Device ${method} response`, { url, result });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new TimeoutError(
            `Device request timed out after ${this.timeout}ms`
          );
        }
        throw new DeviceError(error.message);
      }
      throw new DeviceError("Unknown device communication error");
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.get("/status");
      return true;
    } catch (error) {
      logger.warn("Device connection test failed", error);
      return false;
    }
  }
}
