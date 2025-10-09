import { LoginCredentials, LoginResponse, User } from '../types';
import Api from '../../../app/http';

const api = Api.getInstance();

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    // The identifier can be email, username, or phone number
    // The backend should handle determining the type and authenticating accordingly
    const response: LoginResponse = await api.post({
      path: '/auth/login',
      data: credentials,
    });
    
    // Store token in localStorage
    localStorage.setItem('auth_token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return {
      user: response.user,
      token: response.access_token,
    };
  },

  async logout(): Promise<void> {
    try {
      await api.post({
        path: '/auth/logout',
        data: {},
      });
    } catch (error) {
      // Continue with logout even if server request fails
      console.warn('Logout request failed:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    try {
      return await api.get({
        path: '/auth/me',
      });
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return null;
    }
  },
};
