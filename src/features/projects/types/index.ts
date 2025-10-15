export type Project = {
  _id: string;
  title: string;
  config: any;
  devices: string[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectRequest = {
  title: string;
  config?: any;
  devices?: string[];
};

export type UpdateProjectRequest = {
  id: string;
  title?: string;
  config?: any;
  devices?: string[];
};

export type UpdateProjectDevicesRequest = {
  id: string;
  devices: string[];
};
