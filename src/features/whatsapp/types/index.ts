// Session Management Types
export type SessionStatus = "initializing" | "qr_generated" | "authenticated" | "ready" | "disconnected" | "auth_failure" | "error"

export type ActiveSession = {
                            sessionId: string
                            isReady: boolean
                            lastRestore: string
                          }

export type StoredSession = {
                              sessionId: string
                              status: SessionStatus
                              lastSeen: string
                              updatedAt: string
                              createdAt: string
                            }

export type SessionStatusResponse = {
                                     exists: boolean
                                     ready: boolean
                                     state?: any
                                   }

export type CreateSessionResponse = {
                                     success: boolean
                                     sessionId: string
                                     message: string
                                   }

export type DestroySessionResponse = {
                                       success: boolean
                                       message: string
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
export type Chat = {
                     id: string
                     name: string
                     isGroup: boolean
                     unreadCount: number
                     timestamp: number
                     archive: boolean
                     pinned: boolean
                     lastMessage: Message | null
                   }

export type StoredChat = {
                           _id: string
                           chatId: string
                           sessionId: string
                           name: string
                           isGroup: boolean
                           unreadCount: number
                           timestamp: number
                           archived: boolean
                           pinned: boolean
                           isReadOnly: boolean
                           isMuted: boolean
                           muteExpiration: number | null
                           lastMessage: string | null
                           lastMessageTimestamp: number | null
                           lastMessageFromMe: boolean | null
                           createdAt: string
                           updatedAt: string
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

// Redux State Types
export type WhatsappState = {
                              sessions: ActiveSession[]
                              storedSessions: StoredSession[]
                              currentSession: ActiveSession | null
                              storedChats: StoredChat[]
                              storedMessages: StoredMessage[]
                              deletedMessages: DeletedMessage[]
                              qrCode: string | null
                              isLoading: boolean
                              error: string | null
                              status: "idle" | "loading" | "failed"
                            }

