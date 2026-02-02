import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { User } from '../types';
import { extractResults } from '../utils/extractResults';

export const userService = {
  async getUsers(params?: { ordering?: string; page?: number; search?: string }): Promise<User[]> {
    const data = await apiService.get(API_ENDPOINTS.USERS, { params });
    return extractResults<User>(data);
  },

  // Search all users - use standard /users/ endpoint with search param
  async searchUsers(search?: string): Promise<User[]> {
    const data = await apiService.get(API_ENDPOINTS.USERS, {
      params: {
        search: search || undefined,
        page_size: 100, // Get more users at once
      },
    });
    return extractResults<User>(data);
  },

  async getMyUser(): Promise<User> {
    return await apiService.get<User>(API_ENDPOINTS.MY_USER);
  },

  async getUser(id: string): Promise<User> {
    return await apiService.get<User>(API_ENDPOINTS.USER_BY_ID(id));
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return await apiService.patch<User>(API_ENDPOINTS.USER_BY_ID(id), data);
  },

  async deleteUser(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.USER_BY_ID(id));
  },
};
