import { ListItem, Box, Typography, Chip, Tooltip, ListItemText } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import { useTranslation } from "react-i18next"
import type { StoredMessage } from "../../types"

type TextMessageProps = {
  message: StoredMessage
}

export const TextMessage = ({ message }: TextMessageProps) => {
  const { t } = useTranslation("whatsapp")

  return (
    <ListItem
      key={message.messageId}
      data-message-id={message.messageId}
      sx={{
        justifyContent: message.fromMe ? "flex-end" : "flex-start",
      }}
    >
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
}

