import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { Profile } from '../types';
import { extractResults } from '../utils/extractResults';

export const profileService = {
  async getProfiles(params?: {
    ordering?: string;
    page?: number;
    search?: string;
  }): Promise<Profile[]> {
    const data = await apiService.get(API_ENDPOINTS.PROFILES, { params });
    console.log('[ProfileService] Raw API response:', JSON.stringify(data));
    const results = extractResults<Profile>(data);
    console.log('[ProfileService] Extracted profiles:', results.length);
    return results;
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
