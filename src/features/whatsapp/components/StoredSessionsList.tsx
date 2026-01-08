import { useEffect, useState, useMemo, type JSX } from "react"
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
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  getStoredSessionsAsync,
  selectStoredSessions,
  selectIsLoading,
  selectError,
  openSyncDialog,
} from "../store/whatsappSlice"
import {
  fetchGroups,
  selectGroups,
} from "@/features/groups/store/groupsSlice"
import {
  selectFilterGroupId,
} from "../store/whatsappSlice"
import { UpdateSessionGroupModal } from "./UpdateSessionGroupModal"
import { DestroySessionModal } from "./DestroySessionModal"
import type { StoredSession } from "../types"

export const StoredSessionsList = (): JSX.Element => {
  const { t } = useTranslation("whatsapp")
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const storedSessions = useAppSelector(selectStoredSessions)
  const isLoading = useAppSelector(selectIsLoading)
  const error = useAppSelector(selectError)
  const groups = useAppSelector(selectGroups)
  const filterGroupId = useAppSelector(selectFilterGroupId)
  const [updateModalOpen, setUpdateModalOpen] = useState(false)
  const [destroyModalOpen, setDestroyModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<StoredSession | null>(null)

  useEffect(() => {
    dispatch(getStoredSessionsAsync())
  }, [dispatch])

  useEffect(() => {
    if (groups.length === 0) {
      dispatch(fetchGroups())
    }
  }, [dispatch, groups.length])

  const filteredSessions = useMemo(() => {
    if (!filterGroupId) {
      return storedSessions
    }
    
    return storedSessions.filter(session => 
      session.refId === filterGroupId
    )
  }, [storedSessions, filterGroupId])

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

  const handleDestroySession = (e: React.MouseEvent, session: StoredSession) => {
    e.stopPropagation()
    setSelectedSession(session)
    setDestroyModalOpen(true)
  }

  const handleCloseUpdateModal = () => {
    setUpdateModalOpen(false)
    setSelectedSession(null)
    dispatch(getStoredSessionsAsync())
  }

  const handleCloseDestroyModal = () => {
    setDestroyModalOpen(false)
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

  if (filteredSessions.length === 0) {
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
            <TableCell>{t("sessionTitle")}</TableCell>
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
          {filteredSessions.map((session) => (
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
                  {session.title}
                </Typography>
              </TableCell>
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
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => handleUpdateGroup(e, session)}
                    aria-label={t("updateGroup") || "Update Group"}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleDestroySession(e, session)}
                    aria-label={t("destroySession") || "Destroy Session"}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </TableContainer>
      <UpdateSessionGroupModal
        open={updateModalOpen}
        onClose={handleCloseUpdateModal}
        session={selectedSession}
      />
      <DestroySessionModal
        open={destroyModalOpen}
        onClose={handleCloseDestroyModal}
        session={selectedSession}
      />
    </>
  )
}
