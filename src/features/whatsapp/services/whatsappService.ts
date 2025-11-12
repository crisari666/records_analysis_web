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
  StoredChat,
  Message,
  GetChatMessagesParams,
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
  SESSION_CHAT_MESSAGES: (id: string, chatId: string) => `${API_BASE}/session/${id}/chats/${chatId}/messages`,
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
  async getChats(id: string): Promise<StoredChat[]> {
    const response = await api.get({ path: API_ENDPOINTS.SESSION_CHATS(id) })
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
}
