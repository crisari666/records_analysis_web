import React, { useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  PlayArrow as PlayIcon,
  CheckCircle as SuccessIcon,
  Cancel as FailIcon,
  Help as PendingIcon
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { analyzeRecordAsync, getRecordsAsync } from '../store/recordsSlice'
import { TranscriptionRecord } from '../types'


export const RecordsList: React.FC = () => {
  const { t } = useTranslation('records')
  const dispatch = useAppDispatch()
  const { records, isLoading, error } = useAppSelector((state) => state.records)

  useEffect(() => {
    dispatch(getRecordsAsync({ limit: 10 }))
    //dispatch(getStatsAsync())
  }, [dispatch])

  const handleAnalyzeRecord = (id: string) => {
    dispatch(analyzeRecordAsync({ id }))
  }

  const getAnalysisStatus = (record: TranscriptionRecord) => {
    if (record.successSell === null) {
      return { status: 'pending', icon: <PendingIcon />, color: 'warning' as const }
    }
    if (record.successSell) {
      return { status: 'success', icon: <SuccessIcon />, color: 'success' as const }
    }
    return { status: 'failed', icon: <FailIcon />, color: 'error' as const }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatAmount = (amount: number | null) => {
    if (amount === null) return '-'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'COP'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  if (records.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6" color="text.secondary">
          {t('noRecords')}
        </Typography>
      </Box>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('callerId')}</TableCell>
            <TableCell>{t('type')}</TableCell>
            <TableCell>{t('transcription')}</TableCell>
            <TableCell>{t('analysisStatus')}</TableCell>
            <TableCell>{t('amount')}</TableCell>
            <TableCell>{t('reason')}</TableCell>
            <TableCell>{t('createdAt')}</TableCell>
            <TableCell>{t('actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((record) => {
            const analysisStatus = getAnalysisStatus(record)
            return (
              <TableRow key={record._id} hover>
                <TableCell>{record.callerId}</TableCell>
                <TableCell>
                  <Chip
                    label={t(`callType.${record.type}`)}
                    color={record.type === 'incoming' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 300,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={record.transcription}
                  >
                    {record.transcription}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={analysisStatus.icon}
                    label={t(`analysisStatusOptions.${analysisStatus.status}`)}
                    color={analysisStatus.color}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {formatAmount(record.amountToPay)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={record.reasonFail || ''}
                  >
                    {record.reasonFail || '-'}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(record.createdAt)}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    {record.successSell === null && (
                      <Tooltip title={t('analyzeRecord')}>
                        <IconButton
                          size="small"
                          onClick={() => handleAnalyzeRecord(record._id)}
                          color="primary"
                        >
                          <PlayIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
