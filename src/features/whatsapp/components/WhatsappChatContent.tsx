import { useState, useMemo } from "react"
import { Card, CardContent, List, ListItem, ListItemText, Box, Typography, Chip, Tooltip } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import { useTranslation } from "react-i18next"
import { useAppSelector } from "@/app/hooks"
import { selectCurrentChat, selectIsMessagesLoading, selectMessages } from "../store/whatsappSessionSlice"
import { WhatsappChatHeader } from "./WhatsappChatHeader"

export const WhatsappChatContent = () => {
  const { t } = useTranslation("whatsapp")
  const messages = useAppSelector(selectMessages)
  const currentChat = useAppSelector(selectCurrentChat)
  const isLoading = useAppSelector(selectIsMessagesLoading)
  const [filterEnabled, setFilterEnabled] = useState(false)

  const filteredMessages = useMemo(() => {
    if (!filterEnabled) return messages
    return messages.filter((msg) => msg.isDeleted || (msg.edition && msg.edition.length > 0))
  }, [messages, filterEnabled])

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
          <>
            <WhatsappChatHeader
              messages={messages}
              filterEnabled={filterEnabled}
              onFilterChange={setFilterEnabled}
            />
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              <List>
              {filteredMessages.map((message) => (
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
                      <Box>
                        <Typography variant="caption" component="span" sx={{ display: "block" }}>
                          {new Date(message.timestamp * 1000).toLocaleString()}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5, mt: 0.5, flexWrap: "wrap" }}>
                          {message.edition && message.edition.length > 0 && (
                            <Tooltip
                              title={
                                <Box>
                                  <Typography variant="caption" sx={{ display: "block", fontWeight: "bold", mb: 0.5 }}>
                                    {t("messageEditions")}:
                                  </Typography>
                                  {message.edition.map((edition, index) => (
                                    <Typography key={index} variant="caption" sx={{ display: "block" }}>
                                      {index + 1}. {edition}
                                    </Typography>
                                  ))}
                                </Box>
                              }
                            >
                              <Chip
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
            ))}
              {filteredMessages.length === 0 && (
                <Typography color="text.secondary">{t("noMessages")}</Typography>
              )}
              </List>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  )
}


