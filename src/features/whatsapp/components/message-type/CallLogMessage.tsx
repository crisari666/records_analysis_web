import { ListItem, Box, Typography } from "@mui/material"
import CallMissedIcon from "@mui/icons-material/CallMissed"
import CallReceivedIcon from "@mui/icons-material/CallReceived"
import CallMadeIcon from "@mui/icons-material/CallMade"
import { useTranslation } from "react-i18next"
import type { StoredMessage } from "../../types"

type CallLogMessageProps = {
  callLog: StoredMessage
  index: number
}

export const CallLogMessage = ({ callLog, index }: CallLogMessageProps) => {
  const { t } = useTranslation("whatsapp")
  
  const callBody = callLog.body || ""
  const isMissed = callBody.toLowerCase().includes("missed") || callBody.toLowerCase().includes("perdida")
  const isOutgoing = callLog.fromMe
  
  const CallIconComponent = isMissed 
    ? CallMissedIcon 
    : isOutgoing 
      ? CallMadeIcon 
      : CallReceivedIcon

  return (
    <ListItem 
      key={`call-${callLog.messageId}-${index}`} 
      sx={{ 
        justifyContent: callLog.fromMe ? "flex-end" : "flex-start",
        py: 1
      }}
    >
      <Box
        sx={{
          bgcolor: callLog.fromMe
            ? "primary.main"
            : "grey.200",
          color: callLog.fromMe
            ? "primary.contrastText"
            : "text.primary",
          px: 2,
          py: 1,
          borderRadius: 2,
          maxWidth: "75%",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <CallIconComponent sx={{ fontSize: 20 }} />
        <Box>
          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
            {callBody || t("callLog")}
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
            {new Date(callLog.timestamp * 1000).toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </ListItem>
  )
}

