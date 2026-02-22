import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { Course, Category, Certificate, CourseEnrollment, Module, Lesson, CourseStudent } from '../types';
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

  async enrollInCourse(courseId: string): Promise<CourseEnrollment> {
    return await apiService.post<CourseEnrollment>(API_ENDPOINTS.COURSE_ENROLL(courseId), {});
  },

  async getCourseAccessStatus(
    courseId: string
  ): Promise<{ course_id: string; is_free: boolean; has_access: boolean; need_payment: boolean }> {
    return await apiService.get(API_ENDPOINTS.COURSE_ACCESS_STATUS(courseId));
  },

  async createCourseStripeSession(
    courseId: string
  ): Promise<{ checkout_url: string }> {
    return await apiService.post(API_ENDPOINTS.COURSE_CREATE_STRIPE_SESSION(courseId), {});
  },

  async validateCourseAppleReceipt(
    courseId: string,
    signedTransaction: string,
    transactionId: string
  ): Promise<{ status: string; enrollment: CourseEnrollment; transaction_id: string }> {
    return await apiService.post(API_ENDPOINTS.COURSE_VALIDATE_APPLE_RECEIPT(courseId), {
      signed_transaction: signedTransaction,
      transaction_id: transactionId,
    });
  },

  async validateCourseGoogleReceipt(
    courseId: string,
    purchaseToken: string,
    productId: string
  ): Promise<{ status: string; enrollment: CourseEnrollment; purchase_token: string }> {
    return await apiService.post(API_ENDPOINTS.COURSE_VALIDATE_GOOGLE_RECEIPT(courseId), {
      purchase_token: purchaseToken,
      product_id: productId,
    });
  },

  async getMyCertificates(): Promise<Certificate[]> {
    const data = await apiService.get(API_ENDPOINTS.MY_CERTIFICATES);
    return extractResults<Certificate>(data);
  },

  async uploadCertificate(courseId: string, formData: FormData): Promise<Certificate> {
    return await apiService.post<Certificate>(
      API_ENDPOINTS.COURSE_CERTIFICATES(courseId),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
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
