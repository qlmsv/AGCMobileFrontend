import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { Profile } from '../types';
import { extractResults } from '../utils/extractResults';
import { logger } from '../utils/logger';

export const profileService = {
  async getProfiles(params?: {
    ordering?: string;
    page?: number;
    page_size?: number;
    search?: string;
  }): Promise<Profile[]> {
    const data = await apiService.get<any>(API_ENDPOINTS.PROFILES, { params });
    logger.debug('[ProfileService] Low-level getProfiles called');
    return extractResults<Profile>(data);
  },

  // Helper to fetch EVERYTHING by following pagination
  async getAllProfiles(): Promise<Profile[]> {
    let allProfiles: Profile[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        logger.debug(`[ProfileService] Fetching page ${page}...`);
        // Try to get 50 items per page
        const data = await apiService.get<any>(API_ENDPOINTS.PROFILES, {
          params: { page, page_size: 50 },
        });

        const results = extractResults<Profile>(data);
        allProfiles = [...allProfiles, ...results];

        // Check if there is a next page
        if (data && data.next) {
          page++;
        } else {
          hasMore = false;
        }

        // Safety break to prevent infinite loops (e.g. > 1000 users)
        if (page > 20) {
          logger.warn('Stopped fetching profiles after 20 pages');
          hasMore = false;
        }
      } catch (error) {
        logger.error('Error fetching profiles page:', error);
        hasMore = false;
      }
    }

    // Deduplicate just in case
    const uniqueIds = new Set();
    return allProfiles.filter((p) => {
      if (uniqueIds.has(p.id)) return false;
      uniqueIds.add(p.id);
      return true;
    });
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

    // React Native requires this specific format for file uploads
    formData.append('avatar', {
      uri: file.uri,
      name: file.name || 'avatar.jpg',
      type: file.type || 'image/jpeg',
    } as any);

    logger.debug('[ProfileService] Uploading avatar:', {
      profileId,
      uri: file.uri,
      name: file.name,
      type: file.type,
    });

    return await apiService.patch<Profile>(API_ENDPOINTS.PROFILE_BY_ID(profileId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
      transformRequest: (data) => data, // Prevent axios from stringifying FormData
    });
  },

  async updateMyProfileWithAvatar(formData: FormData): Promise<Profile> {
    return await apiService.patch<Profile>(API_ENDPOINTS.MY_PROFILE, formData, {
      headers: {
        Accept: 'application/json',
      },
      transformRequest: (data) => data, // Prevent axios from stringifying FormData
    });
  },

  // Get profile by user ID (searches through profiles)
  async getProfileByUserId(userId: string): Promise<Profile | null> {
    try {
      const data = await apiService.get(API_ENDPOINTS.PROFILES, {
        params: { user: userId },
      });
      const profiles = extractResults<Profile>(data);
      return profiles.length > 0 ? profiles[0] : null;
    } catch {
      logger.debug('Could not find profile for user:', userId);
      return null;
    }
  },
};
