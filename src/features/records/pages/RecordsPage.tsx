import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { RecordsList } from '../components/RecordsList'
import { RecordsFilters } from '../components/RecordsFilters'

export const RecordsPage: React.FC = () => {
  const { t } = useTranslation('records')

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('title')}
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('description')}
      </Typography>

      <RecordsFilters />

      <Paper sx={{ mt: 2 }}>
        <RecordsList />
      </Paper>
    </Box>
  )
}
