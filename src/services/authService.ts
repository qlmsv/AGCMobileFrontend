import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { AuthTokens, User } from '../types';

export const authService = {
  async sendCode(email: string): Promise<void> {
    console.log('📤 Sending code to:', email);
    const payload = {
      email,
      code_type: 'login'
    };
    console.log('📦 Payload:', JSON.stringify(payload));
    await apiService.post(API_ENDPOINTS.AUTH_SEND_CODE, payload);
  },

  async verifyCode(email: string, code: string): Promise<AuthTokens> {
    console.log('📤 Verifying code:', { email, code });
    const payload = {
      email,
      code,
      code_type: 'login',
      remember_me: true
    };
    console.log('📦 Payload:', JSON.stringify(payload));

    try {
      const response = await apiService.post<AuthTokens>(
        API_ENDPOINTS.AUTH_CHECK_CODE,
        payload
      );
      console.log('✅ Auth response:', response);
      await apiService.setTokens(response.access, response.refresh);
      return response;
    } catch (error: any) {
      console.error('❌ Auth error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
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

  async isAuthenticated(): Promise<boolean> {
    const token = await apiService.getAccessToken();
    return !!token;
  },
};
