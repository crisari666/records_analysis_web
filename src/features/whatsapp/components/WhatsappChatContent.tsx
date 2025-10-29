import { Card, CardContent, List, ListItem, ListItemText, Box, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useAppSelector } from "@/app/hooks"
import { selectCurrentChat, selectIsMessagesLoading, selectMessages } from "../store/whatsappSessionSlice"

export const WhatsappChatContent = () => {
  const { t } = useTranslation("whatsapp")
  const messages = useAppSelector(selectMessages)
  const currentChat = useAppSelector(selectCurrentChat)
  const isLoading = useAppSelector(selectIsMessagesLoading)

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ height: "100%", p: 0, display: "flex", flexDirection: "column" }}>
        {!currentChat ? (
          <Typography color="text.secondary">{t("selectChatPrompt")}</Typography>
        ) : isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <Typography>{t("loading")}</Typography>
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            <List>
            {messages.map((message) => (
              <ListItem key={message.id} sx={{ justifyContent: message.fromMe ? "flex-end" : "flex-start" }}>
                <Box
                  sx={{
                    bgcolor: message.fromMe ? "primary.main" : "grey.200",
                    color: message.fromMe ? "primary.contrastText" : "text.primary",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: "75%",
                  }}
                >
                  <ListItemText
                    primary={message.body}
                    secondary={new Date(message.timestamp).toLocaleString()}
                    secondaryTypographyProps={{ color: message.fromMe ? "primary.contrastText" : "text.secondary" }}
                  />
                </Box>
              </ListItem>
            ))}
            {messages.length === 0 && (
              <Typography color="text.secondary">{t("noMessages")}</Typography>
            )}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}


