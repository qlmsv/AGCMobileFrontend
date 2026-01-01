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
};

export type AuthStackParamList = {
    Welcome: undefined;
    EmailInput: undefined;
    Verification: { email: string };
    Information: { email: string };
};

export type MainTabParamList = {
    Home: undefined;
    Courses: { initialSearch?: string } | undefined;
    Schedule: undefined;
    Chats: undefined;
    Profile: undefined;
};
