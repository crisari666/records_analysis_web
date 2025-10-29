import { useEffect, type JSX } from "react"
import { Box, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { StoredSessionsList, WhatsappControls } from "../components"
import { websocketService } from "@/shared/services/websocket.service"

export const WhatsAppPage = (): JSX.Element => {
  const { t } = useTranslation("whatsapp")

  useEffect(() => {
    // Connect to WebSocket when component mounts
    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL.replace(/^http/, "ws")
    

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
    </Box>
  )
}
