/**
 * Type definitions mirroring the ChatConnect backend entities and responses.
 */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: number;
  username: string;
  email: string;
  contactNumber?: string | null;
  profileImage?: string | null;
  onlineStatus?: boolean | null;
  createdAt?: string;
}

export interface ChatParticipant {
  id: number;
  user: User;
}

export interface Chat {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  participants: ChatParticipant[];
  /** May be omitted by the API; only present when the chat detail is fetched. */
  messages?: Message[];
}

export interface Message {
  id: number;
  sender: User;
  messageText: string;
  sentAt: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
}

/** Payload exchanged over the `/ws/chat` WebSocket. */
export interface ChatSocketMessage {
  type: 'CHAT_MESSAGE' | string;
  chatId: number;
  senderId?: number;
  content: string;
  timestamp?: string;
}