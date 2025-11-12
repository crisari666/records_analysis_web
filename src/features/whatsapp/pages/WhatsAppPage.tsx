import { useEffect, type JSX } from "react"
import { Box, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { StoredSessionsList, WhatsappControls, SyncWhatsappDialog } from "../components"
import { websocketService } from "@/shared/services/websocket.service"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { closeSyncDialog, selectIsSyncDialogOpen } from "../store/whatsappSlice"

export const WhatsAppPage = (): JSX.Element => {
  const { t } = useTranslation("whatsapp")
  const dispatch = useAppDispatch()
  const isSyncDialogOpen = useAppSelector(selectIsSyncDialogOpen)

  useEffect(() => {
    // Connect to WebSocket when component mounts
    const wsUrl = import.meta.env.VITE_AI_CONVERSATION_WEBSOCKET.replace(/^http/, "ws")
    

    if (wsUrl && !websocketService.isConnectedToServer()) {
      websocketService.connect(wsUrl)
    }

    // Cleanup: Disconnect when component unmounts
    return () => {
      if (websocketService.isConnectedToServer()) {
        websocketService.disconnect()
      }
    }
  }, [])

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {t("title")}
      </Typography>

      <WhatsappControls />
      <StoredSessionsList />
      <SyncWhatsappDialog open={isSyncDialogOpen} onClose={() => dispatch(closeSyncDialog())} />
    </Box>
  )
}
