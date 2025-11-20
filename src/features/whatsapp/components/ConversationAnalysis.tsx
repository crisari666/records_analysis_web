import { useState } from "react"
import { Box, Typography, Tooltip, Modal, Paper, IconButton, Grid, Divider } from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import CloseIcon from "@mui/icons-material/Close"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import NotesIcon from "@mui/icons-material/Notes"
import { useTranslation } from "react-i18next"

type ConversationAnalysisProps = {
  analysis: Record<string, any> | undefined
  config: any // Using any because the config structure is flexible based on user JSON
}

export const ConversationAnalysis = ({ analysis, config }: ConversationAnalysisProps) => {
  const { t } = useTranslation("whatsapp")
  const [open, setOpen] = useState(false)

  if (!analysis || !config || !config.fields) {
    return null
  }

  const fields = config.fields as Record<string, string>

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const renderIndicator = (key: string, value: any, description: string) => {
    // Infer type from description or value
    const isBoolean = description.toLowerCase().includes("boolean") || typeof value === "boolean"
    const isNumber = description.toLowerCase().includes("number") || typeof value === "number"

    let content = null
    let icon = <HelpOutlineIcon fontSize="small" color="action" />

    if (isBoolean) {
      if (value === true) {
        icon = <CheckCircleIcon fontSize="small" color="success" />
        content = <Typography variant="caption" sx={{ fontWeight: "bold", color: "success.main" }}>{key}</Typography>
      } else if (value === false) {
        icon = <CancelIcon fontSize="small" color="error" />
        content = <Typography variant="caption" sx={{ fontWeight: "bold", color: "error.main" }}>{key}</Typography>
      } else {
        // Null or undefined for boolean might mean "not determined"
        content = <Typography variant="caption" color="text.secondary">{key}</Typography>
      }
    } else if (isNumber) {
      icon = <AttachMoneyIcon fontSize="small" color="primary" />
      content = (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="caption" fontWeight="bold">
            {value !== null ? value : "-"}
          </Typography>
        </Box>
      )
    } else {
      // String or other
      icon = <NotesIcon fontSize="small" color="info" />
      content = (
        <Typography variant="caption" sx={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || "-"}
        </Typography>
      )
    }

    return (
      <Tooltip key={key} title={`${key}: ${description} \n Value: ${JSON.stringify(value)}`} arrow>
        <Box
          onClick={handleOpen}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            cursor: "pointer",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            px: 1,
            py: 0.5,
            bgcolor: "background.paper",
            '&:hover': {
              bgcolor: "action.hover"
            }
          }}
        >
          {icon}
          {content}
        </Box>
      </Tooltip>
    )
  }

  return (
    <>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {Object.entries(fields).map(([key, description]) => {
          // Only show indicators for fields that are present in analysis or defined in fields
          // We use the value from analysis, defaulting to null if not present
          const value = analysis[key]
          return renderIndicator(key, value, description)
        })}
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="analysis-modal-title"
        aria-describedby="analysis-modal-description"
      >
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            maxWidth: "90vw",
            maxHeight: "90vh",
            overflow: "auto",
            p: 4,
            outline: "none",
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography id="analysis-modal-title" variant="h6" component="h2">
              {t("conversationAnalysis")}
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            {Object.entries(fields).map(([key, description]) => {
              const value = analysis[key]
              return (
                <Grid size={{ xs: 12 }} key={key}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" color="primary">
                      {key}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      {description}
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "background.default" }}>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                        {value !== null && value !== undefined ? String(value) : <span style={{ fontStyle: "italic", color: "gray" }}>null</span>}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
              )
            })}
          </Grid>
        </Paper>
      </Modal>
    </>
  )
}
