import { useState, type JSX } from "react"
import { Button, Box } from "@mui/material"
import { Sync as SyncIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { SyncWhatsappDialog } from "./SyncWhatsappDialog"

export const WhatsappControls = (): JSX.Element => {
  const { t } = useTranslation("whatsapp")
  const [modalOpen, setModalOpen] = useState(false)

  const handleSyncWhatsapp = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
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

      <SyncWhatsappDialog open={modalOpen} onClose={handleCloseModal} />
    </>
  )
}
