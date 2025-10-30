import { useEffect, type JSX } from "react"
import { useNavigate } from "react-router-dom"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  CircularProgress,
  Alert,
  type ChipProps,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  getStoredSessionsAsync,
  selectStoredSessions,
  selectIsLoading,
  selectError,
} from "../store/whatsappSlice"
import { openSyncDialog } from "../store/whatsappSlice"

export const StoredSessionsList = (): JSX.Element => {
  const { t } = useTranslation("whatsapp")
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const storedSessions = useAppSelector(selectStoredSessions)
  const isLoading = useAppSelector(selectIsLoading)
  const error = useAppSelector(selectError)

  useEffect(() => {
    dispatch(getStoredSessionsAsync())
  }, [dispatch])

  const getStatusColor = (status: string): ChipProps["color"] => {
    switch (status) {
      case "ready":
        return "success"
      case "authenticated":
        return "info"
      case "qr_generated":
        return "warning"
      case "initializing":
        return "default"
      case "disconnected":
        return "error"
      case "auth_failure":
        return "error"
      case "error":
        return "error"
      default:
        return "default"
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          {t("loading")}
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {t("error")}: {error}
      </Alert>
    )
  }

  if (storedSessions.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">
          {t("noSessions")}
        </Typography>
      </Box>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t("sessionId")}</TableCell>
            <TableCell>{t("status")}</TableCell>
            <TableCell>{t("lastSeen")}</TableCell>
            <TableCell>{t("createdAt")}</TableCell>
            <TableCell>{t("updatedAt")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {storedSessions.map((session) => (
            <TableRow
              key={session.sessionId}
              hover
              onClick={() => {
                const status = session.status
                const isReady = status === "ready" || status === "authenticated"
                if (isReady) {
                  navigate(`/dashboard/whatsapp/sessions/${session.sessionId}/chats`)
                } else {
                  dispatch(openSyncDialog(session.sessionId))
                }
              }}
              sx={{ cursor: "pointer" }}
            >
              <TableCell>
                <Typography variant="body2" fontFamily="monospace">
                  {session.sessionId}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={session.status}
                  size="small"
                  color={getStatusColor(session.status)}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {new Date(session.lastSeen).toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {new Date(session.createdAt).toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {new Date(session.updatedAt).toLocaleString()}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
