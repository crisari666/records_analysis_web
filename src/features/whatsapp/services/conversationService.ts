import Api from '../../../app/http'
import type {
  StoredChat,
  StoredMessage,
  DeletedMessage,
  MessageEditHistory,
  GetStoredMessagesParams,
  GetDeletedMessagesParams,
  GetStoredChatsParams,
} from '../types'

const API_BASE = 'conversations'

const API_ENDPOINTS = {
  SESSION_CHATS_STORED: (id: string) => `${API_BASE}/sessions/${id}/chats`,
  //SESSION_CHAT_STORED: (id: string, chatId: string) => `${API_BASE}/session/${id}/chats/${chatId}`,
  CHAT_STORED_MESSAGES: (id: string) => `${API_BASE}/sessions/${id}/messages`,
  SESSION_DELETED_MESSAGES: (id: string) => `${API_BASE}/sessions/${id}/messages/deleted`,
  SESSION_MESSAGE: (id: string, messageId: string) => `${API_BASE}/sessions/${id}/messages/${messageId}`,
  SESSION_MESSAGE_EDITS: (id: string, messageId: string) => `${API_BASE}/sessions/${id}/messages/${messageId}/edits`,
  ANALYZE_CHAT: (sessionId: string, chatId: string) => `${API_BASE}/sessions/${sessionId}/chats/${chatId}/analyze`,
} as const

// Create a new Api instance with conversation analysis base URL
const conversationBaseUrl = import.meta.env.VITE_AI_CONVERSATION_ANALYSIS_MS_URL
const conversationApi = new Api(conversationBaseUrl)

export const conversationService = {
  // Stored Chats
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

    const response = await conversationApi.get({ path })
    return response
  },

  // Stored Messages
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
      ? `${API_ENDPOINTS.CHAT_STORED_MESSAGES(id)}?${queryParams.toString()}`
      : API_ENDPOINTS.CHAT_STORED_MESSAGES(id)

    const response = await conversationApi.get({ path })
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

    const response = await conversationApi.get({ path })
    return response
  },

  async getMessageById(id: string, messageId: string): Promise<StoredMessage> {
    const response = await conversationApi.get({ path: API_ENDPOINTS.SESSION_MESSAGE(id, messageId) })
    return response
  },

  async getMessageEditHistory(id: string, messageId: string): Promise<MessageEditHistory> {
    const response = await conversationApi.get({ path: API_ENDPOINTS.SESSION_MESSAGE_EDITS(id, messageId) })
    return response
  },

  async analyzeChat(sessionId: string, chatId: string): Promise<{ success: boolean; chatId: string; analysis: Record<string, any> }> {
    const response = await conversationApi.post({ path: API_ENDPOINTS.ANALYZE_CHAT(sessionId, chatId) })
    return response
  },
}

