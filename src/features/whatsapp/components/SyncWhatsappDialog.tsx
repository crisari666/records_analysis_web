import { useState, useEffect, useRef, useMemo, type JSX } from "react"
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
  Alert,
  Autocomplete,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { createSessionAsync, setQrCode, selectSelectedSessionId, selectQrCode, selectSessionError, getStoredSessionsAsync, setSessionError, clearSessionError } from "../store/whatsappSlice"
import { fetchGroups, selectGroups } from "@/features/groups/store/groupsSlice"
import { websocketService } from "@/shared/services/websocket.service"
import QRCode from "react-qr-code"

type SyncWhatsappDialogProps = {
  open: boolean
  onClose: () => void
}

type QrEventData = {
  sessionId: string
  qr: string
}

/**
 * Normalizes the WhatsApp QR payload to a string that can be rendered as a QR code.
 * WhatsApp typically sends strings like "2@XXXXX,...,1" which should be rendered as-is.
 */
const parseWhatsAppQrCode = (qrString: string): string | null => {
  if (!qrString || typeof qrString !== "string") {
    return null
  }
  return qrString.trim()
}

export const SyncWhatsappDialog = ({ open, onClose }: SyncWhatsappDialogProps): JSX.Element => {
  const { t } = useTranslation("whatsapp")
  const dispatch = useAppDispatch()
  const preselectedSessionId = useAppSelector(selectSelectedSessionId)
  const globalQrCode = useAppSelector(selectQrCode)
  const sessionError = useAppSelector(selectSessionError)
  const groups = useAppSelector(selectGroups)
  const [sessionId, setSessionId] = useState("")
  const [groupId, setGroupId] = useState<string>("")
  const [qrCode, setQrCodeLocal] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentRoomName, setCurrentRoomName] = useState<string | null>(null)
  const unsubscribeQrRef = useRef<(() => void) | null>(null)
  const unsubscribeErrorRef = useRef<(() => void) | null>(null)
  const unsubscribeReadingRef = useRef<(() => void) | null>(null)

  const groupOptions = useMemo(() => groups.map(g => ({ label: g.name, value: g._id })), [groups])

  useEffect(() => {
    if (open && groups.length === 0) {
      dispatch(fetchGroups())
    }
  }, [open, dispatch, groups.length])

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setSessionId("")
      setGroupId("")
      setQrCodeLocal(null)
      setError(null)
      setSuccess(null)
      setIsLoading(false)
      dispatch(setQrCode(null))
      dispatch(clearSessionError())

      // Leave room if joined
      if (currentRoomName && websocketService.isConnectedToServer()) {
        websocketService.leaveRoom(currentRoomName)
        setCurrentRoomName(null)
      }

      // Cleanup listeners
      if (unsubscribeQrRef.current) {
        unsubscribeQrRef.current()
        unsubscribeQrRef.current = null
      }
      if (unsubscribeErrorRef.current) {
        unsubscribeErrorRef.current()
        unsubscribeErrorRef.current = null
      }
      if (unsubscribeReadingRef.current) {
        unsubscribeReadingRef.current()
        unsubscribeReadingRef.current = null
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
      if (unsubscribeReadingRef.current) {
        unsubscribeReadingRef.current()
      }
    }
  }, [open, dispatch])

  // Prefill from Redux when opened
  useEffect(() => {
    if (open && preselectedSessionId) {
      setSessionId(preselectedSessionId)
    }
  }, [open, preselectedSessionId])

  // Auto trigger submit when opened with a preselected id and no QR yet
  useEffect(() => {
    if (open && preselectedSessionId && !isLoading && !qrCode && !globalQrCode) {
      // Avoid immediate synchronous call clashing with render
      const timer = setTimeout(() => {
        void handleSubmit()
      }, 0)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preselectedSessionId])

  const handleClose = () => {
    // Leave room if joined
    if (currentRoomName && websocketService.isConnectedToServer()) {
      websocketService.leaveRoom(currentRoomName)
      setCurrentRoomName(null)
    }

    // Cleanup
    setSessionId("")
    setGroupId("")
    setQrCodeLocal(null)
    setError(null)
    setSuccess(null)
    setIsLoading(false)
    dispatch(setQrCode(null))
    dispatch(clearSessionError())
    onClose()
  }

  const handleSubmit = async () => {

    if (!sessionId.trim()) {
      setError(t("sessionIdRequired") || "Session ID is required")
      return
    }

    if (!groupId) {
      setError(t("groupIdRequired") || "Group is required")
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
    dispatch(clearSessionError())

    const roomName = `session:${sessionId.trim()}`

    try {
      // Join room IMMEDIATELY before waiting for response
      // This ensures we receive events that the backend sends before the HTTP response
      websocketService.joinRoom(roomName)
      setCurrentRoomName(roomName)

      // Clean up any existing listeners
      if (unsubscribeQrRef.current) {
        unsubscribeQrRef.current()
        unsubscribeQrRef.current = null
      }
      if (unsubscribeErrorRef.current) {
        unsubscribeErrorRef.current()
        unsubscribeErrorRef.current = null
      }
      if (unsubscribeReadingRef.current) {
        unsubscribeReadingRef.current()
        unsubscribeReadingRef.current = null
      }

      // Listen for QR code event
      const qrHandler = (data: QrEventData) => {
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
      }

      unsubscribeQrRef.current = websocketService.on<QrEventData>("qr", qrHandler)

      // Also listen for errors
      unsubscribeErrorRef.current = websocketService.on("error", (errorData: any) => {
        if (errorData?.sessionId === sessionId.trim()) {
          const errorMessage = errorData.message || t("errorReceivingQr")
          setError(errorMessage)
          dispatch(setSessionError(errorMessage))
          setIsLoading(false)

          // Leave room on error
          if (currentRoomName && websocketService.isConnectedToServer()) {
            websocketService.leaveRoom(currentRoomName)
            setCurrentRoomName(null)
          }

          if (unsubscribeErrorRef.current) {
            unsubscribeErrorRef.current()
            unsubscribeErrorRef.current = null
          }
        }
      })

      // Listen for reading event (successful QR scan / linking)
      unsubscribeReadingRef.current = websocketService.on<{ sessionId: string }>(
        "ready",
        (data) => {
          if (data?.sessionId === sessionId.trim()) {
            setIsLoading(false)
            setSuccess(t("readingSuccess"))
            // Refresh stored sessions to update list item status
            dispatch(getStoredSessionsAsync())
            if (unsubscribeReadingRef.current) {
              unsubscribeReadingRef.current()
              unsubscribeReadingRef.current = null
            }
          }
        },
      )

      // Now create session (backend may send events before responding)
      const result = await dispatch(createSessionAsync({ id: sessionId.trim(), data: { groupId } })).unwrap()

      if (!result.success) {
        const errorMessage = result.message || t("errorCreatingSession")
        setError(errorMessage)
        dispatch(setSessionError(errorMessage))
        setIsLoading(false)

        // Leave room on error
        if (currentRoomName && websocketService.isConnectedToServer()) {
          websocketService.leaveRoom(currentRoomName)
          setCurrentRoomName(null)
        }
        return
      }

    } catch (err: any) {
      const errorMessage = err.message || t("errorCreatingSession")
      setError(errorMessage)
      dispatch(setSessionError(errorMessage))
      setIsLoading(false)

      // Leave room on error
      if (currentRoomName && websocketService.isConnectedToServer()) {
        websocketService.leaveRoom(currentRoomName)
        setCurrentRoomName(null)
      }
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("syncWhatsappTitle")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {!qrCode && (
            <>
              <TextField
                label={t("sessionId")}
                value={sessionId}
                onChange={e => setSessionId(e.target.value)}
                fullWidth
                required
                placeholder={t("sessionIdPlaceholder")}
                disabled={isLoading}
              />
              <Autocomplete
                options={groupOptions}
                value={groupOptions.find(o => o.value === groupId) || null}
                onChange={(_, val) => setGroupId(val ? val.value : "")}
                renderInput={(params) => (
                  <TextField {...params} label={t("group")} required disabled={isLoading || groups.length === 0} />
                )}
                disabled={isLoading || groups.length === 0}
              />
              {groups.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  {t("loadingGroups") || "Loading groups..."}
                </Typography>
              )}
            </>
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
              <Box sx={{ p: 1, border: "1px solid", borderColor: "divider", borderRadius: 1, backgroundColor: "whiteSmoke" }}>
                <QRCode value={qrCode} size={220} color="blue" bgColor="white" fgColor="black" />
              </Box>
              <Typography variant="body2" color="text.secondary" align="center">
                {t("qrCodeInstructions")}
              </Typography>
            </Box>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 1 }}>
              {success}
            </Alert>
          )}

          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          {sessionError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {sessionError}
            </Alert>
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
            disabled={!sessionId.trim() || !groupId || isLoading || groups.length === 0}
          >
            {t("sync")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
