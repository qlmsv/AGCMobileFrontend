export const API_BASE_URL = 'https://api.apexglobal.app/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH_SEND_CODE: '/auth/code/send/',
  AUTH_CHECK_CODE: '/auth/code/check/',
  AUTH_REFRESH: '/auth/refresh/',
  AUTH_LOGOUT: '/auth/logout/',
  AUTH_GOOGLE: '/dj-rest-auth/google/',

  // Users
  USERS: '/users/',
  USERS_SEARCH: '/users/search/',
  MY_USER: '/users/my-user/',
  USER_BY_ID: (id: string) => `/users/${id}/`,

  // Profiles
  PROFILES: '/profiles/',
  MY_PROFILE: '/profiles/my-profile/',
  PROFILE_BY_ID: (id: string) => `/profiles/${id}/`,

  // Courses
  COURSES: '/courses/courses/',
  COURSE_BY_ID: (id: string) => `/courses/courses/${id}/`,
  COURSE_CATEGORIES: '/courses/categories/',
  CATEGORY_BY_ID: (id: string) => `/courses/categories/${id}/`,
  COURSE_MODULES: '/courses/modules/',
  MODULE_BY_ID: (id: string) => `/courses/modules/${id}/`,
  MODULE_ACCESS_STATUS: (id: string) => `/courses/modules/${id}/access-status/`,
  MODULE_ENROLL: (id: string) => `/courses/modules/${id}/enroll/`,
  MODULE_CREATE_STRIPE_SESSION: (id: string) => `/courses/modules/${id}/create-stripe-session/`,
  MODULE_VALIDATE_APPLE_RECEIPT: (id: string) => `/courses/modules/${id}/validate-apple-receipt/`,
  COURSE_LESSONS: '/courses/lessons/',
  LESSON_BY_ID: (id: string) => `/courses/lessons/${id}/`,
  LESSON_CHECK_ACCESS: (id: string) => `/courses/lessons/${id}/check_access/`,
  MY_COURSES: '/courses/courses/my-courses/',
  FAVOURITE_COURSES: '/courses/courses/favourites/',
  ADD_TO_FAVOURITES: (id: string) => `/courses/courses/${id}/favourite/`,
  REMOVE_FROM_FAVOURITES: (id: string) => `/courses/courses/${id}/unfavourite/`,
  COURSE_MANAGERS: (id: string) => `/courses/courses/${id}/managers/`,
  ADD_MANAGER: (id: string) => `/courses/courses/${id}/add-manager/`,
  REMOVE_MANAGER: (id: string) => `/courses/courses/${id}/remove-manager/`,
  COURSE_STUDENTS: (id: string) => `/courses/courses/${id}/students/`,
  MY_STUDENTS: '/courses/courses/my-students/',

  // Chat
  CHATS: '/chat/chats/',
  AVAILABLE_USERS: '/chat/chats/available-users/',
  CHAT_BY_ID: (id: string) => `/chat/chats/${id}/`,
  CHAT_MEMBERS: (chatId: string) => `/chat/chats/${chatId}/members/`,
  CHAT_MEMBER_BY_ID: (chatId: string, memberId: number) =>
    `/chat/chats/${chatId}/members/${memberId}/`,
  CHAT_MEMBER_ME: (chatId: string) => `/chat/chats/${chatId}/members/me/`,
  CHAT_MESSAGES: (chatId: string) => `/chat/chats/${chatId}/messages/`,
  CHAT_READ: (chatId: string) => `/chat/chats/${chatId}/read/`,
  CHAT_TRANSFER_OWNER: (chatId: string) => `/chat/chats/${chatId}/transfer_owner/`,
  CHAT_UPLOAD: (chatId: string) => `/chat/chats/${chatId}/upload/`,
  MESSAGE_BY_ID: (messageId: number) => `/chat/messages/${messageId}/`,

  // Notifications
  NOTIFICATIONS: '/notifications/notifications/',
  NOTIFICATION_BY_ID: (id: string) => `/notifications/notifications/${id}/`,
  MARK_NOTIFICATION_READ: (id: string) => `/notifications/notifications/${id}/mark_read/`,
  MARK_ALL_NOTIFICATIONS_READ: '/notifications/notifications/mark_all_read/',
  UNREAD_COUNT: '/notifications/notifications/unread_count/',
  WEBPUSH_SUBSCRIPTIONS: '/notifications/webpush/subscriptions/',
  WEBPUSH_SUBSCRIPTION_BY_ID: (id: string) => `/notifications/webpush/subscriptions/${id}/`,
  PUSH_DEVICES: '/notifications/devices/',

  // Banners
  BANNERS: '/banners/',

  // Schedule
  CALENDAR: '/schedule/calendar/',
} as const;
