import Api from '../../../app/http'
import type {
  ActiveSession,
  StoredSession,
  SessionStatusResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  UpdateSessionGroupRequest,
  UpdateSessionGroupResponse,
  DestroySessionResponse,
  SendMessageRequest,
  SendMessageResponse,
  Chat,
  StoredChat,
  Message,
  StoredMessage,
  DeletedMessage,
  MessageEditHistory,
  GetChatMessagesParams,
  GetStoredMessagesParams,
  GetDeletedMessagesParams,
  GetStoredChatsParams,
} from '../types'

const API_BASE = 'whatsapp-web'

const API_ENDPOINTS = {
  SESSIONS: `${API_BASE}/sessions`,
  STORED_SESSIONS: `${API_BASE}/sessions/stored`,
  SESSION: (id: string) => `${API_BASE}/session/${id}`,
  SESSION_GROUP: (id: string) => `${API_BASE}/session/${id}/group`,
  SESSION_STATUS: (id: string) => `${API_BASE}/session/${id}/status`,
  SEND_MESSAGE: (id: string) => `${API_BASE}/send/${id}`,
  SESSION_CHATS: (id: string) => `${API_BASE}/session/${id}/chats`,
  SESSION_CHATS_STORED: (id: string) => `${API_BASE}/session/${id}/chats/stored`,
  SESSION_CHAT_STORED: (id: string, chatId: string) => `${API_BASE}/session/${id}/chats/stored/${chatId}`,
  SESSION_CHAT_MESSAGES: (id: string, chatId: string) => `${API_BASE}/session/${id}/chats/${chatId}/messages`,
  SESSION_STORED_MESSAGES: (id: string) => `${API_BASE}/session/${id}/stored-messages`,
  SESSION_DELETED_MESSAGES: (id: string) => `${API_BASE}/session/${id}/messages/deleted`,
  SESSION_MESSAGE: (id: string, messageId: string) => `${API_BASE}/session/${id}/messages/${messageId}`,
  SESSION_MESSAGE_EDITS: (id: string, messageId: string) => `${API_BASE}/session/${id}/messages/${messageId}/edits`,
} as const

// Create a new Api instance with WhatsApp-specific base URL if available, otherwise use default
const whatsappBaseUrl = import.meta.env.VITE_WEBSOCKET_MS_URL
const api = new Api(whatsappBaseUrl)

export const whatsappService = {
  // Session Management
  async createSession(id: string, data: CreateSessionRequest): Promise<CreateSessionResponse> {
    const response = await api.post({ path: API_ENDPOINTS.SESSION(id), data })
    return response
  },

  async updateSessionGroup(id: string, data: UpdateSessionGroupRequest): Promise<UpdateSessionGroupResponse> {
    const response = await api.post({ path: API_ENDPOINTS.SESSION_GROUP(id), data })
    return response
  },

  async getActiveSessions(): Promise<ActiveSession[]> {
    const response = await api.get({ path: API_ENDPOINTS.SESSIONS })
    return response
  },

  async getStoredSessions(): Promise<StoredSession[]> {
    const response = await api.get({ path: API_ENDPOINTS.STORED_SESSIONS })
    return response
  },

  async getSessionStatus(id: string): Promise<SessionStatusResponse> {
    const response = await api.get({ path: API_ENDPOINTS.SESSION_STATUS(id) })
    return response
  },

  async destroySession(id: string): Promise<DestroySessionResponse> {
    const response = await api.delete({ path: API_ENDPOINTS.SESSION(id) })
    return response
  },

  // Messaging
  async sendMessage(id: string, messageData: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await api.post({ path: API_ENDPOINTS.SEND_MESSAGE(id), data: messageData })
    return response
  },

  // Chats
  async getChats(id: string): Promise<Chat[]> {
    const response = await api.get({ path: API_ENDPOINTS.SESSION_CHATS(id) })
    return response
  },

  async getStoredChats(id: string, params?: GetStoredChatsParams): Promise<StoredChat[]> {
    const queryParams = new URLSearchParams()
    if (params?.archived !== undefined) {
      queryParams.append('archived', params.archived.toString())
    }
    if (params?.isGroup !== undefined) {
      queryParams.append('isGroup', params.isGroup.toString())
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params?.skip) {
      queryParams.append('skip', params.skip.toString())
    }

    const path = params && queryParams.toString()
      ? `${API_ENDPOINTS.SESSION_CHATS_STORED(id)}?${queryParams.toString()}`
      : API_ENDPOINTS.SESSION_CHATS_STORED(id)

    const response = await api.get({ path })
    return response
  },

  async getStoredChatById(id: string, chatId: string): Promise<StoredChat | null> {
    const response = await api.get({ path: API_ENDPOINTS.SESSION_CHAT_STORED(id, chatId) })
    return response
  },

  // Messages
  async getChatMessages(id: string, chatId: string, params?: GetChatMessagesParams): Promise<Message[]> {
    const queryParams = new URLSearchParams()
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }

    const path = params && queryParams.toString()
      ? `${API_ENDPOINTS.SESSION_CHAT_MESSAGES(id, chatId)}?${queryParams.toString()}`
      : API_ENDPOINTS.SESSION_CHAT_MESSAGES(id, chatId)

    const response = await api.get({ path })
    return response
  },

  async getStoredMessages(id: string, params?: GetStoredMessagesParams): Promise<StoredMessage[]> {
    const queryParams = new URLSearchParams()
    if (params?.chatId) {
      queryParams.append('chatId', params.chatId)
    }
    if (params?.includeDeleted !== undefined) {
      queryParams.append('includeDeleted', params.includeDeleted.toString())
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params?.skip) {
      queryParams.append('skip', params.skip.toString())
    }

    const path = params && queryParams.toString()
      ? `${API_ENDPOINTS.SESSION_STORED_MESSAGES(id)}?${queryParams.toString()}`
      : API_ENDPOINTS.SESSION_STORED_MESSAGES(id)

    const response = await api.get({ path })
    return response
  },

  async getDeletedMessages(id: string, params?: GetDeletedMessagesParams): Promise<DeletedMessage[]> {
    const queryParams = new URLSearchParams()
    if (params?.chatId) {
      queryParams.append('chatId', params.chatId)
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }

    const path = params && queryParams.toString()
      ? `${API_ENDPOINTS.SESSION_DELETED_MESSAGES(id)}?${queryParams.toString()}`
      : API_ENDPOINTS.SESSION_DELETED_MESSAGES(id)

    const response = await api.get({ path })
    return response
  },

  async getMessageById(id: string, messageId: string): Promise<StoredMessage> {
    const response = await api.get({ path: API_ENDPOINTS.SESSION_MESSAGE(id, messageId) })
    return response
  },

  async getMessageEditHistory(id: string, messageId: string): Promise<MessageEditHistory> {
    const response = await api.get({ path: API_ENDPOINTS.SESSION_MESSAGE_EDITS(id, messageId) })
    return response
  },
}
