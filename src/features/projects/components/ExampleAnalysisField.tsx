import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ExampleAnalysis, Indicator } from '../types';

type ExampleAnalysisFieldProps = {
  example: ExampleAnalysis;
  onDelete: () => void;
  onEdit?: () => void;
  disabled?: boolean;
  index?: number;
  title?: string;
  indicators: Indicator[];
};

export const ExampleAnalysisField: React.FC<ExampleAnalysisFieldProps> = ({
  example,
  onDelete,
  onEdit,
  disabled = false,
  index,
  title,
  indicators,
}) => {
  const { t } = useTranslation('projects');

  const formatFieldValue = (value: any, indicator: Indicator): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    if (indicator.type === 'boolean') {
      return value ? t('yes') : t('no');
    }
    if (indicator.type === 'list' && Array.isArray(value)) {
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 1.5,
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title || (index !== undefined ? `${t('example')} #${index + 1}` : t('example'))}
        </Typography>
        <Box>
          {onEdit && (
            <IconButton
              onClick={onEdit}
              disabled={disabled}
              size="small"
              aria-label={t('edit_training_data')}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            onClick={onDelete}
            disabled={disabled}
            color="error"
            size="small"
            aria-label={t('delete_example')}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
            {t('example_input')}:
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {example.input || '-'}
          </Typography>
        </Box>

        {indicators.length > 0 ? (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
              {t('example_output_fields')}:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {indicators.map((indicator) => {
                const value = example.output[indicator.name];
                return (
                  <Chip
                    key={indicator.id || indicator.name}
                    label={`${indicator.name}: ${formatFieldValue(value, indicator)}`}
                    size="small"
                    variant="outlined"
                  />
                );
              })}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              p: 2,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t('no_fields_defined')}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

