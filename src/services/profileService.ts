import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { Profile } from '../types';

// Helper to extract data from paginated responses
const extractResults = <T>(data: any): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results;
  }
  return [];
};

export const profileService = {
  async getProfiles(params?: {
    ordering?: string;
    page?: number;
    search?: string;
  }): Promise<Profile[]> {
    const data = await apiService.get(API_ENDPOINTS.PROFILES, { params });
    return extractResults<Profile>(data);
  },

  async getMyProfile(): Promise<Profile> {
    return await apiService.get<Profile>(API_ENDPOINTS.MY_PROFILE);
  },

  async getProfile(id: string): Promise<Profile> {
    return await apiService.get<Profile>(API_ENDPOINTS.PROFILE_BY_ID(id));
  },

  async createProfile(data: Partial<Profile>): Promise<Profile> {
    return await apiService.post<Profile>(API_ENDPOINTS.PROFILES, data);
  },

  async updateProfile(id: string, data: Partial<Profile>): Promise<Profile> {
    return await apiService.patch<Profile>(API_ENDPOINTS.PROFILE_BY_ID(id), data);
  },

  async deleteProfile(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.PROFILE_BY_ID(id));
  },

  async uploadAvatar(profileId: string, file: any): Promise<Profile> {
    const formData = new FormData();
    formData.append('avatar', file);

    return await apiService.patch<Profile>(
      API_ENDPOINTS.PROFILE_BY_ID(profileId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
};
