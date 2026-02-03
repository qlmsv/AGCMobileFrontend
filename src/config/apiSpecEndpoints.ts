/**
 * Список эндпоинтов из OpenAPI спецификации (AGC API.yaml).
 * Используется для проверки покрытия фронтендом.
 */

export const OPENAPI_SPEC_ENDPOINTS = [
  // Auth (4)
  '/api/auth/code/check/',
  '/api/auth/code/send/',
  '/api/auth/logout/',
  '/api/auth/refresh/',

  // Banners (1)
  '/api/banners/',

  // Chat (10)
  '/api/chat/chats/',
  '/api/chat/chats/{chat_id}/',
  '/api/chat/chats/{chat_id}/members/',
  '/api/chat/chats/{chat_id}/members/{member_id}/',
  '/api/chat/chats/{chat_id}/members/me/',
  '/api/chat/chats/{chat_id}/messages/',
  '/api/chat/chats/{chat_id}/read/',
  '/api/chat/chats/{chat_id}/transfer_owner/',
  '/api/chat/chats/{chat_id}/upload/',
  '/api/chat/messages/{message_id}/',

  // Courses - Categories (2)
  '/api/courses/categories/',
  '/api/courses/categories/{id}/',

  // Courses - Courses (12)
  '/api/courses/courses/',
  '/api/courses/courses/{id}/',
  '/api/courses/courses/{id}/add-manager/',
  '/api/courses/courses/{id}/favourite/',
  '/api/courses/courses/{id}/managers/',
  '/api/courses/courses/{id}/remove-manager/',
  '/api/courses/courses/{id}/students/',
  '/api/courses/courses/{id}/unfavourite/',
  '/api/courses/courses/favourites/',
  '/api/courses/courses/my-courses/',
  '/api/courses/courses/my-students/',

  // Courses - Lessons (3)
  '/api/courses/lessons/',
  '/api/courses/lessons/{id}/',
  '/api/courses/lessons/{id}/check_access/',

  // Courses - Modules (5)
  '/api/courses/modules/',
  '/api/courses/modules/{id}/',
  '/api/courses/modules/{id}/access-status/',
  '/api/courses/modules/{id}/create-stripe-session/',
  '/api/courses/modules/{id}/enroll/',

  // OAuth (1)
  '/api/dj-rest-auth/google/',

  // Notifications (7)
  '/api/notifications/notifications/',
  '/api/notifications/notifications/{id}/',
  '/api/notifications/notifications/{id}/mark_read/',
  '/api/notifications/notifications/mark_all_read/',
  '/api/notifications/notifications/unread_count/',
  '/api/notifications/webpush/subscriptions/',
  '/api/notifications/webpush/subscriptions/{id}/',

  // Profiles (3)
  '/api/profiles/',
  '/api/profiles/{id}/',
  '/api/profiles/my-profile/',

  // Schedule (1)
  '/api/schedule/calendar',

  // Schema (1)
  '/api/schema/',

  // Users (3)
  '/api/users/',
  '/api/users/{id}/',
  '/api/users/my-user/',
] as const;

export const TOTAL_SPEC_ENDPOINTS = OPENAPI_SPEC_ENDPOINTS.length; // 52

/**
 * Группировка эндпоинтов по категориям для отчёта
 */
export const ENDPOINT_CATEGORIES = {
  auth: OPENAPI_SPEC_ENDPOINTS.filter((e) => e.startsWith('/api/auth/')),
  banners: OPENAPI_SPEC_ENDPOINTS.filter((e) => e.startsWith('/api/banners')),
  chat: OPENAPI_SPEC_ENDPOINTS.filter((e) => e.startsWith('/api/chat/')),
  courses: OPENAPI_SPEC_ENDPOINTS.filter((e) => e.startsWith('/api/courses/')),
  oauth: OPENAPI_SPEC_ENDPOINTS.filter((e) => e.startsWith('/api/dj-rest-auth/')),
  notifications: OPENAPI_SPEC_ENDPOINTS.filter((e) => e.startsWith('/api/notifications/')),
  profiles: OPENAPI_SPEC_ENDPOINTS.filter((e) => e.startsWith('/api/profiles/')),
  schedule: OPENAPI_SPEC_ENDPOINTS.filter((e) => e.startsWith('/api/schedule/')),
  schema: OPENAPI_SPEC_ENDPOINTS.filter((e) => e.startsWith('/api/schema/')),
  users: OPENAPI_SPEC_ENDPOINTS.filter((e) => e.startsWith('/api/users/')),
} as const;
