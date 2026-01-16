import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import {
  SendCodeRequest,
  SendCodeResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  User,
} from '../types';
import { logger } from '../utils/logger';

export const authService = {
  async sendCode(
    email: string,
    codeType: 'signup' | 'login' | 'password_reset' = 'login'
  ): Promise<SendCodeResponse> {
    logger.debug('📤 Sending code to:', email);
    const payload: SendCodeRequest = {
      email,
      code_type: codeType,
    };
    logger.debug('📦 Payload:', JSON.stringify(payload));
    return await apiService.post<SendCodeResponse>(API_ENDPOINTS.AUTH_SEND_CODE, payload);
  },

  async verifyCode(
    email: string,
    code: string,
    codeType: 'signup' | 'login' | 'password_reset' = 'login',
    rememberMe: boolean = true
  ): Promise<VerifyCodeResponse> {
    logger.debug('📤 Verifying code:', { email, code });
    const payload: VerifyCodeRequest = {
      email,
      code,
      code_type: codeType,
      remember_me: rememberMe,
    };
    logger.debug('📦 Payload:', JSON.stringify(payload));

    try {
      const response = await apiService.post<VerifyCodeResponse>(
        API_ENDPOINTS.AUTH_CHECK_CODE,
        payload
      );
      logger.debug('✅ Auth response:', response);
      await apiService.setTokens(response.access, response.refresh);
      return response;
    } catch (error: any) {
      logger.error('❌ Auth error:', error);
      logger.error('❌ Error response:', error.response?.data);
      logger.error('❌ Error status:', error.response?.status);
      throw error;
    }
  },

  async refreshToken(refreshToken: string): Promise<{ access: string; refresh?: string }> {
    return await apiService.post(API_ENDPOINTS.AUTH_REFRESH, {
      refresh: refreshToken,
    });
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = await apiService.getRefreshToken();
      if (refreshToken) {
        await apiService.post(API_ENDPOINTS.AUTH_LOGOUT, { refresh: refreshToken });
      }
    } finally {
      await apiService.clearTokens();
    }
  },

  async getCurrentUser(): Promise<User> {
    return await apiService.get<User>(API_ENDPOINTS.MY_USER);
  },

  async getUserById(userId: string): Promise<User> {
    return await apiService.get<User>(API_ENDPOINTS.USER_BY_ID(userId));
  },

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    return await apiService.patch<User>(API_ENDPOINTS.USER_BY_ID(userId), data);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await apiService.getAccessToken();
    return !!token;
  },

  async loginWithGoogle(accessToken?: string, code?: string, idToken?: string): Promise<any> {
    const payload: any = {};
    if (accessToken) payload.access_token = accessToken;
    if (code) payload.code = code;
    if (idToken) payload.id_token = idToken;

    return await apiService.post(API_ENDPOINTS.AUTH_GOOGLE, payload);
  },
};
