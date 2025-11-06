export type IndicatorType = 'string' | 'boolean' | 'number' | 'list';

export type Indicator = {
  id: string;
  name: string;
  type: IndicatorType;
  description: string;
  exampleOutput?: string;
};

export type ProjectConfig = {
  mainPrompt?: string;
  indicators?: Indicator[];
};

export type Project = {
  _id: string;
  title: string;
  config: ProjectConfig | any;
  devices: string[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectRequest = {
  title: string;
  config?: ProjectConfig | any;
  devices?: string[];
};

export type UpdateProjectRequest = {
  id: string;
  title?: string;
  config?: ProjectConfig | any;
  devices?: string[];
};

export type UpdateProjectDevicesRequest = {
  id: string;
  devices: string[];
};
