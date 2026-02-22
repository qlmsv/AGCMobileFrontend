export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_staff: boolean;
  role: 'student' | 'teacher' | 'admin';
  confirmed_at: string | null;
  date_joined: string;
}

export interface Profile {
  id: string;
  user: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  avatar: string | null;
  bio: string | null;
  timezone: string | null;
  dark_mode: boolean;
  notifications: boolean;
  phone_number: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  access_expires_in?: number;
  refresh_expires_in?: number;
}

export interface SendCodeRequest {
  email: string;
  code_type?: 'signup' | 'login' | 'password_reset';
}

export interface SendCodeResponse {
  detail: string;
  expires_in: number;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
  code_type?: 'signup' | 'login' | 'password_reset';
  remember_me?: boolean;
}

export interface VerifyCodeResponse {
  detail: string;
  user_id: string;
  confirmed_at: string | null;
  access: string;
  refresh: string;
}

export interface TierInfo {
  product_id: string;
  price: number;
}

export interface Course {
  id: string;
  author: string;
  title: string;
  description?: string;
  short_description?: string;
  language?: string;
  duration?: string;
  start_date: string | null;
  price?: string;
  is_free?: boolean;
  certificate?: boolean;
  status?: 'draft' | 'published' | 'archived';
  cover: string | null;
  thumbnail?: string | null;
  rating?: number;
  lessons_count?: number;
  meta?: any;
  category: Category;
  category_id?: string;
  modules: Module[];
  apple_product_id?: string;
  tier_info?: TierInfo | null;
  created_at: string;
  updated_at: string;
  is_favourite: boolean;
  is_enrolled: boolean;
  managers: string[];
}

export interface CourseEnrollment {
  id: string;
  user: string;
  course: string;
  status: 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded';
  paid_amount: string;
  payment_id: string | null;
  purchased_via: 'free' | 'apple_iap' | 'stripe' | 'google_play';
  tier_purchased: string | null;
  purchased_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user: string;
  course: string;
  pdf_file: string | null;
  verification_url: string | null;
  issued_at: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course: string;
  title: string;
  description?: string;
  position: number;
  price?: string;
  lessons: Lesson[];
  created_at: string;
  updated_at: string;
  is_free: string | boolean;
  has_access: string | boolean;
}

export interface Lesson {
  id: string;
  module: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  start_time: string | null;
  external_link: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  has_access: string | boolean;
  video_url?: string | null;
  duration?: string;
  content?: string;
}

export interface CourseStudent {
  id: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  profile: {
    first_name: string | null;
    last_name: string | null;
    avatar: string | null;
  };
}

export interface Chat {
  id: string;
  type: 'dm' | 'group';
  title: string | null;
  description: string | null;
  display_title: string;
  display_avatar: string | null;
  avatar: string | null;
  course: string | null;
  created_by: string;
  settings_json?: any;
  created_at: string;
  messages_counter: number;
  unread_count: string;
  last_message: {
    id: number;
    text: string;
    author_id: string;
    created_at: string;
  } | null;
}

export interface ChatList extends Chat {
  members_count: number;
}

export interface ChatCreate {
  type: 'dm' | 'group';
  user_id?: string;
  title?: string;
  description?: string | null;
  avatar?: string | null;
  course?: string | null;
  member_ids?: string[];
}

export interface ChatMember {
  id: number;
  user: string;
  user_profile?: {
    first_name: string | null;
    last_name: string | null;
    avatar: string | null;
  };
  role: 'owner' | 'moderator' | 'member';
  joined_at: string;
}

export interface Message {
  id: number;
  chat: string;
  sender: string;
  sender_profile?: Profile;
  content: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  is_read: boolean;
}

export interface Notification {
  id: string;
  type:
    | 'CLASS_REMINDER_T15'
    | 'CLASS_REMINDER_T20'
    | 'CLASS_REMINDER_T10'
    | 'ADMIN_ANNOUNCEMENT'
    | 'NEW_COURSE'
    | 'CHAT_MESSAGE';
  title: string;
  body?: string;
  payload: NotificationPayload;
  created_at: string;
}

export interface NotificationPayload {
  chat_id?: string;
  message_id?: number;
  author_id?: string;
  author?: NotificationAuthor;
}

export interface NotificationAuthor {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface NotificationDelivery {
  id: string;
  notification: Notification;
  status: 'pending' | 'sent' | 'read';
  sent_at: string | null;
  read_at: string | null;
  dedupe_key: string | null;
  created_at: string;
}

export interface WebPushSubscription {
  id?: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string;
  created_at?: string;
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  button_text?: string;
  order?: number;
  starts_at: string | null;
  ends_at: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  course_title?: string;
  module_title?: string;
  starts_at: string;
  ends_at: string | null;
  zoom_url?: string | null;
  zoom_link_active?: boolean;
}
