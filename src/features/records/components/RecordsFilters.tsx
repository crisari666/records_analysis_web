import React, { useState, useCallback } from 'react'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Chip,
  Stack
} from '@mui/material'
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { 
  getRecordsAsync, 
  analyzeLatestAsync 
} from '../store/recordsSlice'

export type FilterOptions = {
  type: 'all' | 'incoming' | 'outgoing'
  analysisStatus: 'all' | 'pending' | 'analyzed' | 'success' | 'failed'
  limit: number
  searchTerm: string
}

type RecordsFiltersProps = {
  // No props needed - component manages its own state
}

export const RecordsFilters: React.FC<RecordsFiltersProps> = () => {
  const { t } = useTranslation('records')
  const dispatch = useAppDispatch()
  const { isLoading } = useAppSelector((state) => state.records)

  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    analysisStatus: 'all',
    limit: 10,
    searchTerm: ''
  })

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleClearFilters = () => {
    setFilters({
      type: 'all',
      analysisStatus: 'all',
      limit: 10,
      searchTerm: ''
    })
  }

  const handleRefresh = useCallback(() => {
    dispatch(getRecordsAsync({ limit: filters.limit }))
  }, [dispatch, filters.limit])

  const handleAnalyzeLatest = useCallback(() => {
    dispatch(analyzeLatestAsync({ limit: filters.limit }))
  }, [dispatch, filters.limit])

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.type !== 'all') count++
    if (filters.analysisStatus !== 'all') count++
    if (filters.limit !== 10) count++
    if (filters.searchTerm) count++
    return count
  }

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('callType')}</InputLabel>
            <Select
              value={filters.type}
              label={t('callType')}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="all">{t('allTypes')}</MenuItem>
              <MenuItem value="incoming">{t('callType.incoming')}</MenuItem>
              <MenuItem value="outgoing">{t('callType.outgoing')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('analysisStatus')}</InputLabel>
            <Select
              value={filters.analysisStatus}
              label={t('analysisStatus')}
              onChange={(e) => handleFilterChange('analysisStatus', e.target.value)}
            >
              <MenuItem value="all">{t('allStatuses')}</MenuItem>
              <MenuItem value="pending">{t('analysisStatusOptions.pending')}</MenuItem>
              <MenuItem value="analyzed">{t('analysisStatusOptions.analyzed')}</MenuItem>
              <MenuItem value="success">{t('analysisStatusOptions.success')}</MenuItem>
              <MenuItem value="failed">{t('analysisStatusOptions.failed')}</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>{t('limit')}</InputLabel>
            <Select
              value={filters.limit}
              label={t('limit')}
              onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label={t('searchTranscription')}
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            placeholder={t('searchPlaceholder')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 3 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={handleRefresh}
              size="small"
            >
              {t('applyFilters')}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              size="small"
              disabled={getActiveFiltersCount() === 0}
            >
              {t('clearFilters')}
            </Button>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<RefreshIcon />}
              onClick={handleAnalyzeLatest}
              size="small"
              disabled={isLoading}
            >
              {t('analyzeLatest')}
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {getActiveFiltersCount() > 0 && (
        <Box mt={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {filters.type !== 'all' && (
              <Chip
                label={`${t('callType')}: ${t(`callType.${filters.type}`)}`}
                onDelete={() => handleFilterChange('type', 'all')}
                size="small"
              />
            )}
            {filters.analysisStatus !== 'all' && (
              <Chip
                label={`${t('analysisStatus')}: ${t(`analysisStatusOptions.${filters.analysisStatus}`)}`}
                onDelete={() => handleFilterChange('analysisStatus', 'all')}
                size="small"
              />
            )}
            {filters.limit !== 10 && (
              <Chip
                label={`${t('limit')}: ${filters.limit}`}
                onDelete={() => handleFilterChange('limit', 10)}
                size="small"
              />
            )}
            {filters.searchTerm && (
              <Chip
                label={`${t('search')}: ${filters.searchTerm}`}
                onDelete={() => handleFilterChange('searchTerm', '')}
                size="small"
              />
            )}
          </Stack>
        </Box>
      )}
    </Box>
  )
}
