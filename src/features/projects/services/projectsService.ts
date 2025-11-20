import Api from '../../../app/http'
import { Project, CreateProjectRequest, UpdateProjectRequest, UpdateProjectDevicesRequest } from '../types'

const API_ENDPOINTS = {
  PROJECTS: '/projects',
  PROJECT_BY_ID: (id: string) => `/projects/${id}`,
  PROJECT_DEVICES: (id: string) => `/projects/${id}/devices`,
  PROJECT_BY_GROUP_ID: (id: string) => `/groups/${id}/project`,
} as const

const api = new Api()

export const projectsService = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get({ path: API_ENDPOINTS.PROJECTS })
    return response
  },

  async getProjectById(id: string): Promise<Project> {
    const response = await api.get({ path: API_ENDPOINTS.PROJECT_BY_ID(id) })
    return response
  },

  async getProjectByGroupId(id: string): Promise<Project> {
    const response = await api.get({ path: API_ENDPOINTS.PROJECT_BY_GROUP_ID(id) })
    return response
  },

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    const response = await api.post({ path: API_ENDPOINTS.PROJECTS, data: projectData })
    return response
  },

  async updateProject(projectData: UpdateProjectRequest): Promise<Project> {
    const { id, ...updateData } = projectData
    const response = await api.patch({ path: API_ENDPOINTS.PROJECT_BY_ID(id), data: updateData })
    return response
  },

  async updateProjectDevices(projectData: UpdateProjectDevicesRequest): Promise<Project> {
    const { id, devices } = projectData
    const response = await api.patch({ path: API_ENDPOINTS.PROJECT_DEVICES(id), data: { devices } })
    return response
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete({ path: API_ENDPOINTS.PROJECT_BY_ID(id) })
  },
}
