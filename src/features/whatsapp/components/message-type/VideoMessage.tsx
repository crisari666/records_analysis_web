import { useState } from "react"
import { ListItem, Box, Typography, Chip, Tooltip, ListItemText, IconButton } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import { useTranslation } from "react-i18next"
import type { StoredMessage } from "../../types"
import { getMediaUrl, formatFileSize } from "./utils"

type VideoMessageProps = {
  message: StoredMessage
}

export const VideoMessage = ({ message }: VideoMessageProps) => {
  const { t } = useTranslation("whatsapp")
  const [isPlaying, setIsPlaying] = useState(false)
  const mediaUrl = getMediaUrl(message.mediaPath)

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
        }}
      >
        {mediaUrl && (
          <Box sx={{ position: "relative", mb: message.body ? 1 : 0 }}>
            {!isPlaying ? (
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "400px",
                  height: "auto",
                  bgcolor: "rgba(0, 0, 0, 0.5)",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "200px",
                  position: "relative",
                }}
              >
                <IconButton
                  onClick={() => setIsPlaying(true)}
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.3)" },
                  }}
                >
                  <PlayArrowIcon sx={{ fontSize: 48 }} />
                </IconButton>
                {message.mediaSize && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      color: "white",
                      bgcolor: "rgba(0, 0, 0, 0.6)",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    {formatFileSize(message.mediaSize)}
                  </Typography>
                )}
              </Box>
            ) : (
              <Box
                component="video"
                src={mediaUrl}
                controls
                sx={{
                  maxWidth: "100%",
                  maxHeight: "400px",
                  borderRadius: 1,
                }}
                onError={(e) => {
                  const target = e.target as HTMLVideoElement
                  target.style.display = "none"
                }}
              />
            )}
          </Box>
        )}
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

