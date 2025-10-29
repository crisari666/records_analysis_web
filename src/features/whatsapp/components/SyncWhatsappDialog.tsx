import { useState, useEffect, useRef, type JSX } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useAppDispatch } from "@/app/hooks"
import { createSessionAsync, setQrCode } from "../store/whatsappSlice"
import { websocketService } from "@/shared/services/websocket.service"

type SyncWhatsappDialogProps = {
  open: boolean
  onClose: () => void
}

type QrEventData = {
  sessionId: string
  qr: string
}

/**
 * Parses WhatsApp QR code format and converts it to a data URL for image display
 * WhatsApp QR format: "2@base64part1,base64part2,base64part3,base64part4,1"
 * @param qrString - The QR code string from WhatsApp
 * @returns Data URL string for image display, or null if parsing fails
 */
const parseWhatsAppQrCode = (qrString: string): string | null => {
  try {
    // WhatsApp QR format is: "version@base64part1,base64part2,...,lastpart,version"
    // Example: "2@base64part1,base64part2,base64part3,base64part4,1"
    
    if (!qrString || typeof qrString !== 'string') {
      return null
    }

    // Check if it's already a data URL
    if (qrString.startsWith('data:image')) {
      return qrString
    }

    // Check if it contains the @ symbol (WhatsApp multi-part format)
    if (qrString.includes('@')) {
      // Extract the base64 parts (everything after @, excluding the last version number)
      const parts = qrString.split('@')[1].split(',')
      
      // Remove the last element if it's just a number (version indicator)
      const lastPart = parts[parts.length - 1]
      if (/^\d+$/.test(lastPart)) {
        parts.pop()
      }
      
      // Join all base64 parts
      const base64Data = parts.join('')
      
      // Convert to data URL
      return `data:image/png;base64,${base64Data}`
    }

    // If no @ symbol, assume it's already a base64 string (maybe single-part format)
    // Try to use it directly as base64
    if (qrString.includes(',')) {
      // Handle comma-separated format without @
      const parts = qrString.split(',')
      const base64Data = parts.join('')
      return `data:image/png;base64,${base64Data}`
    }

    // Assume it's a plain base64 string
    return `data:image/png;base64,${qrString}`
  } catch (error) {
    console.error('Error parsing QR code:', error)
    return null
  }
}

export const SyncWhatsappDialog = ({ open, onClose }: SyncWhatsappDialogProps): JSX.Element => {
  const { t } = useTranslation("whatsapp")
  const dispatch = useAppDispatch()
  const [sessionId, setSessionId] = useState("")
  const [qrCode, setQrCodeLocal] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const unsubscribeQrRef = useRef<(() => void) | null>(null)
  const unsubscribeErrorRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setSessionId("")
      setQrCodeLocal(null)
      setError(null)
      setIsLoading(false)
      dispatch(setQrCode(null))
      
      // Cleanup listeners
      if (unsubscribeQrRef.current) {
        unsubscribeQrRef.current()
        unsubscribeQrRef.current = null
      }
      if (unsubscribeErrorRef.current) {
        unsubscribeErrorRef.current()
        unsubscribeErrorRef.current = null
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (unsubscribeQrRef.current) {
        unsubscribeQrRef.current()
      }
      if (unsubscribeErrorRef.current) {
        unsubscribeErrorRef.current()
      }
    }
  }, [open, dispatch])

  const handleClose = () => {
    // Cleanup
    setSessionId("")
    setQrCodeLocal(null)
    setError(null)
    setIsLoading(false)
    dispatch(setQrCode(null))
    onClose()
  }

  const handleSubmit = async () => {
    if (!sessionId.trim()) {
      return
    }

    // Check if WebSocket is connected
    if (!websocketService.isConnectedToServer()) {
      setError(t("websocketNotConnected"))
      return
    }

    setIsLoading(true)
    setError(null)
    setQrCodeLocal(null)

    try {
      // Create session
      const result = await dispatch(createSessionAsync(sessionId.trim())).unwrap()
      
      if (!result.success) {
        setError(result.message || t("errorCreatingSession"))
        setIsLoading(false)
        return
      }

      // Join room with sessionId to receive events for this specific session
      websocketService.joinRoom(sessionId.trim())

      // Clean up any existing listeners
      if (unsubscribeQrRef.current) {
        unsubscribeQrRef.current()
      }
      if (unsubscribeErrorRef.current) {
        unsubscribeErrorRef.current()
      }

      // Listen for QR code event
      unsubscribeQrRef.current = websocketService.on<QrEventData>("qr", (data) => {
        // Verify the sessionId matches
        if (data.sessionId === sessionId.trim() && data.qr) {
          // Parse the QR code string and convert to displayable format
          const parsedQr = parseWhatsAppQrCode(data.qr)
          if (parsedQr) {
            setQrCodeLocal(parsedQr)
            dispatch(setQrCode(parsedQr))
            setIsLoading(false)
            if (unsubscribeQrRef.current) {
              unsubscribeQrRef.current()
              unsubscribeQrRef.current = null
            }
          } else {
            setError(t("errorParsingQr") || "Failed to parse QR code")
            setIsLoading(false)
          }
        }
      })

      // Also listen for errors
      unsubscribeErrorRef.current = websocketService.on("error", (errorData: any) => {
        if (errorData?.sessionId === sessionId.trim()) {
          setError(errorData.message || t("errorReceivingQr"))
          setIsLoading(false)
          if (unsubscribeErrorRef.current) {
            unsubscribeErrorRef.current()
            unsubscribeErrorRef.current = null
          }
        }
      })

    } catch (err: any) {
      setError(err.message || t("errorCreatingSession"))
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("syncWhatsappTitle")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {!qrCode && (
            <TextField
              label={t("sessionId")}
              value={sessionId}
              onChange={e => setSessionId(e.target.value)}
              fullWidth
              required
              placeholder={t("sessionIdPlaceholder")}
              disabled={isLoading}
            />
          )}

          {isLoading && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 3 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                {t("creatingSession")}
              </Typography>
            </Box>
          )}

          {qrCode && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 2 }}>
              <Typography variant="h6">{t("scanQrCode")}</Typography>
              <Box
                component="img"
                src={qrCode}
                alt="QR Code"
                sx={{
                  maxWidth: "100%",
                  height: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                  backgroundColor: "background.paper",
                }}
              />
              <Typography variant="body2" color="text.secondary" align="center">
                {t("qrCodeInstructions")}
              </Typography>
            </Box>
          )}

          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          {t("cancel")}
        </Button>
        {!qrCode && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!sessionId.trim() || isLoading}
          >
            {t("sync")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
