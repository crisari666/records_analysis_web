import { ListItem, Box, Typography, Chip, Tooltip, ListItemText, Button } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import DownloadIcon from "@mui/icons-material/Download"
import DescriptionIcon from "@mui/icons-material/Description"
import { useTranslation } from "react-i18next"
import type { StoredMessage } from "../../types"
import { getMediaUrl, formatFileSize } from "./utils"

type DocumentMessageProps = {
  message: StoredMessage
}

export const DocumentMessage = ({ message }: DocumentMessageProps) => {
  const { t } = useTranslation("whatsapp")
  const mediaUrl = getMediaUrl(message.mediaPath)

  const handleDownload = () => {
    if (mediaUrl) {
      window.open(mediaUrl, "_blank")
    }
  }

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
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DescriptionIcon sx={{ fontSize: 40 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {message.mediaFilename || t("document")}
            </Typography>
            {message.mediaSize && (
              <Typography variant="caption" sx={{ display: "block" }}>
                {formatFileSize(message.mediaSize)}
              </Typography>
            )}
          </Box>
          {mediaUrl && (
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              size="small"
              variant="outlined"
              sx={{
                color: message.isDeleted
                  ? "error.contrastText"
                  : message.fromMe
                    ? "primary.contrastText"
                    : "text.primary",
                borderColor: message.isDeleted
                  ? "error.contrastText"
                  : message.fromMe
                    ? "primary.contrastText"
                    : "text.primary",
              }}
            >
              {t("download")}
            </Button>
          )}
        </Box>
        {message.body && (
          <ListItemText
            primary={message.body}
            primaryTypographyProps={{
              sx: { wordBreak: "break-word" },
            }}
          />
        )}
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
      </Box>
    </ListItem>
  )
}

