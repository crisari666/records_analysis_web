import { useState, useEffect } from 'react'
import { Box, IconButton, Badge, useMediaQuery, useTheme } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { SessionAlertsList } from './SessionAlertsList'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { 
  selectSessionDbId,
  selectUnreadSessionAlertsCount,
  getSessionAlertsAsync 
} from '../store/whatsappSessionSlice'

type SessionChatControlsProps = {
  sessionId: string
}

export const SessionChatControls = ({}: SessionChatControlsProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useAppDispatch()
  const [alertsAnchorEl, setAlertsAnchorEl] = useState<HTMLElement | null>(null)
  const alertsOpen = Boolean(alertsAnchorEl)
  const sessionDbId = useAppSelector(selectSessionDbId)
  const unreadAlertsCount = useAppSelector(selectUnreadSessionAlertsCount)

  // Automatically fetch alerts when sessionDbId is available
  useEffect(() => {
    if (sessionDbId) {
      dispatch(getSessionAlertsAsync({ sessionId: sessionDbId }))
    }
  }, [sessionDbId, dispatch])

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

