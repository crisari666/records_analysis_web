export type CallerDevice = {
  _id: string;
  imei: string;
  brand: string;
  model: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
};

export type CreateCallerDeviceRequest = {
  imei: string;
  brand: string;
  model: string;
  title: string;
};

export type UpdateCallerDeviceRequest = {
  imei?: string;
  brand?: string;
  model?: string;
  title?: string;
};

export type DevicesState = {
  devices: CallerDevice[];
  loading: boolean;
  error: string | null;
  selectedDevice: CallerDevice | null;
};
