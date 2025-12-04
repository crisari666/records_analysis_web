import { useTranslation } from 'react-i18next'
import {
  Container,
  Typography,
} from '@mui/material'
import { useAppSelector } from '../../../app/hooks'

export const DashboardContent = () => {
  const { t } = useTranslation('dashboard')
  const { user, isLoading } = useAppSelector((state) => state.auth)

  if (isLoading) {
    return (
      <Container>
        <Typography>{t('loading')}</Typography>
      </Container>
    )
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('welcome')}
      </Typography>
      {user && (
        <Typography variant="h6" color="text.secondary">
          {t('hello', { name: user.name })}
        </Typography>
      )}
    </Container>
  )
}
