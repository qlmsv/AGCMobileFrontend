# AGC Mobile App

A React Native mobile application for the AGC learning platform, built with Expo and TypeScript.

## Features

- **Authentication**: Phone-based authentication with SMS verification codes
- **Course Management**: Browse, enroll, and manage courses
- **Chat System**: Real-time messaging with direct and group chats
- **User Profiles**: Manage user profile information and avatars
- **Notifications**: Push notifications and in-app notification center
- **Schedule**: View and manage course schedules

## Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Axios** for API requests
- **AsyncStorage** for local data persistence
- **Expo Vector Icons** for icons

## Project Structure

```
AGCMobileFrontend/
├── src/
│   ├── config/          # API configuration
│   ├── contexts/        # React contexts (Auth)
│   ├── navigation/      # Navigation setup
│   ├── screens/         # Screen components
│   │   ├── auth/        # Authentication screens
│   │   └── main/        # Main app screens
│   ├── services/        # API services
│   └── types/           # TypeScript type definitions
├── App.tsx              # App entry point
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AGCMobileFrontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your device:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your physical device

## API Integration

The app connects to the AGC API at `https://api.apexglobal.app/api`. The API base URL can be configured in [src/config/api.ts](src/config/api.ts).

### Available Services

- **authService**: Authentication (send/verify code, logout)
- **courseService**: Course management (browse, enroll, favorites)
- **chatService**: Chat and messaging
- **profileService**: User profile management
- **notificationService**: Notification management

## Authentication Flow

1. User enters phone number
2. SMS verification code is sent
3. User enters code
4. JWT tokens (access + refresh) are stored locally
5. Access token is automatically attached to API requests
6. Token refresh is handled automatically on 401 responses

## Key Features

### Home Screen
- Promotional banners
- Featured courses
- Recent notifications
- Quick access to main features

### Courses Screen
- Browse all courses
- Filter by category
- View enrolled courses
- Manage favorite courses
- Course search and filtering

### Chat Screen
- List of conversations
- Direct messages and group chats
- Unread message indicators
- Create new chats

### Profile Screen
- View and edit profile information
- Upload avatar
- Access settings
- View course history
- Logout

## Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web

### Environment Configuration

No environment variables are required for basic functionality. The API URL is configured in the codebase.

## Authentication

The app uses JWT-based authentication with automatic token refresh:

1. Access tokens are stored in AsyncStorage
2. Tokens are automatically attached to requests
3. 401 responses trigger automatic token refresh
4. Failed refresh clears tokens and redirects to login

## Navigation

The app uses React Navigation with:
- Stack Navigator for authentication flow
- Bottom Tab Navigator for main app screens
- Screen-specific stack navigators where needed

## State Management

- **AuthContext**: Global authentication state
- Local state with useState/useEffect for screen-level data
- AsyncStorage for persistent data

## API Error Handling

All API services include error handling:
- Network errors are caught and logged
- API errors show user-friendly messages
- Authentication errors trigger re-login

## Future Enhancements

- Real-time chat with WebSockets
- Offline support
- Push notifications integration
- Course progress tracking
- Video player for lessons
- Search functionality
- Dark mode support

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - All rights reserved
