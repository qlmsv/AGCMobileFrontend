export const API_BASE_URL = 'https://api.apexglobal.app/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH_SEND_CODE: '/auth/code/send/',
  AUTH_CHECK_CODE: '/auth/code/check/',
  AUTH_REFRESH: '/auth/refresh/',
  AUTH_LOGOUT: '/auth/logout/',

  // Users
  USERS: '/users/',
  MY_USER: '/users/my-user/',

  // Profiles
  PROFILES: '/profiles/',
  MY_PROFILE: '/profiles/my-profile/',

  // Courses
  COURSES: '/courses/courses/',
  COURSE_CATEGORIES: '/courses/categories/',
  COURSE_MODULES: '/courses/modules/',
  COURSE_LESSONS: '/courses/lessons/',
  MY_COURSES: '/courses/courses/my-courses/',
  FAVOURITE_COURSES: '/courses/courses/favourites/',

  // Chat
  CHATS: '/chat/chats/',
  MESSAGES: '/chat/messages/',

  // Notifications
  NOTIFICATIONS: '/notifications/notifications/',
  UNREAD_COUNT: '/notifications/notifications/unread_count/',

  // Banners
  BANNERS: '/banners/',

  // Schedule
  CALENDAR: '/schedule/calendar',
} as const;
