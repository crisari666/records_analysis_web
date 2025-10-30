import Api from '../../../app/http'
import { Group, CreateGroupRequest, UpdateGroupRequest, UpdateGroupUsersRequest } from '../types'

const API_ENDPOINTS = {
  GROUPS: '/groups',
  GROUP_BY_ID: (id: string) => `/groups/${id}`,
  GROUP_USERS: (id: string) => `/groups/${id}/users`,
} as const

const api = new Api()

export const groupsService = {
  async getGroups(projectId?: string): Promise<Group[]> {
    const response = await api.get({ path: API_ENDPOINTS.GROUPS, params: projectId ? { projectId } : undefined })
    return response
  },

  async getGroupById(id: string): Promise<Group> {
    const response = await api.get({ path: API_ENDPOINTS.GROUP_BY_ID(id) })
    return response
  },

  async createGroup(groupData: CreateGroupRequest): Promise<Group> {
    const response = await api.post({ path: API_ENDPOINTS.GROUPS, data: groupData })
    return response
  },

  async updateGroup(groupData: UpdateGroupRequest): Promise<Group> {
    const { id, ...updateData } = groupData
    const response = await api.patch({ path: API_ENDPOINTS.GROUP_BY_ID(id), data: updateData })
    return response
  },

  async updateGroupUsers(groupData: UpdateGroupUsersRequest): Promise<Group> {
    const { id, users } = groupData
    const response = await api.patch({ path: API_ENDPOINTS.GROUP_USERS(id), data: { users } })
    return response
  },

  async deleteGroup(id: string): Promise<void> {
    await api.delete({ path: API_ENDPOINTS.GROUP_BY_ID(id) })
  },
}


