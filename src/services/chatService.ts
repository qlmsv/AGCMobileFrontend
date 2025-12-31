import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { Chat, ChatList, ChatCreate, Message } from '../types';
import { extractResults } from '../utils/extractResults';

export const chatService = {
  async getChats(params?: {
    ordering?: string;
    page?: number;
    search?: string;
  }): Promise<ChatList[]> {
    const data = await apiService.get(API_ENDPOINTS.CHATS, { params });
    return extractResults<ChatList>(data);
  },

  async getChat(chatId: string): Promise<Chat> {
    return await apiService.get<Chat>(API_ENDPOINTS.CHAT_BY_ID(chatId));
  },

  async createChat(data: ChatCreate): Promise<ChatCreate> {
    return await apiService.post<ChatCreate>(API_ENDPOINTS.CHATS, data);
  },

  async updateChat(
    chatId: string,
    data: { title?: string; description?: string; avatar?: string }
  ): Promise<Chat> {
    return await apiService.patch<Chat>(API_ENDPOINTS.CHAT_BY_ID(chatId), data);
  },

  async getChatMembers(chatId: string): Promise<any[]> {
    const data = await apiService.get(API_ENDPOINTS.CHAT_MEMBERS(chatId));
    return extractResults(data);
  },

  async addChatMember(chatId: string, userId: string): Promise<void> {
    await apiService.post(API_ENDPOINTS.CHAT_MEMBERS(chatId), { user_id: userId });
  },

  async updateChatMember(
    chatId: string,
    memberId: number,
    data: { role?: string }
  ): Promise<void> {
    await apiService.patch(API_ENDPOINTS.CHAT_MEMBER_BY_ID(chatId, memberId), data);
  },

  async removeChatMember(chatId: string, memberId: number): Promise<void> {
    await apiService.delete(API_ENDPOINTS.CHAT_MEMBER_BY_ID(chatId, memberId));
  },

  async leaveChatMe(chatId: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.CHAT_MEMBER_ME(chatId));
  },

  async transferOwner(chatId: string, newOwnerId: string): Promise<void> {
    await apiService.post(API_ENDPOINTS.CHAT_TRANSFER_OWNER(chatId), {
      new_owner_id: newOwnerId
    });
  },

  async getMessages(chatId: string, params?: { limit?: number; offset?: number }): Promise<Message[]> {
    const data = await apiService.get(API_ENDPOINTS.CHAT_MESSAGES(chatId), { params });
    return extractResults<Message>(data);
  },

  async sendMessage(chatId: string, content: string, attachments?: string[]): Promise<Message> {
    return await apiService.post<Message>(
      API_ENDPOINTS.CHAT_MESSAGES(chatId),
      { content, attachments }
    );
  },

  async editMessage(messageId: number, content: string): Promise<void> {
    await apiService.patch(API_ENDPOINTS.MESSAGE_BY_ID(messageId), { content });
  },

  async deleteMessage(messageId: number): Promise<void> {
    await apiService.delete(API_ENDPOINTS.MESSAGE_BY_ID(messageId));
  },

  async markChatAsRead(chatId: string): Promise<void> {
    await apiService.post(API_ENDPOINTS.CHAT_READ(chatId), {});
  },

  async uploadFile(chatId: string, file: any): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return await apiService.post(
      API_ENDPOINTS.CHAT_UPLOAD(chatId),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
};
