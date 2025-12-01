import { useState, useRef } from "react"
import { ListItem, Box, Typography, Chip, Tooltip, ListItemText, IconButton, Slider } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import PauseIcon from "@mui/icons-material/Pause"
import { useTranslation } from "react-i18next"
import type { StoredMessage } from "../../types"
import { getMediaUrl, formatFileSize } from "./utils"

type AudioMessageProps = {
  message: StoredMessage
}

export const AudioMessage = ({ message }: AudioMessageProps) => {
  const { t } = useTranslation("whatsapp")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaUrl = getMediaUrl(message.mediaPath)

  const handlePlayPause = () => {
    if (!audioRef.current) {
      const audio = new Audio(mediaUrl || undefined)
      audioRef.current = audio
      
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration)
      })
      
      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime)
      })
      
      audio.addEventListener("ended", () => {
        setIsPlaying(false)
        setCurrentTime(0)
      })
    }

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (_event: Event, newValue: number | number[]) => {
    if (audioRef.current && typeof newValue === "number") {
      audioRef.current.currentTime = newValue
      setCurrentTime(newValue)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
        {mediaUrl && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: "200px" }}>
            <IconButton
              onClick={handlePlayPause}
              sx={{
                color: message.isDeleted
                  ? "error.contrastText"
                  : message.fromMe
                    ? "primary.contrastText"
                    : "text.primary",
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Slider
                value={currentTime}
                max={duration || 100}
                onChange={handleSeek}
                size="small"
                sx={{
                  color: message.isDeleted
                    ? "error.contrastText"
                    : message.fromMe
                      ? "primary.contrastText"
                      : "primary.main",
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                <Typography variant="caption">
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="caption">
                  {formatTime(duration)}
                </Typography>
                {message.mediaSize && (
                  <Typography variant="caption">
                    {formatFileSize(message.mediaSize)}
                  </Typography>
                )}
              </Box>
            </Box>
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

