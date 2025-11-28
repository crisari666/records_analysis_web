import { useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { Card, CardContent, List, ListItem, ListItemText, ListItemButton, CircularProgress, Box, Typography, Chip } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { getStoredChatsAsync, selectChats, selectIsChatsLoading, selectCurrentChat, selectSessionDbId, setCurrentSessionId, setCurrentChat, getStoredMessagesAsync, getChatAlertsAsync } from "../store/whatsappSessionSlice"
import type { StoredChat } from "../types"

type WhatsappSessionChatsListProps = {
  sessionId: string
}

export const WhatsappSessionChatsList = ({ sessionId }: WhatsappSessionChatsListProps) => {
  const dispatch = useAppDispatch()
  const chats = useAppSelector(selectChats)
  const currentChat = useAppSelector(selectCurrentChat)
  const sessionDbId = useAppSelector(selectSessionDbId)
  const isChatsLoading = useAppSelector(selectIsChatsLoading)
  const { t } = useTranslation("whatsapp")
  const [searchParams, setSearchParams] = useSearchParams()

  // Reusable method to handle chat selection
  const handleSelectChat = useCallback((chat: StoredChat) => {
    // Update URL with chatId query param
    setSearchParams({ chatId: chat.chatId })
    // Set current chat in Redux
    dispatch(setCurrentChat(chat))
    // Load messages for the selected chat
    dispatch(getStoredMessagesAsync({ id: sessionId, params: { chatId: chat.chatId, includeDeleted: true } }))
    // Fetch alerts for the selected chat (pre-fetch for when user opens alerts popup)
    if (sessionDbId && chat.chatId) {
      dispatch(getChatAlertsAsync({ sessionId: sessionDbId, chatId: chat.chatId }))
    }
  }, [sessionId, sessionDbId, dispatch])

  // Load chats when sessionId changes
  useEffect(() => {
    if (!sessionId) return
    dispatch(setCurrentSessionId(sessionId))
    dispatch(getStoredChatsAsync({ id: sessionId }))
  }, [dispatch, sessionId])

  // Handle chatId from query params
  useEffect(() => {
    const chatIdFromQuery = searchParams.get("chatId")

    if (chatIdFromQuery) {
      // Find the chat by chatId
      const chat = chats.find((c) => c.chatId === chatIdFromQuery)

      if (chat) {
        // Only update if it's different from current chat to avoid unnecessary re-renders
        if (!currentChat || currentChat.chatId !== chat.chatId) {
          dispatch(setCurrentChat(chat))
          dispatch(getStoredMessagesAsync({ id: sessionId, params: { chatId: chat.chatId, includeDeleted: true } }))
          // Fetch alerts for the selected chat
          if (sessionDbId && chat.chatId) {
            dispatch(getChatAlertsAsync({ sessionId: sessionDbId, chatId: chat.chatId }))
          }
        }
      }
    } else if (!chatIdFromQuery && currentChat) {
      // Clear current chat if chatId is removed from query params
      dispatch(setCurrentChat(null))
    }
  }, [chats, currentChat, dispatch, sessionId, sessionDbId, searchParams])

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ height: "100%", p: 0, display: "flex", flexDirection: "column" }}>
        {isChatsLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            <List>
              {chats.map((chat) => {
                const isSelected = currentChat?.chatId === chat.chatId
                return (
                  <ListItem key={chat.chatId} divider disablePadding>
                    <ListItemButton
                      onClick={() => handleSelectChat(chat)}
                      selected={isSelected}
                      sx={{
                        bgcolor: isSelected ? "primary.main" : "transparent",
                        "&:hover": {
                          bgcolor: isSelected ? "primary.dark" : "action.hover",
                        },
                        "&.Mui-selected": {
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          "&:hover": {
                            bgcolor: "primary.dark",
                          },
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography
                              variant="body1"
                              component="span"
                              sx={{
                                color: isSelected ? "primary.contrastText" : "text.primary",
                                fontWeight: isSelected ? 600 : 400,
                              }}
                            >
                              {chat.name || chat.chatId}
                            </Typography>
                            {chat.deleted && (
                              <Chip
                                label={t("chatDeleted")}
                                size="small"
                                color="error"
                                variant="filled"
                              />
                            )}
                            {chat.archived && (
                              <Chip
                                label={t("archived")}
                                size="small"
                                color="default"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box component="span">
                            {chat.lastMessage && (
                              <Typography
                                component="span"
                                variant="body2"
                                noWrap
                                sx={{
                                  mb: 0.5,
                                  maxWidth: "200px",
                                  display: "block",
                                  color: isSelected ? "primary.contrastText" : "text.secondary",
                                  opacity: isSelected ? 0.9 : 1,
                                }}
                              >
                                {chat.lastMessage.substring(0, 15)}
                              </Typography>
                            )}
                            {chat.timestamp && (
                              <Typography
                                component="span"
                                variant="caption"
                                sx={{
                                  display: "block",
                                  color: isSelected ? "primary.contrastText" : "text.secondary",
                                  opacity: isSelected ? 0.8 : 1,
                                }}
                              >
                                {new Date(chat.timestamp * 1000).toLocaleString()}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
              {chats.length === 0 && (
                <Typography color="text.secondary">{t("noChats")}</Typography>
              )}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}


