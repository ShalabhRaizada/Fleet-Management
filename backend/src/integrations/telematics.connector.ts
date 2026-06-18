/**
 * MOCK / P3-DEFERRED INTEGRATION CONNECTOR
 * =========================================
 * Real-time telematics / GPS / AIS-140 device feeds (odometer, location,
 * accessory health pings - AC-010/AC-011/AC-012/AC-013, P1 screens that
 * *display* health but the live device feed itself is P3 infra) are mocked
 * here. No real device/API integration is implemented.
 */

export interface TelematicsConnector {
  getLatestOdometer(vehicleId: string): Promise<{ vehicleId: string; odometerKm: number; capturedAt: string }>;
  getDeviceHealth(deviceImei: string): Promise<{ imei: string; online: boolean; batteryPct: number; lastPingAt: string }>;
}

/** MOCK implementation - canned data only. */
export const mockTelematicsConnector: TelematicsConnector = {
  async getLatestOdometer(vehicleId: string) {
    return {
      vehicleId,
      odometerKm: Math.round(50000 + Math.random() * 100000),
      capturedAt: new Date().toISOString(),
    };
  },
  async getDeviceHealth(deviceImei: string) {
    return {
      imei: deviceImei,
      online: true,
      batteryPct: 85,
      lastPingAt: new Date().toISOString(),
    };
  },
};
