import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, List, Box, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useAppSelector } from "@/app/hooks"
import { selectCurrentChat, selectIsMessagesLoading, selectMessages } from "../store/whatsappSessionSlice"
import { selectStoredChats } from "../store/whatsappSlice"
import { WhatsappChatHeader } from "./WhatsappChatHeader"
import { DeletionMarker, CallLogMessage, TextMessage, MediaMessage } from "./message-type"
import type { StoredMessage } from "../types"

type ChatItem = 
  | { type: "message"; data: StoredMessage }
  | { type: "deletion"; timestamp: number; deletedAt: string }
  | { type: "call_log"; data: StoredMessage }

export const WhatsappChatContent = () => {
  const { t } = useTranslation("whatsapp")
  const messages = useAppSelector(selectMessages)
  const currentChat = useAppSelector(selectCurrentChat)
  const storedChats = useAppSelector(selectStoredChats)
  const isLoading = useAppSelector(selectIsMessagesLoading)
  const [filterEnabled, setFilterEnabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevLoadingRef = useRef<boolean>(false)

  // Get the stored chat to access deletedAt
  const storedChat = useMemo(() => {
    if (!currentChat) return null
    return storedChats.find((chat) => chat.chatId === currentChat.chatId) || currentChat
  }, [currentChat, storedChats])

  // Create combined list with messages and deletion markers
  const chatItems = useMemo((): ChatItem[] => {
    const items: ChatItem[] = []

    // Add all messages (separate call_log from regular messages)
    messages.forEach((msg) => {
      if (msg.type === "call_log") {
        items.push({ type: "call_log", data: msg })
      } else {
        items.push({ type: "message", data: msg })
      }
    })
    
    // Add deletion markers from storedChat.deletedAt
    if (storedChat?.deletedAt && storedChat.deletedAt.length > 0) {
      storedChat.deletedAt.forEach((deletedAtStr) => {
        const deletedAtTimestamp = Math.floor(new Date(deletedAtStr).getTime() / 1000)
        items.push({ type: "deletion", timestamp: deletedAtTimestamp, deletedAt: deletedAtStr })
      })
    }

    // Sort by timestamp
    items.sort((a, b) => {
      const timestampA = a.type === "deletion" ? a.timestamp : a.data.timestamp
      const timestampB = b.type === "deletion" ? b.timestamp : b.data.timestamp
      return timestampA - timestampB
    })

    return items
  }, [messages, storedChat])

  const filteredItems = useMemo(() => {
    if (!filterEnabled) return chatItems
    return chatItems.filter((item) => {
      if (item.type === "deletion" || item.type === "call_log") return true
      const msg = item.data
      return msg.isDeleted || (msg.edition && msg.edition.length > 0)
    })
  }, [chatItems, filterEnabled])

  // Scroll to bottom when messages are loaded
  useEffect(() => {
    // Check if loading just finished
    if (prevLoadingRef.current && !isLoading && filteredItems.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        } else if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
        }
      }, 100)
    }
    prevLoadingRef.current = isLoading
  }, [isLoading, filteredItems.length])

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ height: "100%", p: 0,
         display: "flex", flexDirection: "column" }}>
        {!currentChat ? (
          <Typography color="text.secondary">{t("selectChatPrompt")}</Typography>
        ) : isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <Typography>{t("loading")}</Typography>
          </Box>
        ) : (
          <>
            <WhatsappChatHeader
              messages={messages}
              filterEnabled={filterEnabled}
              onFilterChange={setFilterEnabled}
            />
            <Box ref={scrollContainerRef} sx={{ flex: 1, overflowY: "auto" }}>
              <List>
                {filteredItems.map((item, index) => {
                  if (item.type === "deletion") {
                    return (
                      <DeletionMarker
                        key={`deletion-${item.timestamp}-${index}`}
                        timestamp={item.timestamp}
                        deletedAt={item.deletedAt}
                        index={index}
                      />
                    )
                  }

                  if (item.type === "call_log") {
                    return (
                      <CallLogMessage
                        key={`call-${item.data.messageId}-${index}`}
                        callLog={item.data}
                        index={index}
                      />
                    )
                  }

                  // Check if message has media
                  if (item.data.mediaType) {
                    return (
                      <MediaMessage
                        key={item.data.messageId}
                        message={item.data}
                      />
                    )
                  }

                  return (
                    <TextMessage
                      key={item.data.messageId}
                      message={item.data}
                    />
                  )
                })}
                {filteredItems.length === 0 && (
                  <Typography color="text.secondary">{t("noMessages")}</Typography>
                )}
                <div ref={messagesEndRef} />
              </List>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}


