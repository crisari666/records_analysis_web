import { useState, useEffect, type JSX } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Alert,
  TextField,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useSnackbar } from "notistack"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { destroySessionAsync, selectIsLoading, selectError, clearError } from "../store/whatsappSlice"
import { selectUser } from "@/features/auth/store/authSlice"
import type { StoredSession } from "../types"

type DestroySessionModalProps = {
  open: boolean
  onClose: () => void
  session: StoredSession | null
}

const CONFIRMATION_TEXT = "REMOVE"

export const DestroySessionModal = ({ open, onClose, session }: DestroySessionModalProps): JSX.Element => {
  const { t } = useTranslation("whatsapp")
  const { enqueueSnackbar } = useSnackbar()
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(selectIsLoading)
  const error = useAppSelector(selectError)
  const currentUser = useAppSelector(selectUser)
  const [confirmationText, setConfirmationText] = useState("")
  
  const canDestroySession = currentUser?.role === 'root' || currentUser?.role === 'admin'

  useEffect(() => {
    if (!open) {
      setConfirmationText("")
      dispatch(clearError())
    }
  }, [open, dispatch])

  const handleClose = () => {
    if (!isLoading) {
      dispatch(clearError())
      onClose()
    }
  }

  const handleDestroy = async () => {
    if (!session || confirmationText !== CONFIRMATION_TEXT) {
      return
    }

    if (!canDestroySession) {
      enqueueSnackbar(t("destroySessionUnauthorized") || "You don't have permission to destroy sessions", {
        variant: "error",
        autoHideDuration: 5000,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
      })
      return
    }

    try {
      await dispatch(destroySessionAsync(session.sessionId)).unwrap()
      enqueueSnackbar(t("destroySessionSuccess"), {
        variant: "success",
        autoHideDuration: 5000,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
      })
      onClose()
    } catch (err) {
      // Error is handled by Redux state
      const errorMessage = err instanceof Error ? err.message : error || t("error")
      enqueueSnackbar(errorMessage, {
        variant: "error",
        autoHideDuration: 5000,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
      })
    }
  }

  const isConfirmValid = confirmationText === CONFIRMATION_TEXT && canDestroySession

  // If user doesn't have permission, show error and close modal
  useEffect(() => {
    if (open && !canDestroySession) {
      enqueueSnackbar(t("destroySessionUnauthorized") || "You don't have permission to destroy sessions", {
        variant: "error",
        autoHideDuration: 5000,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
      })
      onClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, canDestroySession])

  if (!canDestroySession) {
    return <></>
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("destroySessionTitle")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          <DialogContentText>
            {t("destroySessionMessage")}
          </DialogContentText>

          {session && (
            <Box sx={{ p: 2, bgcolor: "background.default", borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                {t("sessionTitle")}: {session.title || session.sessionId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("sessionId")}: {session.sessionId}
              </Typography>
            </Box>
          )}

          <TextField
            label={t("destroySessionConfirmationLabel")}
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder={CONFIRMATION_TEXT}
            helperText={t("destroySessionConfirmationHelper")}
            disabled={isLoading}
            autoFocus
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          {t("cancel")}
        </Button>
        <Button
          onClick={handleDestroy}
          variant="contained"
          color="error"
          disabled={!isConfirmValid || isLoading}
        >
          {isLoading ? (t("loading") || "Loading...") : (t("destroy") || "Destroy")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

