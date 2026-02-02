import apiService from './api';
import { API_ENDPOINTS } from '../config/api';
import { Chat, ChatList, ChatCreate, Message, Profile } from '../types';
import { extractResults } from '../utils/extractResults';
import { logger } from '../utils/logger';

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

  async createChat(data: ChatCreate): Promise<Chat> {
    return await apiService.post<Chat>(API_ENDPOINTS.CHATS, data);
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

  async updateChatMember(chatId: string, memberId: number, data: { role?: string }): Promise<void> {
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
      new_owner_id: newOwnerId,
    });
  },

  async getMessages(
    chatId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<Message[]> {
    const data = await apiService.get(API_ENDPOINTS.CHAT_MESSAGES(chatId), { params });
    const rawMessages = extractResults<any>(data);

    // Debug: log first message to see structure
    if (rawMessages.length > 0) {
      logger.debug('[ChatService] Raw message sample:', JSON.stringify(rawMessages[0]));
    }

    // Map server fields to client Message type
    return rawMessages.map((msg: any) => ({
      id: msg.id,
      chat: msg.chat || chatId,
      sender: msg.author_id || msg.author || msg.sender,
      sender_profile: msg.author_name
        ? ({
          first_name: msg.author_name,
          last_name: null,
          avatar: msg.author_avatar,
        } as any)
        : msg.sender_profile,
      content: msg.text || msg.content || '',
      attachments: msg.attachments || [],
      created_at: msg.created_at,
      updated_at: msg.edited_at || msg.created_at || msg.updated_at,
      is_read: msg.is_read ?? false,
    }));
  },

  async sendMessage(chatId: string, content: string, attachments?: string[]): Promise<Message> {
    const response = await apiService.post<any>(
      API_ENDPOINTS.CHAT_MESSAGES(chatId),
      { text: content, attachments } // Backend expects 'text' not 'content'
    );

    // Server returns { message: {...}, last_message: {...} }
    // Message has 'text' field instead of 'content'
    const messageData = response.message || response;
    return {
      id: messageData.id,
      chat: messageData.chat || chatId,
      sender: messageData.author_id || messageData.author || messageData.sender,
      sender_profile: messageData.author_name
        ? ({
          first_name: messageData.author_name,
          last_name: null,
          avatar: messageData.author_avatar,
        } as any)
        : undefined,
      content: messageData.text || messageData.content || content,
      attachments: messageData.attachments || [],
      created_at: messageData.created_at,
      updated_at: messageData.edited_at || messageData.created_at,
      is_read: false,
    };
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

    return await apiService.post(API_ENDPOINTS.CHAT_UPLOAD(chatId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async getAvailableUsers(): Promise<Profile[]> {
    const data = await apiService.get(API_ENDPOINTS.AVAILABLE_USERS);
    return extractResults<Profile>(data);
  },
};
