import { useEffect, useRef, type JSX } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { websocketService } from "@/shared/services/websocket.service"
import { addMessage, updateChatWithNewMessage, selectCurrentChat, selectSessionId } from "../store/whatsappSessionSlice"
import type { StoredMessage } from "../types"

type NewMessageEventData = {
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

type WhatsappSocketListenerProps = {
  sessionId: string | null
}

/**
 * Component that handles WebSocket connection and listens for new messages
 * from the joined room. Updates the chats list and messages list accordingly.
 */
export const WhatsappSocketListener = ({ sessionId }: WhatsappSocketListenerProps): JSX.Element | null => {
  const dispatch = useAppDispatch()
  const currentChat = useAppSelector(selectCurrentChat)
  const currentSessionId = useAppSelector(selectSessionId)
  const unsubscribeMessageRef = useRef<(() => void) | null>(null)
  const unsubscribeConnectRef = useRef<(() => void) | null>(null)
  const previousSessionIdRef = useRef<string | null>(null)
  const currentChatIdRef = useRef<string | null>(null)
  const activeSessionIdRef = useRef<string | null>(null)

  // Use the sessionId from props if provided, otherwise use the one from Redux
  const activeSessionId = sessionId || currentSessionId

  // Update refs to track current values
  useEffect(() => {
    currentChatIdRef.current = currentChat?.chatId || null
  }, [currentChat?.chatId])

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId
  }, [activeSessionId])

  // Connect to WebSocket when component mounts
  useEffect(() => {
    // Connect to WebSocket if not already connected
    if (!websocketService.isConnectedToServer()) {
      const wsUrl = import.meta.env.VITE_WEBSOCKET_URL?.replace(/^http/, "ws")
      if (wsUrl) {
        websocketService.connect(wsUrl)
      } else {
        console.error("VITE_WEBSOCKET_URL is not defined")
      }
    }
  }, [])

  useEffect(() => {
    // Only proceed if we have a session ID
    if (!activeSessionId) {
      return
    }

    // Function to join room and set up listeners
    const joinRoomAndSetupListeners = (sessionIdToJoin: string) => {
      // Leave previous room if session changed
      if (previousSessionIdRef.current && previousSessionIdRef.current !== sessionIdToJoin) {
        websocketService.leaveRoom(previousSessionIdRef.current)
      }

      // Join room with sessionId to receive events for this specific session
      const roomName = `session:${sessionIdToJoin}`
      console.log({roomName});
      
      websocketService.joinRoom(roomName)
      previousSessionIdRef.current = sessionIdToJoin

      // Clean up any existing message listeners
      if (unsubscribeMessageRef.current) {
        unsubscribeMessageRef.current()
        unsubscribeMessageRef.current = null
      }

      // Listen for new_message event
      unsubscribeMessageRef.current = websocketService.on<{message: NewMessageEventData, sessionId: string}>("new_message", (data) => {
        // Verify the message has the required fields
        console.log('new_message', {data});
        
        if (!data.message.messageId || !data.message.chatId) {
          console.warn("Received invalid message data:", data)
          return
        }

        // Convert event data to StoredMessage format
        const message: StoredMessage = {
          messageId: data.message.messageId,
          chatId: data.message.chatId,
          body: data.message.body,
          type: data.message.type,
          from: data.message.from,
          to: data.message.to,
          author: data.message.author,
          fromMe: data.message.fromMe,
          timestamp: data.message.timestamp,
          isDeleted: data.message.isDeleted,
          deletedAt: data.message.deletedAt,
          deletedBy: data.message.deletedBy,
          edition: data.message.edition || [],
          hasMedia: data.message.hasMedia,
          mediaType: data.message.mediaType,
          hasQuotedMsg: data.message.hasQuotedMsg,
          isForwarded: data.message.isForwarded,
          isStarred: data.message.isStarred,
        }

        // Update the chats list: move chat with new message to first position
        dispatch(updateChatWithNewMessage({ chatId: data.message.chatId, message }))

        // If the message is for the currently open chat, add it to the messages list
        // Use ref to get the latest currentChatId value
        if (currentChatIdRef.current === data.message.chatId) {
          dispatch(addMessage(message))
        }
      })
    }

    const sessionIdToJoin = activeSessionId

    // Clean up any existing connect listener first
    if (unsubscribeConnectRef.current) {
      unsubscribeConnectRef.current()
      unsubscribeConnectRef.current = null
    }

    // Set up connect listener - this will be called when socket connects
    // or immediately if already connected
    unsubscribeConnectRef.current = websocketService.on("connect", () => {
      // Join room for the current active session
      const currentActiveSessionId = activeSessionIdRef.current
      if (currentActiveSessionId) {
        joinRoomAndSetupListeners(currentActiveSessionId)
      }
    })

    // If already connected, trigger join immediately
    if (websocketService.isConnectedToServer()) {
      joinRoomAndSetupListeners(sessionIdToJoin)
    }

    // Cleanup on unmount or when sessionId changes
    return () => {
      if (unsubscribeMessageRef.current) {
        unsubscribeMessageRef.current()
        unsubscribeMessageRef.current = null
      }
      if (unsubscribeConnectRef.current) {
        unsubscribeConnectRef.current()
        unsubscribeConnectRef.current = null
      }
      // Leave room on cleanup
      if (sessionIdToJoin && websocketService.isConnectedToServer()) {
        websocketService.leaveRoom(sessionIdToJoin)
      }
    }
  }, [activeSessionId, dispatch])

  // This component doesn't render anything
  return null
}

