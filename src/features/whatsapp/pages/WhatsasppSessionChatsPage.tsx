import { useParams, Link as RouterLink } from "react-router-dom"
import { Breadcrumbs, Link, Typography, Box, Grid, Chip } from "@mui/material"
import { useTranslation } from "react-i18next"
import { WhatsappSessionChatsList } from "../components/WhatsappSessionChatsList"
import { WhatsappChatContent } from "../components/WhatsappChatContent"
import { WhatsappSocketListener } from "../components/WhatsappSocketListener"
import { SessionChatControls } from "../components/SessionChatControls"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { fetchSessionAndProject, selectSessionDbId, selectSessionTitle, selectSessionId, selectCurrentChat, clearSessionAlerts } from "../store/whatsappSessionSlice"

export const WhatsasppSessionChatsPage = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation("whatsapp")
  const dispatch = useAppDispatch()
  const sessionDbId = useAppSelector(selectSessionDbId)
  const sessionTitle = useAppSelector(selectSessionTitle)
  const sessionId = useAppSelector(selectSessionId)
  const currentChat = useAppSelector(selectCurrentChat)

  useEffect(() => {
    if (id) {
      dispatch(fetchSessionAndProject(id))
    }
  }, [id, dispatch])

  // Clear session alerts when leaving the view
  useEffect(() => {
    return () => {
      dispatch(clearSessionAlerts())
    }
  }, [dispatch])

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {id && <WhatsappSocketListener sessionId={id} />}
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Breadcrumbs aria-label="breadcrumb">
            <Link component={RouterLink} color="inherit" to="/dashboard/whatsapp">
              {t("breadcrumbs.sessions")}
            </Link>
            <Typography color="text.primary">{t("breadcrumbs.chats")}</Typography>
          </Breadcrumbs>
          {(sessionTitle || sessionId) && (
            <Chip
              label={sessionTitle || sessionId}
              color="primary"
              variant="filled"
              size="medium"
            />
          )}
          {currentChat && (
            <Chip
              label={currentChat.name}
              color="primary"
              variant="outlined"
              size="medium"
            />
          )}
        </Box>
        {sessionDbId && <SessionChatControls sessionId={sessionDbId} />}
      </Box>
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


