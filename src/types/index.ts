export interface User {
  id: string | number;
  email: string;
  phone?: string;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string | number;
  user: string | number;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  bio?: string;
  date_of_birth?: string;
  country?: string;
  city?: string;
  language?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  access_expiration: string;
  refresh_expiration: string;
}

export interface Course {
  id: string | number;
  title: string;
  description: string;
  category?: {
    id: string;
    name: string;
  };
  price: string | number;
  is_free?: boolean;
  currency?: string;
  language?: string;
  duration?: string;
  status?: 'draft' | 'published' | 'archived';
  cover?: string;
  thumbnail?: string;
  is_favourite?: boolean;
  is_enrolled?: boolean;
  created_at?: string;
  updated_at?: string;
  modules?: any[];
}

export interface Category {
  id: string | number;
  name: string;
  description?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Module {
  id: string | number;
  course: string | number;
  title: string;
  description?: string;
  order?: number;
  is_free?: boolean;
  lessons?: Lesson[];
  created_at?: string;
}

export interface Lesson {
  id: string | number;
  module: string | number;
  title: string;
  content?: string;
  video_url?: string;
  order?: number;
  duration?: number;
  created_at?: string;
}

export interface Chat {
  id: string | number;
  type: 'dm' | 'group';
  name?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string | number;
  chat: string | number;
  sender: string | number;
  sender_profile?: Profile;
  content: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  is_read: boolean;
}

export interface Notification {
  id: number;
  user: number;
  type: 'CLASS_REMINDER_T15' | 'ADMIN_ANNOUNCEMENT' | 'NEW_COURSE' | 'CHAT_MESSAGE';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: any;
}

export interface Banner {
  id: number;
  title: string;
  description?: string;
  image: string;
  link?: string;
  is_active: boolean;
  order: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  type: string;
  related_course?: number;
}
