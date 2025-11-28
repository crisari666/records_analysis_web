import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, List, ListItem, ListItemText, Box, Typography, Chip, Tooltip } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import CallMissedIcon from "@mui/icons-material/CallMissed"
import CallReceivedIcon from "@mui/icons-material/CallReceived"
import CallMadeIcon from "@mui/icons-material/CallMade"
import { useTranslation } from "react-i18next"
import { useAppSelector } from "@/app/hooks"
import { selectCurrentChat, selectIsMessagesLoading, selectMessages } from "../store/whatsappSessionSlice"
import { selectStoredChats } from "../store/whatsappSlice"
import { WhatsappChatHeader } from "./WhatsappChatHeader"
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
                    <ListItem 
                      key={`deletion-${item.timestamp}-${index}`} 
                      sx={{ 
                        width: "100%",
                        justifyContent: "center",
                        py: 1
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "error.main",
                          color: "error.contrastText",
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          width: "100%",
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                          {t("chatDeleted")}
                        </Typography>
                        <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                          {new Date(item.deletedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </ListItem>
                  )
                }

                if (item.type === "call_log") {
                  const callLog = item.data
                  // Determine call status from body or rawData
                  const callBody = callLog.body || ""
                  const isMissed = callBody.toLowerCase().includes("missed") || callBody.toLowerCase().includes("perdida")
                  const isOutgoing = callLog.fromMe
                  
                  // Get call icon based on status
                  const CallIconComponent = isMissed 
                    ? CallMissedIcon 
                    : isOutgoing 
                      ? CallMadeIcon 
                      : CallReceivedIcon

                  return (
                    <ListItem 
                      key={`call-${callLog.messageId}-${index}`} 
                      sx={{ 
                        justifyContent: callLog.fromMe ? "flex-end" : "flex-start",
                        py: 1
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: callLog.fromMe
                            ? "primary.main"
                            : "grey.200",
                          color: callLog.fromMe
                            ? "primary.contrastText"
                            : "text.primary",
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          maxWidth: "75%",
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <CallIconComponent sx={{ fontSize: 20 }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                            {callBody || t("callLog")}
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                            {new Date(callLog.timestamp * 1000).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  )
                }

                const message = item.data
                return (
                  <ListItem key={message.messageId} sx={{ justifyContent: message.fromMe ? "flex-end" : "flex-start" }} >
                    <Box
                      sx={{
                        bgcolor: message.isDeleted
                          ? "error.main"
                          : message.fromMe
                            ? "primary.main"
                            : "grey.200",
                        color: message.isDeleted
                          ? "error.contrastText"
                          : message.fromMe
                            ? "primary.contrastText"
                            : "text.primary",
                        px: 1,
                        py: 0.5,
                        borderRadius: 2,
                        maxWidth: "75%",
                      }}
                    >
                      <ListItemText
                        primary={message.body}
                        secondary={
                          <Box component="span">
                            <Typography variant="caption" component="span" sx={{ display: "block" }}>
                              {new Date(message.timestamp * 1000).toLocaleString()}
                            </Typography>
                            <Box component="span" sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
                              {message.edition && message.edition.length > 0 && (
                                <Tooltip
                                  title={
                                    <Box component="span">
                                      <Typography component="span" variant="caption" sx={{ display: "block", fontWeight: "bold", mb: 0.5 }}>
                                        {t("messageEditions")}:
                                      </Typography>
                                      {message.edition.map((edition, editionIndex) => (
                                        <Typography component="span" key={editionIndex} variant="caption" sx={{ display: "block" }}>
                                          {editionIndex + 1}. {edition}
                                        </Typography>
                                      ))}
                                    </Box>
                                  }
                                >
                                  <Chip
                                    component="span"
                                    icon={<EditIcon />}
                                    label={t("messageEdited")}
                                    size="small"
                                    sx={{ fontSize: "0.7rem", height: "20px" }}
                                  />
                                </Tooltip>
                              )}
                              {message.isDeleted && message.deletedAt && (
                                <Tooltip title={`${t("messageDeleted")} - ${new Date(message.deletedAt).toLocaleString()}`}>
                                  <Chip
                                    component="span"
                                    icon={<DeleteIcon />}
                                    label={t("messageDeleted")}
                                    size="small"
                                    sx={{ fontSize: "0.7rem", height: "20px" }}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        }
                        secondaryTypographyProps={{
                          color: message.isDeleted
                            ? "error.contrastText"
                            : message.fromMe
                              ? "primary.contrastText"
                              : "text.secondary",
                        }}
                      />
                    </Box>
                  </ListItem>
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


