import { useState, type JSX } from "react"
import {
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material"
import { Sync as SyncIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"

export const WhatsappControls = (): JSX.Element => {
  const { t } = useTranslation("whatsapp")
  const [modalOpen, setModalOpen] = useState(false)
  const [sessionId, setSessionId] = useState("")

  const handleSyncWhatsapp = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSessionId("")
  }

  const handleSubmit = () => {
    if (!sessionId.trim()) {
      return
    }

    // TODO: Implement synchronization logic here
    console.log("Synchronizing WhatsApp with session ID:", sessionId)
    
    handleCloseModal()
  }

  return (
    <>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<SyncIcon />}
          onClick={handleSyncWhatsapp}
          sx={{ minWidth: 150 }}
        >
          {t("syncWhatsapp")}
        </Button>
      </Box>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{t("syncWhatsappTitle")}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label={t("sessionId")}
              value={sessionId}
              onChange={e => setSessionId(e.target.value)}
              fullWidth
              required
              placeholder={t("sessionIdPlaceholder")}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>{t("cancel")}</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!sessionId.trim()}
          >
            {t("sync")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
