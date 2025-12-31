import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { Banner, Course } from '../types';
import { courseService } from './courseService';
import { logger } from '../utils/logger';

const getBanners = async (): Promise<Banner[]> => {
    // If there is no specific banner endpoint yet, we return a mock or empty
    // But based on docs, let's assume /api/banners/ or just return mocked for now if not found
    // The previous analysis found /api/banners/
    try {
        const data = await apiService.get<any>(API_ENDPOINTS.BANNERS);
        return Array.isArray(data) ? data : (data.results || []);
    } catch (error) {
        // Banners are optional, so we just log a warning and return empty array
        logger.warn('Error fetching banners', error);
        return [];
    }
};

const getPopularCourses = async (): Promise<Course[]> => {
    // Using courses endpoint with ordering
    return await courseService.getCourses({ ordering: '-rating', page: 1 });
};

export const homeService = {
    getBanners,
    getPopularCourses,
};
