import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User, Profile } from '../types';
import { profileService } from '../services/profileService';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sendCode: (email: string, codeType?: 'signup' | 'login') => Promise<void>;
  verifyCode: (email: string, code: string, codeType?: 'signup' | 'login') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        await loadUserData();
      }
    } catch (error) {
      logger.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);

      const profileData = await profileService.getMyProfile();
      setProfile(profileData);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        logger.info('Session expired during user load');
      } else {
        logger.error('Failed to load user data:', error);
      }
      setUser(null);
      setProfile(null);
    }
  };

  const sendCode = async (email: string, codeType: 'signup' | 'login' = 'login') => {
    await authService.sendCode(email, codeType);
  };

  const verifyCode = async (email: string, code: string, codeType: 'signup' | 'login' = 'login') => {
    await authService.verifyCode(email, code, codeType);
    await loadUserData();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
  };

  const refreshUser = async () => {
    await loadUserData();
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!profile) {
      throw new Error('No profile to update');
    }
    await profileService.updateProfile(profile.id, data);
    await loadUserData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        sendCode,
        verifyCode,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
