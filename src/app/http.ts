import type { AxiosError, AxiosResponse } from 'axios'
import axios from 'axios'

const urlApi = import.meta.env.VITE_BASE_URL_USERS_MS
console.log({urlApi})

const apiAxios = axios.create({
  baseURL: urlApi,
  headers: {
    'Content-type': 'application/json',
  },
})

// Callback to handle unauthorized errors without circular dependency
let unauthorizedCallback: (() => void) | null = null

export const setUnauthorizedCallback = (callback: () => void) => {
  unauthorizedCallback = callback
}

export default class Api {
  private static instance: Api
  
  public static getInstance(): Api {
    if (!Api.instance) {
      Api.instance = new Api()
    }
    return Api.instance
  }

  async get({ path, data, body }: { path: string; data?: object, body?: object }) {
    const token = await this.getToken()
    const headers = this.buildHeaders(token)
    try {
      const responseGet: AxiosResponse = await apiAxios.get(path, {
        params: data,
        data: body,
        headers,
      })
      return responseGet.data
    } catch (error) {
      this.handleUnauthorizedError(error as AxiosError)
      throw error
    }
  }

  async post({ path, data, isFormData = false }: { path: string; data: any, isFormData?: boolean}) {
    try {
      const token = await this.getToken()
      const headers = this.buildHeaders(token, isFormData)
      
      const responsePost: AxiosResponse = await apiAxios.post(path, data, {
        headers,
      })
      return await responsePost.data
    } catch (error) {
      this.handleUnauthorizedError(error as AxiosError)
      throw error
    }
  }
 
  async patch({ path, data= {}, isFormData = false }: { path: string; data?: any, isFormData?: boolean}) {
    try {
      const token = await this.getToken()
      const headers = this.buildHeaders(token, isFormData)
      
      const responsePost: AxiosResponse = await apiAxios.patch(path, data, {
        headers,
      })
      return await responsePost.data
    } catch (error) {
      this.handleUnauthorizedError(error as AxiosError)
      throw error
    }
  }

  async put({ path, data = {} }: { path: string; data?: object }) {
    try {
      const token = await this.getToken()
      const headers = this.buildHeaders(token)
      const responsePut: AxiosResponse = await apiAxios.put(path, data, {
        headers,
      })
      return await responsePut.data
    } catch (error) {
      this.handleUnauthorizedError(error as AxiosError)
      throw error
    }
  }

  async delete({ path, data }: { path: string; data?: object }) {
    try {
      const token = await this.getToken()
      const headers = this.buildHeaders(token)
      const responseDelete: AxiosResponse = await apiAxios.delete(path, {
        data: data,
        headers,
      })
      return await responseDelete.data
    } catch (error) {
      this.handleUnauthorizedError(error as AxiosError)
      throw error
    }
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  private buildHeaders(token: string | null, isFormData: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-type': isFormData ? 'multipart/form-data' : 'application/json'
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  private handleUnauthorizedError(error: AxiosError): void {
    if (error.response?.status === 401) {
      const data: any = error.response?.data
      if (data?.error === 'Unauthorized' || data?.message === 'No token provided' || data?.message === 'Invalid credentials') {
        // Clear token and user from localStorage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        
        // Use callback to handle logout if available
        if (unauthorizedCallback) {
          unauthorizedCallback()
        }
        
        // Redirect to login page
        window.location.href = '/'
      }
    }
  }
}
