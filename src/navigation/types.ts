export type RootStackParamList = {
  EmailInput: undefined;
  VerifyCode: { email: string };
  CompleteRegistration: { email: string };
  Main: undefined;
  CourseDetail: { courseId: string | number };
  CreateCourse: undefined;
  CreateCourseModules: undefined;
  CreateModuleDetail: { moduleId: number; title: string };
};

export type AuthStackParamList = {
  EmailInput: undefined;
  VerifyCode: { email: string };
  CompleteRegistration: { email: string };
};

export type AppStackParamList = {
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Courses: undefined;
  Chats: undefined;
  Profile: undefined;
};
