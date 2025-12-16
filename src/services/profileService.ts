import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { Profile } from '../types';

export const profileService = {
  async getMyProfile(): Promise<Profile> {
    return await apiService.get<Profile>(API_ENDPOINTS.MY_PROFILE);
  },

  async getProfile(id: string | number): Promise<Profile> {
    return await apiService.get<Profile>(`${API_ENDPOINTS.PROFILES}${id}/`);
  },

  async updateProfile(id: string | number, data: Partial<Profile>): Promise<Profile> {
    return await apiService.patch<Profile>(`${API_ENDPOINTS.PROFILES}${id}/`, data);
  },

  async uploadAvatar(profileId: string | number, file: any): Promise<Profile> {
    const formData = new FormData();
    formData.append('avatar', file);

    return await apiService.patch<Profile>(
      `${API_ENDPOINTS.PROFILES}${profileId}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
};
