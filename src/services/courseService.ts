import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { Course, Category, Module, Lesson, CourseStudent } from '../types';
import { extractResults } from '../utils/extractResults';

export const courseService = {
  async getCourses(params?: {
    author?: string;
    category?: string;
    category_slug?: string;
    is_free?: boolean;
    language?: string;
    min_price?: number;
    max_price?: number;
    status?: 'draft' | 'published' | 'archived';
    ordering?: string;
    page?: number;
    search?: string;
  }): Promise<Course[]> {
    const data = await apiService.get(API_ENDPOINTS.COURSES, { params });
    return extractResults<Course>(data);
  },

  async getCourse(id: string): Promise<Course> {
    return await apiService.get<Course>(API_ENDPOINTS.COURSE_BY_ID(id));
  },

  async createCourse(data: Partial<Course>): Promise<Course> {
    return await apiService.post<Course>(API_ENDPOINTS.COURSES, data);
  },

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    return await apiService.patch<Course>(API_ENDPOINTS.COURSE_BY_ID(id), data);
  },

  async deleteCourse(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.COURSE_BY_ID(id));
  },

  async getMyCourses(): Promise<Course[]> {
    const data = await apiService.get(API_ENDPOINTS.MY_COURSES);
    return extractResults<Course>(data);
  },

  async getFavouriteCourses(): Promise<Course[]> {
    const data = await apiService.get(API_ENDPOINTS.FAVOURITE_COURSES);
    return extractResults<Course>(data);
  },

  async addToFavourites(courseId: string): Promise<Course> {
    return await apiService.post<Course>(API_ENDPOINTS.ADD_TO_FAVOURITES(courseId), {});
  },

  async removeFromFavourites(courseId: string): Promise<Course> {
    return await apiService.post<Course>(API_ENDPOINTS.REMOVE_FROM_FAVOURITES(courseId), {});
  },

  async getCourseManagers(courseId: string): Promise<any> {
    return await apiService.get(API_ENDPOINTS.COURSE_MANAGERS(courseId));
  },

  async addManager(courseId: string, managerId: string): Promise<Course> {
    return await apiService.post<Course>(API_ENDPOINTS.ADD_MANAGER(courseId), {
      manager_id: managerId,
    });
  },

  async removeManager(courseId: string, managerId: string): Promise<Course> {
    return await apiService.post<Course>(API_ENDPOINTS.REMOVE_MANAGER(courseId), {
      manager_id: managerId,
    });
  },

  async getCourseStudents(courseId: string): Promise<CourseStudent[]> {
    const data = await apiService.get(API_ENDPOINTS.COURSE_STUDENTS(courseId));
    return extractResults<CourseStudent>(data);
  },

  async getMyStudents(): Promise<CourseStudent[]> {
    const data = await apiService.get(API_ENDPOINTS.MY_STUDENTS);
    return extractResults<CourseStudent>(data);
  },

  async enrollInCourse(courseId: string): Promise<void> {
    const course = await this.getCourse(courseId);
    const modules = course.modules || [];

    if (modules.length === 0) {
      throw new Error('Course has no modules available for enrollment');
    }

    const results = await Promise.allSettled(
      modules.map((module) => this.enrollInModule(module.id))
    );

    const paymentRequired = results.some(
      (result) =>
        result.status === 'rejected' &&
        (result.reason as any)?.response?.data?.code === 'payment_required'
    );

    if (paymentRequired) {
      throw new Error('Some modules require payment. Please purchase the course first.');
    }

    const allAlreadyEnrolled = results.every(
      (result) =>
        result.status === 'fulfilled' ||
        (result.status === 'rejected' &&
          (result.reason as any)?.response?.data?.code === 'already_enrolled')
    );

    if (!allAlreadyEnrolled) {
      const otherErrors = results.filter(
        (result) =>
          result.status === 'rejected' &&
          (result.reason as any)?.response?.data?.code !== 'already_enrolled' &&
          (result.reason as any)?.response?.data?.code !== 'payment_required'
      );

      if (otherErrors.length > 0) {
        throw (otherErrors[0] as PromiseRejectedResult).reason;
      }
    }
  },

  async getCategories(params?: {
    ordering?: string;
    page?: number;
    search?: string;
  }): Promise<Category[]> {
    const data = await apiService.get(API_ENDPOINTS.COURSE_CATEGORIES, { params });
    return extractResults<Category>(data);
  },

  async getCategory(id: string): Promise<Category> {
    return await apiService.get<Category>(API_ENDPOINTS.CATEGORY_BY_ID(id));
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    return await apiService.post<Category>(API_ENDPOINTS.COURSE_CATEGORIES, data);
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return await apiService.patch<Category>(API_ENDPOINTS.CATEGORY_BY_ID(id), data);
  },

  async deleteCategory(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.CATEGORY_BY_ID(id));
  },

  async getModules(params?: {
    ordering?: string;
    page?: number;
    search?: string;
  }): Promise<Module[]> {
    const data = await apiService.get(API_ENDPOINTS.COURSE_MODULES, { params });
    return extractResults<Module>(data);
  },

  async getModule(id: string): Promise<Module> {
    return await apiService.get<Module>(API_ENDPOINTS.MODULE_BY_ID(id));
  },

  async createModule(data: Partial<Module>): Promise<Module> {
    return await apiService.post<Module>(API_ENDPOINTS.COURSE_MODULES, data);
  },

  async updateModule(id: string, data: Partial<Module>): Promise<Module> {
    return await apiService.patch<Module>(API_ENDPOINTS.MODULE_BY_ID(id), data);
  },

  async deleteModule(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.MODULE_BY_ID(id));
  },

  async getModuleAccessStatus(moduleId: string): Promise<{ has_access: boolean }> {
    return await apiService.get(API_ENDPOINTS.MODULE_ACCESS_STATUS(moduleId));
  },

  async enrollInModule(moduleId: string): Promise<Module> {
    return await apiService.post<Module>(API_ENDPOINTS.MODULE_ENROLL(moduleId), {});
  },

  async createStripeSession(moduleId: string): Promise<{ url?: string; checkout_url?: string }> {
    return await apiService.post(API_ENDPOINTS.MODULE_CREATE_STRIPE_SESSION(moduleId), {});
  },

  /**
   * Validate Apple IAP purchase with backend
   * 
   * StoreKit 2: sends JWS (signed transaction) NOT base64 receipt
   * Backend must use App Store Server API to validate
   */
  async validateAppleReceipt(
    moduleId: string,
    signedTransaction: string,
    transactionId: string
  ): Promise<{ success: boolean; enrolled: boolean }> {
    return await apiService.post(API_ENDPOINTS.MODULE_VALIDATE_APPLE_RECEIPT(moduleId), {
      signed_transaction: signedTransaction, // JWS format for StoreKit 2
      transaction_id: transactionId,
    });
  },

  async getLessons(params?: {
    ordering?: string;
    page?: number;
    search?: string;
  }): Promise<Lesson[]> {
    const data = await apiService.get(API_ENDPOINTS.COURSE_LESSONS, { params });
    return extractResults<Lesson>(data);
  },

  async getLesson(id: string): Promise<Lesson> {
    return await apiService.get<Lesson>(API_ENDPOINTS.LESSON_BY_ID(id));
  },

  async createLesson(data: Partial<Lesson>): Promise<Lesson> {
    return await apiService.post<Lesson>(API_ENDPOINTS.COURSE_LESSONS, data);
  },

  async updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson> {
    return await apiService.patch<Lesson>(API_ENDPOINTS.LESSON_BY_ID(id), data);
  },

  async deleteLesson(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.LESSON_BY_ID(id));
  },

  async checkLessonAccess(lessonId: string): Promise<Lesson> {
    return await apiService.get<Lesson>(API_ENDPOINTS.LESSON_CHECK_ACCESS(lessonId));
  },
};
