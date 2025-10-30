import { Box, Typography, Chip, FormControlLabel, Switch } from "@mui/material"
import { useTranslation } from "react-i18next"
import type { StoredMessage } from "../types"

type WhatsappChatHeaderProps = {
  messages: StoredMessage[]
  filterEnabled: boolean
  onFilterChange: (enabled: boolean) => void
}

export const WhatsappChatHeader = ({ messages, filterEnabled, onFilterChange }: WhatsappChatHeaderProps) => {
  const { t } = useTranslation("whatsapp")

  const deletedCount = messages.filter((msg) => msg.isDeleted).length
  const editedCount = messages.filter((msg) => msg.edition && msg.edition.length > 0).length

  return (
    <Box
      sx={{
        p: 2,
        borderBottom: 1,
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t("totalDeletedMessages")}:
          </Typography>
          <Chip label={deletedCount} size="small" color="error" variant="outlined" />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t("totalEditedMessages")}:
          </Typography>
          <Chip label={editedCount} size="small" color="primary" variant="outlined" />
        </Box>
      </Box>
      <FormControlLabel
        control={<Switch checked={filterEnabled} onChange={(e) => onFilterChange(e.target.checked)} />}
        label={t("showOnlyDeletedOrEdited")}
      />
    </Box>
  )
}

