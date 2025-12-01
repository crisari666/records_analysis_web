import { ListItem, Box, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"

type DeletionMarkerProps = {
  timestamp: number
  deletedAt: string
  index: number
}

export const DeletionMarker = ({ timestamp, deletedAt, index }: DeletionMarkerProps) => {
  const { t } = useTranslation("whatsapp")

  return (
    <ListItem 
      key={`deletion-${timestamp}-${index}`} 
      sx={{ 
        width: "100%",
        justifyContent: "center",
        py: 1
      }}
    >
      <Box
        sx={{
          bgcolor: "error.main",
          color: "error.contrastText",
          px: 2,
          py: 1,
          borderRadius: 2,
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "medium" }}>
          {t("chatDeleted")}
        </Typography>
        <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
          {new Date(deletedAt).toLocaleString()}
        </Typography>
      </Box>
    </ListItem>
  )
}

