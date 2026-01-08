import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../../app/createAppSlice"
import { whatsappService } from "../services/whatsappService"
import { conversationService } from "../services/conversationService"
import type {
  WhatsappState,
  ActiveSession,
  StoredSession,
  SessionStatusResponse,
  CreateSessionRequest,
  UpdateSessionGroupRequest,
  DestroySessionResponse,
  SendMessageRequest,
  SyncProgress,
} from "../types"

const initialState: WhatsappState = {
  sessions: [],
  storedSessions: [],
  currentSession: null,
  // moved to whatsappSessionSlice
  storedChats: [],
  // moved to whatsappSessionSlice: storedMessages, deletedMessages
  qrCode: null,
  isLoading: false,
  error: null,
  sessionError: null,
  status: "idle",
  // UI state
  isSyncDialogOpen: false,
  selectedSessionId: null,
  syncProgress: null,
  filterGroupId: null,
}

export const whatsappSlice = createAppSlice({
  name: "whatsapp",
  initialState,
  reducers: (create) => ({
    setQrCode: create.reducer((state, action: PayloadAction<string | null>) => {
      state.qrCode = action.payload
    }),
    openSyncDialog: create.reducer((state, action: PayloadAction<string | null>) => {
      state.isSyncDialogOpen = true
      state.selectedSessionId = action.payload ?? null
    }),
    closeSyncDialog: create.reducer((state) => {
      state.isSyncDialogOpen = false
      state.selectedSessionId = null
    }),
    setCurrentSession: create.reducer((state, action: PayloadAction<ActiveSession | null>) => {
      state.currentSession = action.payload
    }),
    // moved to whatsappSessionSlice: setCurrentChat, setCurrentMessage
    clearError: create.reducer((state) => {
      state.error = null
    }),
    setSessionError: create.reducer((state, action: PayloadAction<string | null>) => {
      state.sessionError = action.payload
    }),
    clearSessionError: create.reducer((state) => {
      state.sessionError = null
    }),
    clearSessions: create.reducer((state) => {
      state.sessions = []
    }),
    setSyncProgress: create.reducer((state, action: PayloadAction<SyncProgress | null>) => {
      state.syncProgress = action.payload
    }),
    clearSyncProgress: create.reducer((state) => {
      state.syncProgress = null
    }),
    setFilterGroupId: create.reducer((state, action: PayloadAction<string | null>) => {
      state.filterGroupId = action.payload
    }),
    // moved to whatsappSessionSlice: clearChats, clearMessages
    // Async Thunks - Session Management
    createSessionAsync: create.asyncThunk(
      async ({ id, data }: { id: string; data: CreateSessionRequest }) => {
        const response = await whatsappService.createSession(id, data)
        return response
      },
      {
        pending: (state) => {
          state.isLoading = true
          state.status = "loading"
          state.error = null
          state.sessionError = null
        },
        fulfilled: (state) => {
          state.isLoading = false
          state.status = "idle"
          state.sessionError = null
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.status = "failed"
          state.sessionError = action.error.message || "Failed to create session"
          state.error = action.error.message || "Failed to create session"
        },
      },
    ),
    updateSessionAsync: create.asyncThunk(
      async ({ id, data }: { id: string; data: UpdateSessionGroupRequest & { title?: string } }) => {
        const response = await conversationService.updateSession(id, { 
          groupId: data.groupId, 
          title: data.title 
        })
        return { id, groupId: data.groupId, title: data.title, response }
      },
      {
        pending: (state) => {
          state.isLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<{ id: string; groupId: string; title?: string; response: { message: string; sessionId: string } }>) => {
          state.isLoading = false
          // Update the stored session's refId and title
          const session = state.storedSessions.find((s) => s.sessionId === action.payload.id)
          if (session) {
            session.refId = action.payload.groupId
            if (action.payload.title !== undefined) {
              session.title = action.payload.title
            }
          }
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.error = action.error.message || "Failed to update session"
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
          state.storedSessions = state.storedSessions.filter((s) => s.sessionId !== action.payload.id)
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
    // moved to whatsappSessionSlice: getStoredMessagesAsync, getDeletedMessagesAsync, getMessageByIdAsync, getMessageEditHistoryAsync
  }),
  selectors: {
    selectSessions: (whatsapp) => whatsapp.sessions,
    selectStoredSessions: (whatsapp) => whatsapp.storedSessions,
    selectCurrentSession: (whatsapp) => whatsapp.currentSession,
    selectStoredChats: (whatsapp) => whatsapp.storedChats,
    // moved to whatsappSessionSlice: selectChats, selectMessages, selectDeletedMessages, selectCurrentChat, selectCurrentMessage
    selectQrCode: (whatsapp) => whatsapp.qrCode,
    selectIsLoading: (whatsapp) => whatsapp.isLoading,
    selectError: (whatsapp) => whatsapp.error,
    selectSessionError: (whatsapp) => whatsapp.sessionError,
    selectStatus: (whatsapp) => whatsapp.status,
    selectIsSyncDialogOpen: (whatsapp) => whatsapp.isSyncDialogOpen,
    selectSelectedSessionId: (whatsapp) => whatsapp.selectedSessionId,
    selectSyncProgress: (whatsapp) => whatsapp.syncProgress,
    selectFilterGroupId: (whatsapp) => whatsapp.filterGroupId,
  },
})

export const {
  setQrCode,
  openSyncDialog,
  closeSyncDialog,
  setCurrentSession,
  clearError,
  setSessionError,
  clearSessionError,
  clearSessions,
  setSyncProgress,
  clearSyncProgress,
  setFilterGroupId,
  createSessionAsync,
  updateSessionAsync,
  getActiveSessionsAsync,
  getStoredSessionsAsync,
  getSessionStatusAsync,
  destroySessionAsync,
  sendMessageAsync,
  // moved to whatsappSessionSlice: getStoredChatsAsync, getStoredMessagesAsync, getDeletedMessagesAsync
} = whatsappSlice.actions

export const {
  selectSessions,
  selectStoredSessions,
  selectCurrentSession,
  selectStoredChats,
  // moved to whatsappSessionSlice: selectStoredMessages, selectDeletedMessages
  selectQrCode,
  selectIsLoading,
  selectError,
  selectSessionError,
  selectStatus,
  selectIsSyncDialogOpen,
  selectSelectedSessionId,
  selectSyncProgress,
  selectFilterGroupId,
} = whatsappSlice.selectors
