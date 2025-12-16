import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { Chat, Message } from '../types';

// Helper to extract data from paginated responses
const extractResults = <T>(data: any): T[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results;
  }
  return [];
};

export const chatService = {
  async getChats(): Promise<Chat[]> {
    const data = await apiService.get(API_ENDPOINTS.CHATS);
    return extractResults<Chat>(data);
  },

  async getChat(chatId: string | number): Promise<Chat> {
    return await apiService.get<Chat>(`${API_ENDPOINTS.CHATS}${chatId}/`);
  },

  async createChat(data: { type: 'dm' | 'group'; name?: string; members: (number | string)[] }): Promise<Chat> {
    return await apiService.post<Chat>(API_ENDPOINTS.CHATS, data);
  },

  async getMessages(chatId: string | number, params?: { limit?: number; offset?: number }): Promise<Message[]> {
    const data = await apiService.get(
      `${API_ENDPOINTS.CHATS}${chatId}/messages/`,
      { params }
    );
    return extractResults<Message>(data);
  },

  async sendMessage(chatId: string | number, content: string, attachments?: string[]): Promise<Message> {
    return await apiService.post<Message>(
      `${API_ENDPOINTS.CHATS}${chatId}/messages/`,
      { content, attachments }
    );
  },

  async editMessage(messageId: string | number, content: string): Promise<Message> {
    return await apiService.patch<Message>(
      `${API_ENDPOINTS.MESSAGES}${messageId}/`,
      { content }
    );
  },

  async deleteMessage(messageId: string | number): Promise<void> {
    await apiService.delete(`${API_ENDPOINTS.MESSAGES}${messageId}/`);
  },

  async markChatAsRead(chatId: string | number): Promise<void> {
    await apiService.post(`${API_ENDPOINTS.CHATS}${chatId}/read/`);
  },

  async uploadFile(chatId: string | number, file: any): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return await apiService.post(
      `${API_ENDPOINTS.CHATS}${chatId}/upload/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
};
