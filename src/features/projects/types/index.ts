export type IndicatorType = 'string' | 'boolean' | 'number' | 'list';

export type Indicator = {
  id: string;
  name: string;
  type: IndicatorType;
  description: string;
  exampleOutput?: string;
};

export type ExampleAnalysis = {
  name?: string;
  input: string;
  output: Record<string, any>;
};

export type ProjectConfig = {
  mainPrompt?: string;
  indicators?: Indicator[];
  name?: string;
  description?: string;
  domain?: string;
  example_analysis?: ExampleAnalysis | ExampleAnalysis[];
  example_analysis_fail?: ExampleAnalysis | ExampleAnalysis[];
  examples_analysis?: Record<string, ExampleAnalysis>;
};

export type Project = {
  _id: string;
  title: string;
  config: ProjectConfig | any;
  devices: string[];
  users?: string[];
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

export type UpdateProjectUsersRequest = {
  id: string;
  users: string[];
};
