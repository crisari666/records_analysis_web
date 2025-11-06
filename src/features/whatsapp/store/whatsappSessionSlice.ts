import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../../app/createAppSlice"
import { whatsappService } from "../services/whatsappService"
import type {
  Chat,
  StoredMessage,
  GetStoredMessagesParams,
} from "../types"

type WhatsappSessionState = {
  currentSessionId: string | null
  chats: Chat[]
  messages: StoredMessage[]
  currentChat: Chat | null
  currentMessage: StoredMessage | null
  isChatsLoading: boolean
  isMessagesLoading: boolean
  error: string | null
  status: "idle" | "loading" | "failed"
}

const initialState: WhatsappSessionState = {
  currentSessionId: null,
  chats: [],
  messages: [],
  currentChat: null,
  currentMessage: null,
  isChatsLoading: false,
  isMessagesLoading: false,
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
    addMessage: create.reducer((state, action: PayloadAction<StoredMessage>) => {
      // Check if message already exists
      const existingIndex = state.messages.findIndex((m) => m.messageId === action.payload.messageId)
      if (existingIndex === -1) {
        // Add new message at the end (messages are sorted by timestamp)
        state.messages.push(action.payload)
        // Sort by timestamp ascending
        state.messages.sort((a, b) => a.timestamp - b.timestamp)
      }
    }),
    updateChatWithNewMessage: create.reducer((state, action: PayloadAction<{ chatId: string; message: StoredMessage }>) => {
      const chatIndex = state.chats.findIndex((c) => c.id === action.payload.chatId)
      if (chatIndex !== -1) {
        const chat = state.chats[chatIndex]
        // Update chat with new lastMessage and timestamp
        chat.lastMessage = {
          id: action.payload.message.messageId,
          body: action.payload.message.body,
          from: action.payload.message.from,
          to: action.payload.message.to,
          fromMe: action.payload.message.fromMe,
          timestamp: action.payload.message.timestamp,
          hasMedia: action.payload.message.hasMedia,
          mediaType: action.payload.message.mediaType,
          hasQuotedMsg: action.payload.message.hasQuotedMsg,
          isForwarded: action.payload.message.isForwarded,
          isStarred: action.payload.message.isStarred,
          isDeleted: action.payload.message.isDeleted,
        }
        chat.timestamp = action.payload.message.timestamp
        
        // Move chat to first position
        state.chats.splice(chatIndex, 1)
        state.chats.unshift(chat)
      } else {
        // If chat doesn't exist, we might need to fetch it, but for now we'll just add it
        // This should ideally trigger a chat fetch, but for simplicity we'll create a minimal chat
        const newChat: Chat = {
          id: action.payload.chatId,
          name: action.payload.chatId, // Will be updated when chats are fetched
          isGroup: false,
          unreadCount: 0,
          timestamp: action.payload.message.timestamp,
          archive: false,
          pinned: false,
          lastMessage: {
            id: action.payload.message.messageId,
            body: action.payload.message.body,
            from: action.payload.message.from,
            to: action.payload.message.to,
            fromMe: action.payload.message.fromMe,
            timestamp: action.payload.message.timestamp,
            hasMedia: action.payload.message.hasMedia,
            mediaType: action.payload.message.mediaType,
            hasQuotedMsg: action.payload.message.hasQuotedMsg,
            isForwarded: action.payload.message.isForwarded,
            isStarred: action.payload.message.isStarred,
            isDeleted: action.payload.message.isDeleted,
          },
        }
        state.chats.unshift(newChat)
      }
    }),
    // Async Thunks - Per-session data
    getChatsAsync: create.asyncThunk(
      async (id: string) => {
        const chats = await whatsappService.getChats(id)
        return chats
      },
      {
        pending: (state) => {
          state.isChatsLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<Chat[]>) => {
          state.isChatsLoading = false
          state.chats = action.payload
        },
        rejected: (state, action) => {
          state.isChatsLoading = false
          state.error = action.error.message || "Failed to fetch chats"
        },
      },
    ),
    getChatMessagesAsync: create.asyncThunk(
      async ({ id, chatId, params }: { id: string; chatId: string; params?: GetStoredMessagesParams }) => {
        const messages = await whatsappService.getStoredMessages(id, { chatId, ...params })
        return messages
      },
      {
        pending: (state) => {
          state.isMessagesLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<StoredMessage[]>) => {
          state.isMessagesLoading = false
          state.messages = action.payload
        },
        rejected: (state, action) => {
          state.isMessagesLoading = false
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
          state.isMessagesLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<StoredMessage>) => {
          state.isMessagesLoading = false
          state.currentMessage = action.payload
        },
        rejected: (state, action) => {
          state.isMessagesLoading = false
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
          state.isMessagesLoading = true
          state.error = null
        },
        fulfilled: (state) => {
          state.isMessagesLoading = false
        },
        rejected: (state, action) => {
          state.isMessagesLoading = false
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
    selectIsChatsLoading: (state) => state.isChatsLoading,
    selectIsMessagesLoading: (state) => state.isMessagesLoading,
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
  addMessage,
  updateChatWithNewMessage,
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
  selectIsChatsLoading,
  selectIsMessagesLoading,
  selectError,
  selectStatus,
} = whatsappSessionSlice.selectors


