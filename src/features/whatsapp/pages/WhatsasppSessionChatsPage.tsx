import { useParams, Link as RouterLink } from "react-router-dom"
import { Breadcrumbs, Link, Typography, Box, Grid } from "@mui/material"
import { useTranslation } from "react-i18next"
import { WhatsappSessionChatsList } from "../components/WhatsappSessionChatsList"
import { WhatsappChatContent } from "../components/WhatsappChatContent"
import { WhatsappSocketListener } from "../components/WhatsappSocketListener"

import { useEffect } from "react"
import { useAppDispatch } from "@/app/hooks"
import { fetchSessionAndProject } from "../store/whatsappSessionSlice"

export const WhatsasppSessionChatsPage = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation("whatsapp")
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (id) {
      dispatch(fetchSessionAndProject(id))
    }
  }, [id, dispatch])

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {id && <WhatsappSocketListener sessionId={id} />}
      <Breadcrumbs aria-label="breadcrumb">
        <Link component={RouterLink} color="inherit" to="/dashboard/whatsapp">
          {t("breadcrumbs.sessions")}
        </Link>
        <Typography color="text.primary">{t("breadcrumbs.chats")}</Typography>
      </Breadcrumbs>
      <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
        <Grid size={{ xs: 12, md: 4 }} sx={{ maxHeight: "calc(100vh - 200px)" }}>
          {id && <WhatsappSessionChatsList sessionId={id} />}
        </Grid>
        <Grid size={{ xs: 12, md: 8 }} sx={{ maxHeight: "calc(100vh - 200px)" }}>
          <WhatsappChatContent />
        </Grid>
      </Grid>
    </Box>
  )
}


