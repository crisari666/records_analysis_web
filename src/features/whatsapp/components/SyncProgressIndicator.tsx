import { Box, LinearProgress, Typography, Paper } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useAppSelector } from "@/app/hooks"
import { selectSyncProgress } from "../store/whatsappSlice"
import type { JSX } from "react"

export const SyncProgressIndicator = (): JSX.Element | null => {
  const { t } = useTranslation("whatsapp")
  const syncProgress = useAppSelector(selectSyncProgress)

  if (!syncProgress) {
    return null
  }

  const { nChats, currentChat, messagesSynced } = syncProgress
  const progressPercentage = nChats > 0 ? (currentChat / nChats) * 100 : 0

  return (
    <Paper
      elevation={3}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        zIndex: 1300,
        borderRadius: 0,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 800, mx: "auto" }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t("syncProgress.syncing")} {currentChat} {t("syncProgress.of")} {nChats} {t("syncProgress.chats")}
        </Typography>
        <LinearProgress variant="determinate" value={progressPercentage} sx={{ mb: 1, height: 8, borderRadius: 4 }} />
        <Typography variant="caption" color="text.secondary">
          {t("syncProgress.messagesSynced")}: {messagesSynced}
        </Typography>
      </Box>
    </Paper>
  )
}
