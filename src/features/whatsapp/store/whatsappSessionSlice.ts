import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../../app/createAppSlice"
import { whatsappService } from "../services/whatsappService"
import type {
  Chat,
  Message,
  GetChatMessagesParams,
  StoredMessage,
} from "../types"

type WhatsappSessionState = {
  currentSessionId: string | null
  chats: Chat[]
  messages: Message[]
  currentChat: Chat | null
  currentMessage: StoredMessage | null
  isLoading: boolean
  error: string | null
  status: "idle" | "loading" | "failed"
}

const initialState: WhatsappSessionState = {
  currentSessionId: null,
  chats: [],
  messages: [],
  currentChat: null,
  currentMessage: null,
  isLoading: false,
  error: null,
  status: "idle",
}

export const whatsappSessionSlice = createAppSlice({
  name: "whatsappSession",
  initialState,
  reducers: (create) => ({
    setCurrentSessionId: create.reducer((state, action: PayloadAction<string | null>) => {
      state.currentSessionId = action.payload
    }),
    setCurrentChat: create.reducer((state, action: PayloadAction<Chat | null>) => {
      state.currentChat = action.payload
    }),
    setCurrentMessage: create.reducer((state, action: PayloadAction<StoredMessage | null>) => {
      state.currentMessage = action.payload
    }),
    clearError: create.reducer((state) => {
      state.error = null
    }),
    clearChats: create.reducer((state) => {
      state.chats = []
    }),
    clearMessages: create.reducer((state) => {
      state.messages = []
    }),
    // Async Thunks - Per-session data
    getChatsAsync: create.asyncThunk(
      async (id: string) => {
        const chats = await whatsappService.getChats(id)
        return chats
      },
      {
        pending: (state) => {
          state.isLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<Chat[]>) => {
          state.isLoading = false
          state.chats = action.payload
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.error = action.error.message || "Failed to fetch chats"
        },
      },
    ),
    getChatMessagesAsync: create.asyncThunk(
      async ({ id, chatId, params }: { id: string; chatId: string; params?: GetChatMessagesParams }) => {
        const messages = await whatsappService.getChatMessages(id, chatId, params)
        return messages
      },
      {
        pending: (state) => {
          state.isLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<Message[]>) => {
          state.isLoading = false
          state.messages = action.payload
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.error = action.error.message || "Failed to fetch chat messages"
        },
      },
    ),
    getMessageByIdAsync: create.asyncThunk(
      async ({ id, messageId }: { id: string; messageId: string }) => {
        const message = await whatsappService.getMessageById(id, messageId)
        return message
      },
      {
        pending: (state) => {
          state.isLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<StoredMessage>) => {
          state.isLoading = false
          state.currentMessage = action.payload
        },
        rejected: (state, action) => {
          state.isLoading = false
          state.error = action.error.message || "Failed to fetch message"
        },
      },
    ),
    getMessageEditHistoryAsync: create.asyncThunk(
      async ({ id, messageId }: { id: string; messageId: string }) => {
        const history = await whatsappService.getMessageEditHistory(id, messageId)
        return history
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
          state.error = action.error.message || "Failed to fetch message edit history"
        },
      },
    ),
  }),
  selectors: {
    selectSessionId: (state) => state.currentSessionId,
    selectChats: (state) => state.chats,
    selectMessages: (state) => state.messages,
    selectCurrentChat: (state) => state.currentChat,
    selectCurrentMessage: (state) => state.currentMessage,
    selectIsLoading: (state) => state.isLoading,
    selectError: (state) => state.error,
    selectStatus: (state) => state.status,
  },
})

export const {
  setCurrentSessionId,
  setCurrentChat,
  setCurrentMessage,
  clearError,
  clearChats,
  clearMessages,
  getChatsAsync,
  getChatMessagesAsync,
  getMessageByIdAsync,
  getMessageEditHistoryAsync,
} = whatsappSessionSlice.actions

export const {
  selectSessionId,
  selectChats,
  selectMessages,
  selectCurrentChat,
  selectCurrentMessage,
  selectIsLoading,
  selectError,
  selectStatus,
} = whatsappSessionSlice.selectors


