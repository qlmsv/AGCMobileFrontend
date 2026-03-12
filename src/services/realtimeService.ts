import { API_BASE_URL } from '../config/api';
import apiService from './api';
import { logger } from '../utils/logger';

type RealtimeHandler = (payload: any) => void;

function getWebSocketBaseUrl(): string {
  const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');

  if (baseUrl.startsWith('https://')) {
    return `wss://${baseUrl.slice('https://'.length)}`;
  }

  if (baseUrl.startsWith('http://')) {
    return `ws://${baseUrl.slice('http://'.length)}`;
  }

  return baseUrl;
}

async function connectAuthenticatedSocket(
  path: string,
  onMessage: RealtimeHandler
): Promise<() => void> {
  const token = await apiService.getAccessToken();
  if (!token) {
    logger.warn('[Realtime] Skip websocket connection because access token is missing');
    return () => {};
  }

  const separator = path.includes('?') ? '&' : '?';
  const url = `${getWebSocketBaseUrl()}${path}${separator}token=${encodeURIComponent(token)}`;
  const socket = new WebSocket(url);

  socket.onopen = () => {
    logger.info('[Realtime] WebSocket connected:', path);
  };

  socket.onmessage = (event) => {
    try {
      onMessage(JSON.parse(event.data));
    } catch (error) {
      logger.error('[Realtime] Failed to parse websocket message:', error);
    }
  };

  socket.onerror = (error) => {
    logger.error('[Realtime] WebSocket error:', path, error);
  };

  socket.onclose = (event) => {
    logger.info('[Realtime] WebSocket closed:', path, event.code);
  };

  return () => {
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close();
    }
  };
}

export const realtimeService = {
  connectNotifications(onMessage: RealtimeHandler): Promise<() => void> {
    return connectAuthenticatedSocket('/ws/notifications/', onMessage);
  },

  connectChat(chatId: string, onMessage: RealtimeHandler): Promise<() => void> {
    return connectAuthenticatedSocket(`/ws/chats/${chatId}/`, onMessage);
  },
};
