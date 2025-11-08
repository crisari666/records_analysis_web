import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../../app/createAppSlice"
import { whatsappService } from "../services/whatsappService"
import type {
  StoredMessage,
  Message,
  DeletedMessage,
  StoredChat,
  GetChatMessagesParams,
  GetStoredMessagesParams,
  GetDeletedMessagesParams,
  GetStoredChatsParams,
} from "../types"

type WhatsappSessionState = {
  currentSessionId: string | null
  chats: StoredChat[]
  messages: StoredMessage[]
  deletedMessages: DeletedMessage[]
  currentChat: StoredChat | null
  currentMessage: StoredMessage | null
  isChatsLoading: boolean
  isMessagesLoading: boolean
  isSyncing: boolean
  error: string | null
  status: "idle" | "loading" | "failed"
}

const initialState: WhatsappSessionState = {
  currentSessionId: null,
  chats: [],
  messages: [],
  deletedMessages: [],
  currentChat: null,
  currentMessage: null,
  isChatsLoading: false,
  isMessagesLoading: false,
  isSyncing: false,
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
    setCurrentChat: create.reducer((state, action: PayloadAction<StoredChat | null>) => {
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
      const chatIndex = state.chats.findIndex((c) => c.chatId === action.payload.chatId)
      if (chatIndex !== -1) {
        const chat = state.chats[chatIndex]
        // Update chat with new lastMessage and timestamp
        chat.lastMessage = action.payload.message.body
        chat.lastMessageTimestamp = action.payload.message.timestamp
        chat.lastMessageFromMe = action.payload.message.fromMe
        chat.timestamp = action.payload.message.timestamp
        chat.updatedAt = new Date().toISOString()
        
        // Move chat to first position
        state.chats.splice(chatIndex, 1)
        state.chats.unshift(chat)
      } else {
        // If chat doesn't exist, we might need to fetch it, but for now we'll just add it
        // This should ideally trigger a chat fetch, but for simplicity we'll create a minimal chat
        const now = new Date().toISOString()
        const newChat: StoredChat = {
          _id: `temp-${action.payload.chatId}`,
          chatId: action.payload.chatId,
          sessionId: state.currentSessionId || "",
          __v: 0,
          name: action.payload.chatId, // Will be updated when chats are fetched
          isGroup: false,
          unreadCount: 0,
          timestamp: action.payload.message.timestamp,
          archived: false,
          pinned: false,
          isReadOnly: false,
          isMuted: false,
          muteExpiration: 0,
          lastMessage: action.payload.message.body,
          lastMessageTimestamp: action.payload.message.timestamp,
          lastMessageFromMe: action.payload.message.fromMe,
          deleted: false,
          deletedAt: [],
          createdAt: now,
          updatedAt: now,
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
        fulfilled: (state, action: PayloadAction<StoredChat[]>) => {
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
      async ({ id, chatId, params }: { id: string; chatId: string; params?: GetChatMessagesParams }) => {
        const messages = await whatsappService.getChatMessages(id, chatId, params)
        return { messages, chatId }
      },
      {
        pending: (state) => {
          state.isSyncing = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<{ messages: Message[]; chatId: string }>) => {
          state.isSyncing = false
          // Convert Message[] to StoredMessage[] format for compatibility
          const storedMessages: StoredMessage[] = action.payload.messages.map((msg) => ({
            messageId: msg.id,
            chatId: action.payload.chatId,
            body: msg.body,
            type: "text", // Default type as Message doesn't have this field
            from: msg.from,
            to: msg.to,
            author: null,
            fromMe: msg.fromMe,
            timestamp: msg.timestamp,
            isDeleted: msg.isDeleted,
            deletedAt: null,
            deletedBy: null,
            edition: [],
            hasMedia: msg.hasMedia,
            mediaType: msg.mediaType,
            hasQuotedMsg: msg.hasQuotedMsg,
            isForwarded: msg.isForwarded,
            isStarred: msg.isStarred,
          }))
          state.messages = storedMessages
        },
        rejected: (state, action) => {
          state.isSyncing = false
          state.error = action.error.message || "Failed to fetch chat messages"
        },
      },
    ),
    getStoredMessagesAsync: create.asyncThunk(
      async ({ id, params }: { id: string; params?: GetStoredMessagesParams }) => {
        const messages = await whatsappService.getStoredMessages(id, params)
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
          state.isSyncing = false
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
          state.isMessagesLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<DeletedMessage[]>) => {
          state.isMessagesLoading = false
          state.deletedMessages = action.payload
        },
        rejected: (state, action) => {
          state.isMessagesLoading = false
          state.error = action.error.message || "Failed to fetch deleted messages"
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
    getStoredChatsAsync: create.asyncThunk(
      async ({ id, params }: { id: string; params?: GetStoredChatsParams }) => {
        const storedChats = await whatsappService.getStoredChats(id, params)
        return storedChats
      },
      {
        pending: (state) => {
          state.isChatsLoading = true
          state.error = null
        },
        fulfilled: (state, action: PayloadAction<StoredChat[]>) => {
          state.isChatsLoading = false
          state.chats = action.payload
        },
        rejected: (state, action) => {
          state.isChatsLoading = false
          state.error = action.error.message || "Failed to fetch stored chats"
        },
      },
    ),
  }),
  selectors: {
    selectSessionId: (state) => state.currentSessionId,
    selectChats: (state) => state.chats,
    selectMessages: (state) => state.messages,
    selectDeletedMessages: (state) => state.deletedMessages,
    selectCurrentChat: (state) => state.currentChat,
    selectCurrentMessage: (state) => state.currentMessage,
    selectIsChatsLoading: (state) => state.isChatsLoading,
    selectIsMessagesLoading: (state) => state.isMessagesLoading,
    selectIsSyncing: (state) => state.isSyncing,
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
  getStoredMessagesAsync,
  getDeletedMessagesAsync,
  getMessageByIdAsync,
  getMessageEditHistoryAsync,
  getStoredChatsAsync,
} = whatsappSessionSlice.actions

export const {
  selectSessionId,
  selectChats,
  selectMessages,
  selectDeletedMessages,
  selectCurrentChat,
  selectCurrentMessage,
  selectIsChatsLoading,
  selectIsMessagesLoading,
  selectIsSyncing,
  selectError,
  selectStatus,
} = whatsappSessionSlice.selectors


