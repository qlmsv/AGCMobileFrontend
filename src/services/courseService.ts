import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { Course, Category, Module, Lesson } from '../types';

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

export const courseService = {
  async getCourses(params?: {
    category?: number | string;
    price_min?: number;
    price_max?: number;
    language?: string;
    status?: string;
  }): Promise<Course[]> {
    const data = await apiService.get(API_ENDPOINTS.COURSES, { params });
    return extractResults<Course>(data);
  },

  async getCourse(id: string | number): Promise<Course> {
    return await apiService.get<Course>(`${API_ENDPOINTS.COURSES}${id}/`);
  },

  async getMyCourses(): Promise<Course[]> {
    const data = await apiService.get(API_ENDPOINTS.MY_COURSES);
    return extractResults<Course>(data);
  },

  async getFavouriteCourses(): Promise<Course[]> {
    const data = await apiService.get(API_ENDPOINTS.FAVOURITE_COURSES);
    return extractResults<Course>(data);
  },

  async addToFavourites(courseId: string | number): Promise<void> {
    await apiService.post(`${API_ENDPOINTS.COURSES}${courseId}/favourite/`);
  },

  async removeFromFavourites(courseId: string | number): Promise<void> {
    await apiService.post(`${API_ENDPOINTS.COURSES}${courseId}/unfavourite/`);
  },

  async enrollInCourse(courseId: string | number): Promise<void> {
    // Get all modules for the course
    const modules = await this.getModules(Number(courseId));

    if (modules.length === 0) {
      throw new Error('Course has no modules available for enrollment');
    }

    // Enroll in each module, ignoring already_enrolled errors
    const results = await Promise.allSettled(
      modules.map(module => this.enrollInModule(module.id))
    );

    // Check if any modules require payment
    const paymentRequired = results.some(result =>
      result.status === 'rejected' &&
      (result.reason as any)?.response?.data?.code === 'payment_required'
    );

    if (paymentRequired) {
      throw new Error('Some modules require payment. Please purchase the course first.');
    }

    // If all rejections are "already_enrolled", consider it success
    const allAlreadyEnrolled = results.every(result =>
      result.status === 'fulfilled' ||
      (result.status === 'rejected' && (result.reason as any)?.response?.data?.code === 'already_enrolled')
    );

    if (!allAlreadyEnrolled) {
      // Some other error occurred
      const otherErrors = results.filter(result =>
        result.status === 'rejected' &&
        (result.reason as any)?.response?.data?.code !== 'already_enrolled' &&
        (result.reason as any)?.response?.data?.code !== 'payment_required'
      );

      if (otherErrors.length > 0) {
        throw (otherErrors[0] as PromiseRejectedResult).reason;
      }
    }
  },

  async getCategories(): Promise<Category[]> {
    const data = await apiService.get(API_ENDPOINTS.COURSE_CATEGORIES);
    return extractResults<Category>(data);
  },

  async getModules(courseId?: number): Promise<Module[]> {
    const params = courseId ? { course: courseId } : undefined;
    const data = await apiService.get(API_ENDPOINTS.COURSE_MODULES, { params });
    return extractResults<Module>(data);
  },

  async getModule(id: number): Promise<Module> {
    return await apiService.get<Module>(`${API_ENDPOINTS.COURSE_MODULES}${id}/`);
  },

  async enrollInModule(moduleId: number): Promise<void> {
    await apiService.post(`${API_ENDPOINTS.COURSE_MODULES}${moduleId}/enroll/`, {});
  },

  async getLessons(moduleId?: number): Promise<Lesson[]> {
    const params = moduleId ? { module: moduleId } : undefined;
    const data = await apiService.get(API_ENDPOINTS.COURSE_LESSONS, { params });
    return extractResults<Lesson>(data);
  },

  async getLesson(id: number): Promise<Lesson> {
    return await apiService.get<Lesson>(`${API_ENDPOINTS.COURSE_LESSONS}${id}/`);
  },

  async checkLessonAccess(lessonId: number): Promise<{ has_access: boolean }> {
    return await apiService.get(`${API_ENDPOINTS.COURSE_LESSONS}${lessonId}/check_access/`);
  },
};
