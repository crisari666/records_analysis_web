import { useParams, Link as RouterLink } from "react-router-dom"
import { Breadcrumbs, Link, Typography, Box } from "@mui/material"
import { useTranslation } from "react-i18next"
import { WhatsappSessionChatsList } from "../components/WhatsappSessionChatsList"

export const WhatsasppSessionChatsPage = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation("whatsapp")

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link component={RouterLink} color="inherit" to="/dashboard/whatsapp">
          {t("breadcrumbs.sessions")}
        </Link>
        <Typography color="text.primary">{t("breadcrumbs.chats")}</Typography>
      </Breadcrumbs>

      <Typography variant="h5">{t("sessionChatsTitle")}</Typography>

      {id && <WhatsappSessionChatsList sessionId={id} />}
    </Box>
  )
}


