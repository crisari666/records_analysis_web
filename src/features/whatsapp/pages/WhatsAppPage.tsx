import type { JSX } from "react"
import { Box, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { WhatsappControls } from "../components"

export const WhatsAppPage = (): JSX.Element => {
  const { t } = useTranslation("whatsapp")

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {t("title")}
      </Typography>

      <WhatsappControls />
    </Box>
  )
}

