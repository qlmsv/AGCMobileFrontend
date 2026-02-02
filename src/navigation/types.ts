import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  CourseDetail: { courseId: string };
  LessonDetail: { lessonId: string };
  ChatDetail: { chatId: string };
  Settings: undefined;
  EditProfile: undefined;
  Payment: { url: string };
  Students: undefined;
  CreateCourse: undefined;
  EditCourse: { courseId: string };
  AddModule: { courseId: string; modulesCount?: number };
  Terms: undefined;
  Privacy: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  EmailInput: { mode: 'login' | 'signup' };
  Verification: { email: string; mode: 'login' | 'signup' };
  Information: { email: string };
};

export type MainTabParamList = {
  Home: undefined;
  Courses: { initialSearch?: string } | undefined;
  Schedule: undefined;
  Chats: undefined;
  Profile: undefined;
};
