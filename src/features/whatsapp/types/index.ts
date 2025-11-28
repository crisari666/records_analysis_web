// Session Management Types
export type SessionStatus = "initializing" | "qr_generated" | "authenticated" | "ready" | "disconnected" | "auth_failure" | "error"

export type ActiveSession = {
  sessionId: string
  isReady: boolean
  lastRestore: string
}

export type StoredSession = {
  _id: string
  sessionId: string
  status: SessionStatus
  lastSeen: string
  updatedAt: string
  createdAt: string
  refId?: string
}

export type SessionStatusResponse = {
  exists: boolean
  ready: boolean
  state?: any
}

export type CreateSessionRequest = {
  groupId: string
}

export type CreateSessionResponse = {
  success: boolean
  sessionId: string
  message: string
}

export type UpdateSessionGroupRequest = {
  groupId: string
}

export type UpdateSessionGroupResponse = {
  success: boolean
}

export type DestroySessionResponse = {
  success: boolean
  message: string
}

export type GetSessionQrCodeResponse = {
  success: boolean
  sessionId?: string
  status?: string
  qrCode: string | null
  qrAttempts?: number
  maxQrAttempts?: number
  message?: string
}

// Messaging Types
export type SendMessageRequest = {
  phone: string
  message: string
}

export type SendMessageResponse = {
  success: boolean
  messageId: string
  timestamp: number
}

// Message Types
export type Message = {
  id: string
  body: string
  from: string
  to: string
  fromMe: boolean
  timestamp: number
  hasMedia: boolean
  mediaType: string | null
  hasQuotedMsg: boolean
  isForwarded: boolean
  isStarred: boolean
  isDeleted: boolean
}

// Chat Types
export type StoredChat = {
  _id: string
  chatId: string
  sessionId: string
  __v: number
  name: string
  isGroup: boolean
  unreadCount: number
  timestamp: number
  archived: boolean
  pinned: boolean
  isReadOnly: boolean
  isMuted: boolean
  muteExpiration: number
  lastMessage: string
  lastMessageTimestamp: number
  lastMessageFromMe: boolean
  deleted: boolean
  deletedAt: string[]
  createdAt: string
  updatedAt: string
  analysis?: Record<string, any>
}

export type StoredMessage = {
  messageId: string
  chatId: string
  body: string
  type: string
  from: string
  to: string
  author: string | null
  fromMe: boolean
  timestamp: number
  isDeleted: boolean
  deletedAt: string | null
  deletedBy: "everyone" | "me" | null
  edition: string[]
  hasMedia: boolean
  mediaType: string | null
  hasQuotedMsg: boolean
  isForwarded: boolean
  isStarred: boolean
  rawData: Record<string, any>

}

export type DeletedMessage = StoredMessage & {
  _id: string
  sessionId: string
  createdAt: string
  updatedAt: string
}

export type MessageEditHistory = {
  messageId: string
  currentBody: string
  editionHistory: string[]
  editCount: number
}

// Request Parameter Types
export type GetChatMessagesParams = {
  limit?: number
}

export type GetStoredMessagesParams = {
  chatId?: string
  includeDeleted?: boolean
  limit?: number
  skip?: number
}

export type GetDeletedMessagesParams = {
  chatId?: string
  limit?: number
}

export type GetStoredChatsParams = {
  archived?: boolean
  isGroup?: boolean
  limit?: number
  skip?: number
}

// Sync Progress Types
export type SyncProgress = {
  sessionId: string
  nChats: number
  currentChat: number
  chatId: string
  messagesSynced: number
}

// Alert Types
export type AlertType = 'disconnected' | 'message_deleted' | 'message_edited' | 'chat_removed'

export type Alert = {
  _id: string
  session: string
  sessionId: string
  type: AlertType
  message?: string
  isRead: boolean
  readAt?: string | Date
  createdAt?: string | Date
  updatedAt?: string | Date
  messageId?: string
  chatId?: string
  timestamp?: number
  callData?: {
    callId?: string
    from?: string
    to?: string
    duration?: number
    isVideo?: boolean
    isGroup?: boolean
  }
}

export type BulkMarkReadResponse = {
  message: string
  modifiedCount: number
}

export type UnreadCountResponse = {
  count: number
}

// Redux State Types
export type WhatsappState = {
  sessions: ActiveSession[]
  storedSessions: StoredSession[]
  currentSession: ActiveSession | null
  storedChats: StoredChat[]
  // moved to whatsappSessionSlice: storedMessages, deletedMessages
  qrCode: string | null
  isLoading: boolean
  error: string | null
  sessionError: string | null
  status: "idle" | "loading" | "failed"
  isSyncDialogOpen: boolean
  selectedSessionId: string | null
  syncProgress: SyncProgress | null
}


