import Api from '../../../app/http'
import type { Alert, BulkMarkReadResponse, UnreadCountResponse } from '../types'

const API_BASE = 'alerts'

const API_ENDPOINTS = {
  ALERTS: API_BASE,
  UNREAD_COUNT: `${API_BASE}/unread/count`,
  ALERT_BY_ID: (alertId: string) => `${API_BASE}/${alertId}`,
  MARK_ALERT_READ: (alertId: string) => `${API_BASE}/${alertId}/read`,
  MARK_BULK_READ: `${API_BASE}/read/bulk`,
  MARK_ALL_READ: `${API_BASE}/read/all`,
  SESSION_ALERTS: (sessionId: string) => `${API_BASE}/sessions/${sessionId}`,
  MARK_SESSION_ALERTS_READ: (sessionId: string) => `${API_BASE}/sessions/${sessionId}/read`,
  CHAT_ALERTS: (sessionId: string, chatId: string) => `${API_BASE}/sessions/${sessionId}/chats/${chatId}`,
} as const

// Create a new Api instance with alerts base URL
// Using the same base URL as conversation service since they're in the same microservice
const alertsBaseUrl = import.meta.env.VITE_AI_CONVERSATION_ANALYSIS_MS_URL
const alertsApi = new Api(alertsBaseUrl)

export const alertsService = {
  // Get all alerts with optional filtering
  async getAllAlerts(params?: {
    isRead?: boolean
    limit?: number
    skip?: number
  }): Promise<Alert[]> {
    const queryParams = new URLSearchParams()
    if (params?.isRead !== undefined) {
      queryParams.append('isRead', params.isRead.toString())
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params?.skip) {
      queryParams.append('skip', params.skip.toString())
    }

    const path = queryParams.toString()
      ? `${API_ENDPOINTS.ALERTS}?${queryParams.toString()}`
      : API_ENDPOINTS.ALERTS

    const response = await alertsApi.get({ path })
    return response
  },

  // Get unread count
  async getUnreadCount(sessionId?: string): Promise<number> {
    const queryParams = new URLSearchParams()
    if (sessionId) {
      queryParams.append('sessionId', sessionId)
    }

    const path = queryParams.toString()
      ? `${API_ENDPOINTS.UNREAD_COUNT}?${queryParams.toString()}`
      : API_ENDPOINTS.UNREAD_COUNT

    const response = await alertsApi.get({ path })
    const data: UnreadCountResponse = response
    return data.count
  },

  // Get alerts for a specific session
  async getSessionAlerts(
    sessionId: string,
    isRead?: boolean
  ): Promise<Alert[]> {
    const queryParams = new URLSearchParams()
    if (isRead !== undefined) {
      queryParams.append('isRead', isRead.toString())
    }

    const path = queryParams.toString()
      ? `${API_ENDPOINTS.SESSION_ALERTS(sessionId)}?${queryParams.toString()}`
      : API_ENDPOINTS.SESSION_ALERTS(sessionId)

    const response = await alertsApi.get({ path })
    return response
  },

  // Get alerts for a specific chat
  async getChatAlerts(
    sessionId: string,
    chatId: string,
    isRead?: boolean
  ): Promise<Alert[]> {
    const queryParams = new URLSearchParams()
    if (isRead !== undefined) {
      queryParams.append('isRead', isRead.toString())
    }

    const path = queryParams.toString()
      ? `${API_ENDPOINTS.CHAT_ALERTS(sessionId, chatId)}?${queryParams.toString()}`
      : API_ENDPOINTS.CHAT_ALERTS(sessionId, chatId)

    const response = await alertsApi.get({ path })
    return response
  },

  // Get alert by ID
  async getAlertById(alertId: string): Promise<Alert> {
    const response = await alertsApi.get({ path: API_ENDPOINTS.ALERT_BY_ID(alertId) })
    return response
  },

  // Mark alert as read
  async markAlertAsRead(alertId: string): Promise<Alert> {
    const response = await alertsApi.put({ path: API_ENDPOINTS.MARK_ALERT_READ(alertId) })
    return response
  },

  // Mark multiple alerts as read
  async markMultipleAlertsAsRead(alertIds: string[]): Promise<BulkMarkReadResponse> {
    const response = await alertsApi.put({
      path: API_ENDPOINTS.MARK_BULK_READ,
      data: { alertIds },
    })
    return response
  },

  // Mark all session alerts as read
  async markSessionAlertsAsRead(sessionId: string): Promise<BulkMarkReadResponse> {
    const response = await alertsApi.put({
      path: API_ENDPOINTS.MARK_SESSION_ALERTS_READ(sessionId),
    })
    return response
  },

  // Mark all alerts as read
  async markAllAlertsAsRead(): Promise<BulkMarkReadResponse> {
    const response = await alertsApi.put({ path: API_ENDPOINTS.MARK_ALL_READ })
    return response
  },
}

