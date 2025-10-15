import type { PayloadAction } from '@reduxjs/toolkit';
import { createAppSlice } from '../../../app/createAppSlice';
import { DevicesState, CallerDevice, CreateCallerDeviceRequest, UpdateCallerDeviceRequest } from '../types';
import { devicesService } from '../services/devicesService';

const initialState: DevicesState = {
  devices: [],
  loading: false,
  error: null,
  selectedDevice: null,
};

export const devicesSlice = createAppSlice({
  name: 'devices',
  initialState,
  reducers: create => ({
    clearError: create.reducer(state => {
      state.error = null;
    }),
    setSelectedDevice: create.reducer((state, action: PayloadAction<CallerDevice | null>) => {
      state.selectedDevice = action.payload;
    }),
    fetchDevicesAsync: create.asyncThunk(
      async () => await devicesService.getAllDevices(),
      {
        pending: state => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.devices = action.payload;
          state.error = null;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Failed to fetch devices';
        },
      }
    ),
    createDeviceAsync: create.asyncThunk(
      async (deviceData: CreateCallerDeviceRequest) => await devicesService.createDevice(deviceData),
      {
        pending: state => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.devices.push(action.payload);
          state.error = null;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Failed to create device';
        },
      }
    ),
    updateDeviceAsync: create.asyncThunk(
      async ({ id, deviceData }: { id: string; deviceData: UpdateCallerDeviceRequest }) => 
        await devicesService.updateDevice(id, deviceData),
      {
        pending: state => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          const index = state.devices.findIndex(device => device._id === action.payload._id);
          if (index !== -1) {
            state.devices[index] = action.payload;
          }
          if (state.selectedDevice?._id === action.payload._id) {
            state.selectedDevice = action.payload;
          }
          state.error = null;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Failed to update device';
        },
      }
    ),
    deleteDeviceAsync: create.asyncThunk(
      async (id: string) => {
        await devicesService.deleteDevice(id);
        return id;
      },
      {
        pending: state => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.devices = state.devices.filter(device => device._id !== action.payload);
          if (state.selectedDevice?._id === action.payload) {
            state.selectedDevice = null;
          }
          state.error = null;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Failed to delete device';
        },
      }
    ),
    fetchDeviceByIdAsync: create.asyncThunk(
      async (id: string) => await devicesService.getDeviceById(id),
      {
        pending: state => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          state.selectedDevice = action.payload;
          state.error = null;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Failed to fetch device';
        },
      }
    ),
    setDeviceProjectAsync: create.asyncThunk(
      async ({ id, projectId }: { id: string; projectId: string }) => 
        await devicesService.setDeviceProject(id, projectId),
      {
        pending: state => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          const index = state.devices.findIndex(device => device._id === action.payload._id);
          if (index !== -1) {
            state.devices[index] = action.payload;
          }
          if (state.selectedDevice?._id === action.payload._id) {
            state.selectedDevice = action.payload;
          }
          state.error = null;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Failed to set device project';
        },
      }
    ),
    removeDeviceProjectAsync: create.asyncThunk(
      async (id: string) => await devicesService.removeDeviceProject(id),
      {
        pending: state => {
          state.loading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.loading = false;
          const index = state.devices.findIndex(device => device._id === action.payload._id);
          if (index !== -1) {
            state.devices[index] = action.payload;
          }
          if (state.selectedDevice?._id === action.payload._id) {
            state.selectedDevice = action.payload;
          }
          state.error = null;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Failed to remove device project';
        },
      }
    ),
  }),
  selectors: {
    selectDevices: devices => devices.devices,
    selectLoading: devices => devices.loading,
    selectError: devices => devices.error,
    selectSelectedDevice: devices => devices.selectedDevice,
  },
});

// Action creators are generated for each case reducer function.
export const { 
  clearError, 
  setSelectedDevice, 
  fetchDevicesAsync, 
  createDeviceAsync, 
  updateDeviceAsync, 
  deleteDeviceAsync, 
  fetchDeviceByIdAsync,
  setDeviceProjectAsync,
  removeDeviceProjectAsync
} = devicesSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { 
  selectDevices, 
  selectLoading, 
  selectError, 
  selectSelectedDevice 
} = devicesSlice.selectors;
