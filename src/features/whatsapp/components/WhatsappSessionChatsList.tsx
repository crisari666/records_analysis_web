import { useEffect } from "react"
import { Card, CardContent, List, ListItem, ListItemText, ListItemButton, CircularProgress, Box, Typography, Chip } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { getChatsAsync, selectChats, selectIsChatsLoading, setCurrentSessionId, setCurrentChat, getChatMessagesAsync } from "../store/whatsappSessionSlice"

type WhatsappSessionChatsListProps = {
  sessionId: string
}

export const WhatsappSessionChatsList = ({ sessionId }: WhatsappSessionChatsListProps) => {
  const dispatch = useAppDispatch()
  const chats = useAppSelector(selectChats)
  const isChatsLoading = useAppSelector(selectIsChatsLoading)
  const { t } = useTranslation("whatsapp")

  useEffect(() => {
    if (!sessionId) return
    dispatch(setCurrentSessionId(sessionId))
    dispatch(getChatsAsync(sessionId))
  }, [dispatch, sessionId])

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
            {chats.map((chat) => (
              <ListItem key={chat.id} divider disablePadding>
                <ListItemButton
                  onClick={() => {
                    dispatch(setCurrentChat(chat))
                    dispatch(getChatMessagesAsync({ id: sessionId, chatId: chat.id, params: { includeDeleted: true } }))
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1">{chat.name || chat.id}</Typography>
                        {chat.archive && (
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
                      <Box>
                        {chat.lastMessage?.body && (
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.5, maxWidth: "200px" }}>
                            {chat.lastMessage.body.substring(0, 15)}
                          </Typography>
                        )}
                        {chat.timestamp && (
                          <Typography variant="caption" color="text.secondary">
                            {new Date(chat.timestamp * 1000).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
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


