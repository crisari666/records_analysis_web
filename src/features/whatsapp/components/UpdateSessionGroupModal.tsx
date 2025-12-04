import { useState, useEffect, useMemo, type JSX } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  Autocomplete,
  TextField,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { updateSessionGroupAsync, selectIsLoading, selectError, clearError } from "../store/whatsappSlice"
import { fetchGroups, selectGroups } from "@/features/groups/store/groupsSlice"
import type { StoredSession } from "../types"

type UpdateSessionGroupModalProps = {
  open: boolean
  onClose: () => void
  session: StoredSession | null
}

export const UpdateSessionGroupModal = ({ open, onClose, session }: UpdateSessionGroupModalProps): JSX.Element => {
  const { t } = useTranslation("whatsapp")
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(selectIsLoading)
  const error = useAppSelector(selectError)
  const groups = useAppSelector(selectGroups)
  
  const [groupId, setGroupId] = useState<string>("")

  const groupOptions = useMemo(() => groups.map(g => ({ label: g.name, value: g._id })), [groups])

  useEffect(() => {
    if (open && groups.length === 0) {
      console.log("fetching groups in update session group modal")
      dispatch(fetchGroups())
    }
  }, [open, dispatch])

  useEffect(() => {
    if (open && session) {
      setGroupId(session.refId || "")
    }
  }, [open, session])

  useEffect(() => {
    if (!open) {
      setGroupId("")
      dispatch(clearError())
    }
  }, [open, dispatch])

  const handleClose = () => {
    if (!isLoading) {
      dispatch(clearError())
      onClose()
    }
  }

  const handleSubmit = async () => {
    if (!session || !groupId) {
      return
    }

    try {
      await dispatch(updateSessionGroupAsync({ id: session.sessionId, data: { groupId } })).unwrap()
      onClose()
      // Optionally refresh stored sessions to show updated refId
    } catch (err) {
      // Error is handled by Redux state
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("updateSessionGroup") || "Update Session Group"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          {session && (
            <TextField
              label={t("sessionId")}
              value={session.sessionId}
              fullWidth
              disabled
              variant="outlined"
            />
          )}

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
            <Alert severity="info">
              {t("loadingGroups") || "Loading groups..."}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          {t("cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!groupId || isLoading || groups.length === 0}
        >
          {isLoading ? (t("loading") || "Loading...") : (t("save") || "Save")}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

