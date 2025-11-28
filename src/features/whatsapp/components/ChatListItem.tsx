import { Box, Typography, Chip, ListItem, ListItemButton, ListItemText } from "@mui/material"
import { useTranslation } from "react-i18next"
import type { StoredChat } from "../types"

type ChatListItemProps = {
  chat: StoredChat
  isSelected: boolean
  onSelect: (chat: StoredChat) => void
}

export const ChatListItem = ({ chat, isSelected, onSelect }: ChatListItemProps) => {
  const { t } = useTranslation("whatsapp")

  return (
    <ListItem key={chat.chatId} divider disablePadding>
      <ListItemButton
        onClick={() => onSelect(chat)}
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
}

