import { useEffect } from 'react'
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Chip,
  Divider,
  Paper,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { getChatAlertsAsync, selectAlerts, selectIsAlertsLoading, selectError, clearAlerts } from '../store/whatsappSessionSlice'
import type { Alert } from '../types'

type AlertsListProps = {
  anchorEl: HTMLElement | null
  open: boolean
  onClose: () => void
  sessionId: string
  chatId: string | null
}

export const AlertsList = ({ anchorEl, open, onClose, sessionId, chatId }: AlertsListProps) => {
  const { t } = useTranslation('whatsapp')
  const dispatch = useAppDispatch()
  const alerts = useAppSelector(selectAlerts)
  const isLoading = useAppSelector(selectIsAlertsLoading)
  const error = useAppSelector(selectError)

  useEffect(() => {
    if (open && sessionId && chatId) {
      dispatch(getChatAlertsAsync({ sessionId, chatId }))
    } else if (open && sessionId && !chatId) {
      // If no chatId, clear alerts
      dispatch(clearAlerts())
    }
  }, [open, sessionId, chatId, dispatch])

  const getAlertTypeLabel = (type: Alert['type']): string => {
    switch (type) {
      case 'disconnected':
        return t('alerts.types.disconnected')
      case 'message_deleted':
        return t('alerts.types.messageDeleted')
      case 'message_edited':
        return t('alerts.types.messageEdited')
      case 'chat_removed':
        return t('alerts.types.chatRemoved')
      default:
        return type
    }
  }

  const formatDate = (date?: string | Date): string => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleString()
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 400,
          maxHeight: '80vh',
        },
      }}
    >
      <Paper>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">{t('alerts.title')}</Typography>
        </Box>

        <Box
          sx={{
            maxHeight: 'calc(5 * 80px)', // Max height for 5 items (approximately 80px per item)
            overflowY: 'auto',
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Typography color="error" variant="body2">
                {error || t('alerts.fetchError')}
              </Typography>
            </Box>
          ) : alerts.length === 0 ? (
            <Box sx={{ p: 2 }}>
              <Typography color="text.secondary" variant="body2">
                {t('alerts.noAlerts')}
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {alerts.map((alert, index) => (
                <Box key={alert._id}>
                  <ListItem
                    sx={{
                      bgcolor: alert.isRead ? 'background.paper' : (theme) => theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(144, 202, 249, 0.16)',
                      '&:hover': {
                        bgcolor: alert.isRead ? 'action.hover' : (theme) => theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(144, 202, 249, 0.24)',
                      },
                    }}
                  >
                    <ListItemText
                      slotProps={{
                        primary: { component: 'div' },
                        secondary: { component: 'div' },
                      }}
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Chip
                            label={getAlertTypeLabel(alert.type)}
                            size="small"
                            color={alert.isRead ? 'default' : 'primary'}
                            variant={alert.isRead ? 'outlined' : 'filled'}
                          />
                          {!alert.isRead && (
                            <Chip
                              label={t('alerts.unread')}
                              size="small"
                              color="error"
                              variant="filled"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          {alert.message && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {alert.message}
                            </Typography>
                          )}
                          {alert.createdAt && (
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(alert.createdAt)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < alerts.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Paper>
    </Popover>
  )
}

