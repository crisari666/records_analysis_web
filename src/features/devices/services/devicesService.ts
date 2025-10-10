import Api from '../../../app/http'
import type { CallerDevice, CreateCallerDeviceRequest, UpdateCallerDeviceRequest } from '../types';

const API_ENDPOINTS = {
  CALLER_DEVICES: '/caller-devices',
  CALLER_DEVICE_BY_ID: (id: string) => `/caller-devices/${id}`,
  CALLER_DEVICE_BY_IMEI: (imei: string) => `/caller-devices/imei/${imei}`,
} as const;

const api = new Api();

export const devicesService = {
  // Get all active caller devices
  async getAllDevices(): Promise<CallerDevice[]> {
    const response = await api.get({ path: API_ENDPOINTS.CALLER_DEVICES });
    return response;
  },

  // Get a specific caller device by ID
  async getDeviceById(id: string): Promise<CallerDevice> {
    const response = await api.get({ path: API_ENDPOINTS.CALLER_DEVICE_BY_ID(id) });
    return response;
  },

  // Get a specific caller device by IMEI
  async getDeviceByImei(imei: string): Promise<CallerDevice> {
    const response = await api.get({ path: API_ENDPOINTS.CALLER_DEVICE_BY_IMEI(imei) });
    return response;
  },

  // Create a new caller device
  async createDevice(deviceData: CreateCallerDeviceRequest): Promise<CallerDevice> {
    const response = await api.post({ path: API_ENDPOINTS.CALLER_DEVICES, data: deviceData });
    return response;
  },

  // Update a specific caller device
  async updateDevice(id: string, deviceData: UpdateCallerDeviceRequest): Promise<CallerDevice> {
    const response = await api.patch({ path: API_ENDPOINTS.CALLER_DEVICE_BY_ID(id), data: deviceData });
    return response;
  },

  // Soft delete a caller device
  async deleteDevice(id: string): Promise<void> {
    await api.delete({ path: API_ENDPOINTS.CALLER_DEVICE_BY_ID(id) });
  },
};
