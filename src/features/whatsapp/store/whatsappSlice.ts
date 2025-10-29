import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../../app/createAppSlice"
import { whatsappService } from "../services/whatsappService"
import type {
  WhatsappState,
  ActiveSession,
  StoredSession,
  SessionStatusResponse,
  DestroySessionResponse,
  SendMessageRequest,
  StoredChat,
  StoredMessage,
  DeletedMessage,
  GetStoredMessagesParams,
  GetDeletedMessagesParams,
  GetStoredChatsParams,
} from "../types"

const initialState: WhatsappState = {
  sessions: [],
  storedSessions: [],
  currentSession: null,
  // moved to whatsappSessionSlice
  storedChats: [],
  // moved to whatsappSessionSlice
  storedMessages: [],
  deletedMessages: [],
  // moved to whatsappSessionSlice
  qrCode: null,
  isLoading: false,
  error: null,
  status: "idle",
}

export const whatsappSlice = createAppSlice({
  name: "whatsapp",
  initialState,
  reducers: (create) => ({
    setQrCode: create.reducer((state, action: PayloadAction<string | null>) => {
      state.qrCode = action.payload
    }),
    setCurrentSession: create.reducer((state, action: PayloadAction<ActiveSession | null>) => {
      state.currentSession = action.payload
    }),
    // moved to whatsappSessionSlice: setCurrentChat, setCurrentMessage
    clearError: create.reducer((state) => {
      state.error = null
    }),
    clearSessions: create.reducer((state) => {
      state.sessions = []
    }),
    // moved to whatsappSessionSlice: clearChats, clearMessages
    // Async Thunks - Session Management
    createSessionAsync: create.asyncThunk(
      async (id: string) => {
        const response = await whatsappService.createSession(id)
        return response
      },
      {
        pending: (state) => {
          state.isLoading = true
          state.status = "loading"
          state.error = null
        },
        fulfilled: (state) => {
          state.isLoading = false
          state.status = "idle"
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.status = "failed"
          state.error = action.error.message || "Failed to create session"
        },
      },
    ),
    getActiveSessionsAsync: create.asyncThunk(
      async () => {
        const sessions = await whatsappService.getActiveSessions()
        return sessions
      },
      {
        pending: (state) => {
          state.isLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<ActiveSession[]>) => {
          state.isLoading = false
          state.sessions = action.payload
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.error = action.error.message || "Failed to fetch active sessions"
        },
      },
    ),
    getStoredSessionsAsync: create.asyncThunk(
      async () => {
        const sessions = await whatsappService.getStoredSessions()
        return sessions
      },
      {
        pending: (state) => {
          state.isLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<StoredSession[]>) => {
          state.isLoading = false
          state.storedSessions = action.payload
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.error = action.error.message || "Failed to fetch stored sessions"
        },
      },
    ),
    getSessionStatusAsync: create.asyncThunk(
      async (id: string) => {
        const status = await whatsappService.getSessionStatus(id)
        return { id, status }
      },
      {
        pending: (state) => {
          state.isLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<{ id: string; status: SessionStatusResponse }>) => {
          state.isLoading = false
          const session = state.sessions.find((s) => s.sessionId === action.payload.id)
          if (session) {
            session.isReady = action.payload.status.ready
          }
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.error = action.error.message || "Failed to fetch session status"
        },
      },
    ),
    destroySessionAsync: create.asyncThunk(
      async (id: string) => {
        const response = await whatsappService.destroySession(id)
        return { id, response }
      },
      {
        pending: (state) => {
          state.isLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<{ id: string; response: DestroySessionResponse }>) => {
          state.isLoading = false
          state.sessions = state.sessions.filter((s) => s.sessionId !== action.payload.id)
          if (state.currentSession?.sessionId === action.payload.id) {
            state.currentSession = null
          }
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.error = action.error.message || "Failed to destroy session"
        },
      },
    ),
    // Async Thunks - Messaging
    sendMessageAsync: create.asyncThunk(
      async ({ id, messageData }: { id: string; messageData: SendMessageRequest }) => {
        const response = await whatsappService.sendMessage(id, messageData)
        return response
      },
      {
        pending: (state) => {
          state.isLoading = true
          state.error = null
        },
        fulfilled: (state) => {
          state.isLoading = false
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.error = action.error.message || "Failed to send message"
        },
      },
    ),
    // Async Thunks - Stored Chats
    getStoredChatsAsync: create.asyncThunk(
      async ({ id, params }: { id: string; params?: GetStoredChatsParams }) => {
        const chats = await whatsappService.getStoredChats(id, params)
        return chats
      },
      {
        pending: (state) => {
          state.isLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<StoredChat[]>) => {
          state.isLoading = false
          state.storedChats = action.payload
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.error = action.error.message || "Failed to fetch stored chats"
        },
      },
    ),
    getStoredChatByIdAsync: create.asyncThunk(
      async ({ id, chatId }: { id: string; chatId: string }) => {
        const chat = await whatsappService.getStoredChatById(id, chatId)
        return chat
      },
      {
        pending: (state) => {
          state.isLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<StoredChat | null>) => {
          state.isLoading = false
          if (action.payload) {
            const index = state.storedChats.findIndex((c) => c.chatId === action.payload?.chatId)
            if (index !== -1) {
              state.storedChats[index] = action.payload
            } else {
              state.storedChats.push(action.payload)
            }
          }
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.error = action.error.message || "Failed to fetch stored chat"
        },
      },
    ),
    // Async Thunks - Stored Messages
    getStoredMessagesAsync: create.asyncThunk(
      async ({ id, params }: { id: string; params?: GetStoredMessagesParams }) => {
        const messages = await whatsappService.getStoredMessages(id, params)
        return messages
      },
      {
        pending: (state) => {
          state.isLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<StoredMessage[]>) => {
          state.isLoading = false
          state.storedMessages = action.payload
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.error = action.error.message || "Failed to fetch stored messages"
        },
      },
    ),
    getDeletedMessagesAsync: create.asyncThunk(
      async ({ id, params }: { id: string; params?: GetDeletedMessagesParams }) => {
        const messages = await whatsappService.getDeletedMessages(id, params)
        return messages
      },
      {
        pending: (state) => {
          state.isLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<DeletedMessage[]>) => {
          state.isLoading = false
          state.deletedMessages = action.payload
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.error = action.error.message || "Failed to fetch deleted messages"
        },
      },
    ),
    // moved to whatsappSessionSlice: getMessageByIdAsync, getMessageEditHistoryAsync
  }),
  selectors: {
    selectSessions: (whatsapp) => whatsapp.sessions,
    selectStoredSessions: (whatsapp) => whatsapp.storedSessions,
    selectCurrentSession: (whatsapp) => whatsapp.currentSession,
    selectStoredChats: (whatsapp) => whatsapp.storedChats,
    // moved to whatsappSessionSlice: selectChats, selectMessages
    selectStoredMessages: (whatsapp) => whatsapp.storedMessages,
    selectDeletedMessages: (whatsapp) => whatsapp.deletedMessages,
    // moved to whatsappSessionSlice: selectCurrentChat, selectCurrentMessage
    selectQrCode: (whatsapp) => whatsapp.qrCode,
    selectIsLoading: (whatsapp) => whatsapp.isLoading,
    selectError: (whatsapp) => whatsapp.error,
    selectStatus: (whatsapp) => whatsapp.status,
  },
})

export const {
  setQrCode,
  setCurrentSession,
  clearError,
  clearSessions,
  createSessionAsync,
  getActiveSessionsAsync,
  getStoredSessionsAsync,
  getSessionStatusAsync,
  destroySessionAsync,
  sendMessageAsync,
  getStoredChatsAsync,
  getStoredChatByIdAsync,
  getStoredMessagesAsync,
  getDeletedMessagesAsync,
} = whatsappSlice.actions

export const {
  selectSessions,
  selectStoredSessions,
  selectCurrentSession,
  selectStoredChats,
  selectStoredMessages,
  selectDeletedMessages,
  selectQrCode,
  selectIsLoading,
  selectError,
  selectStatus,
} = whatsappSlice.selectors
