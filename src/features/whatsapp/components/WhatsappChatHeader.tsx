import { useState } from "react"
import { Box, Typography, Chip, FormControlLabel, Switch, Button, CircularProgress, Snackbar, Alert } from "@mui/material"
import SyncIcon from "@mui/icons-material/Sync"
import { useTranslation } from "react-i18next"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { selectSessionId, selectIsSyncing, selectCurrentChat, selectCurrentProject, getChatMessagesAsync } from "../store/whatsappSessionSlice"
import { ConversationAnalysis } from "./ConversationAnalysis"
import type { StoredMessage } from "../types"

type WhatsappChatHeaderProps = {
  messages: StoredMessage[]
  filterEnabled: boolean
  onFilterChange: (enabled: boolean) => void
}

export const WhatsappChatHeader = ({ messages, filterEnabled, onFilterChange }: WhatsappChatHeaderProps) => {
  const { t } = useTranslation("whatsapp")
  const dispatch = useAppDispatch()
  const sessionId = useAppSelector(selectSessionId)
  const currentChat = useAppSelector(selectCurrentChat)
  const currentProject = useAppSelector(selectCurrentProject)
  const isSyncing = useAppSelector(selectIsSyncing)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success")

  const deletedCount = messages.filter((msg) => msg.isDeleted).length
  const editedCount = messages.filter((msg) => msg.edition && msg.edition.length > 0).length

  const handleSyncMessages = async () => {
    if (sessionId && currentChat && !isSyncing) {
      try {
        await dispatch(getChatMessagesAsync({ id: sessionId, chatId: currentChat.chatId })).unwrap()
        // Sync completed successfully
        setSnackbarMessage(t("syncMessagesSuccess"))
        setSnackbarSeverity("success")
        setSnackbarOpen(true)
      } catch (err) {
        // Sync failed
        const errorMessage = err instanceof Error ? err.message : "Failed to sync messages"
        setSnackbarMessage(errorMessage)
        setSnackbarSeverity("error")
        setSnackbarOpen(true)
      }
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false)
  }

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: 1,
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t("totalDeletedMessages")}:
          </Typography>
          <Chip label={deletedCount} size="small" color="error" variant="outlined" />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t("totalEditedMessages")}:
          </Typography>
          <Chip label={editedCount} size="small" color="primary" variant="outlined" />
        </Box>
      </Box>

      {currentChat?.analysis && currentProject?.config && (
        <ConversationAnalysis analysis={currentChat.analysis} config={currentProject.config} />
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {isSyncing ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2, py: 0.5 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              {t("syncingMessages")}
            </Typography>
          </Box>
        ) : (
          <Button
            variant="outlined"
            startIcon={<SyncIcon />}
            onClick={handleSyncMessages}
            disabled={!sessionId || !currentChat}
            size="small"
          >
            {t("syncMessages")}
          </Button>
        )}
        <FormControlLabel
          control={<Switch checked={filterEnabled} onChange={(e) => onFilterChange(e.target.checked)} />}
          label={t("showOnlyDeletedOrEdited")}
        />
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

