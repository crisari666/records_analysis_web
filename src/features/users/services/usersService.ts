import Api from '../../../app/http'
import { User, CreateUserRequest, UpdateUserRequest } from '../types'

const API_ENDPOINTS = {
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
} as const

const api = new Api()

export const usersService = {
  async getUsers(): Promise<User[]> {
    const response = await api.get({ path: API_ENDPOINTS.USERS })
    return response
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get({ path: API_ENDPOINTS.USER_BY_ID(id) })
    return response
  },

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await api.post({ path: API_ENDPOINTS.USERS, data: userData })
    return response
  },

  async updateUser(userData: UpdateUserRequest): Promise<User> {
    const { id, ...updateData } = userData
    const response = await api.patch({ path: API_ENDPOINTS.USER_BY_ID(id), data: updateData })
    return response
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete({ path: API_ENDPOINTS.USER_BY_ID(id) })
  },
}
