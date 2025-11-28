import { useState } from 'react'
import { Box, IconButton, Badge, useMediaQuery, useTheme } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { SessionAlertsList } from './SessionAlertsList'
import { useAppSelector } from '@/app/hooks'
import { selectSessionAlerts, selectSessionDbId } from '../store/whatsappSessionSlice'

type SessionChatControlsProps = {
  sessionId: string
}

export const SessionChatControls = ({ sessionId }: SessionChatControlsProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [alertsAnchorEl, setAlertsAnchorEl] = useState<HTMLElement | null>(null)
  const alertsOpen = Boolean(alertsAnchorEl)
  const sessionAlerts = useAppSelector(selectSessionAlerts)
  const sessionDbId = useAppSelector(selectSessionDbId)

  const unreadAlertsCount = sessionAlerts.filter((alert) => !alert.isRead).length

  const handleAlertsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAlertsAnchorEl(event.currentTarget)
  }

  const handleAlertsClose = () => {
    setAlertsAnchorEl(null)
  }

  if (!sessionDbId) return null

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Badge badgeContent={unreadAlertsCount} color="error" max={99}>
        <IconButton
          onClick={handleAlertsClick}
          size="small"
          color="inherit"
          aria-label="session alerts"
        >
          {isMobile ? <MenuIcon /> : <NotificationsIcon />}
        </IconButton>
      </Badge>
      {sessionDbId && (
        <SessionAlertsList
          anchorEl={alertsAnchorEl}
          open={alertsOpen}
          onClose={handleAlertsClose}
          sessionId={sessionDbId}
        />
      )}
    </Box>
  )
}

