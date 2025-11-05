import { useEffect, useState, type JSX } from "react"
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
  IconButton,
  type ChipProps,
} from "@mui/material"
import { Edit as EditIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  getStoredSessionsAsync,
  selectStoredSessions,
  selectIsLoading,
  selectError,
  openSyncDialog,
} from "../store/whatsappSlice"
import { fetchGroups, selectGroups } from "@/features/groups/store/groupsSlice"
import { UpdateSessionGroupModal } from "./UpdateSessionGroupModal"
import type { StoredSession } from "../types"

export const StoredSessionsList = (): JSX.Element => {
  const { t } = useTranslation("whatsapp")
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const storedSessions = useAppSelector(selectStoredSessions)
  const isLoading = useAppSelector(selectIsLoading)
  const error = useAppSelector(selectError)
  const groups = useAppSelector(selectGroups)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<StoredSession | null>(null)

  useEffect(() => {
    dispatch(getStoredSessionsAsync())
    dispatch(fetchGroups())
  }, [dispatch])

  const getGroupName = (refId: string | undefined): string => {
    if (!refId) return t("noGroup") || "No Group"
    const group = groups.find(g => g._id === refId)
    return group?.name || refId
  }

  const handleUpdateGroup = (e: React.MouseEvent, session: StoredSession) => {
    e.stopPropagation()
    setSelectedSession(session)
    setUpdateModalOpen(true)
  }

  const handleCloseModal = () => {
    setUpdateModalOpen(false)
    setSelectedSession(null)
    dispatch(getStoredSessionsAsync())
  }

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
    <>
      <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t("sessionId")}</TableCell>
            <TableCell>{t("status")}</TableCell>
            <TableCell>{t("group")}</TableCell>
            <TableCell>{t("lastSeen")}</TableCell>
            <TableCell>{t("createdAt")}</TableCell>
            <TableCell>{t("updatedAt")}</TableCell>
            <TableCell>{t("actions") || "Actions"}</TableCell>
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
                  {getGroupName(session.refId)}
                </Typography>
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
              <TableCell>
                <IconButton
                  size="small"
                  onClick={(e) => handleUpdateGroup(e, session)}
                  aria-label={t("updateGroup") || "Update Group"}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </TableContainer>
      <UpdateSessionGroupModal
        open={updateModalOpen}
        onClose={handleCloseModal}
        session={selectedSession}
      />
    </>
  )
}
