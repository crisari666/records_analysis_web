import { useEffect } from "react"
import { Card, CardContent, List, ListItem, ListItemText, CircularProgress, Box, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { getChatsAsync, selectChats, selectIsLoading, setCurrentSessionId } from "../store/whatsappSessionSlice"

type WhatsappSessionChatsListProps = {
  sessionId: string
}

export const WhatsappSessionChatsList = ({ sessionId }: WhatsappSessionChatsListProps) => {
  const dispatch = useAppDispatch()
  const chats = useAppSelector(selectChats)
  const isLoading = useAppSelector(selectIsLoading)
  const { t } = useTranslation("whatsapp")

  useEffect(() => {
    if (!sessionId) return
    dispatch(setCurrentSessionId(sessionId))
    dispatch(getChatsAsync(sessionId))
  }, [dispatch, sessionId])

  return (
    <Card>
      <CardContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {chats.map((chat) => (
              <ListItem key={chat.id} divider>
                <ListItemText
                  primary={chat.name || chat.id}
                  secondary={chat.timestamp ? new Date(chat.timestamp).toLocaleString() : undefined}
                />
              </ListItem>
            ))}
            {chats.length === 0 && (
              <Typography color="text.secondary">{t("noChats")}</Typography>
            )}
          </List>
        )}
      </CardContent>
    </Card>
  )
}


