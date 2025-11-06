import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ExampleAnalysis, Indicator } from '../types';

type TrainingDataDisplayProps = {
  examples: ExampleAnalysis[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
  indicators: Indicator[];
  disabled?: boolean;
};

export const TrainingDataDisplay: React.FC<TrainingDataDisplayProps> = ({
  examples,
  onEdit,
  onDelete,
  onAdd,
  indicators,
  disabled = false,
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
    <Box>
      {examples.length === 0 ? (
        <Paper
          elevation={1}
          sx={{
            p: 2,
            border: '1px dashed',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('no_training_data')}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {examples.map((example, index) => (
            <Paper
              key={index}
              elevation={1}
              sx={{
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {example.name || `${t('example')} #${index + 1}`}
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    onClick={() => onEdit(index)}
                    disabled={disabled}
                    size="small"
                    aria-label={t('edit_training_data')}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => onDelete(index)}
                    disabled={disabled}
                    color="error"
                    size="small"
                    aria-label={t('delete_example')}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    {t('example_input')}:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {example.input || '-'}
                  </Typography>
                </Box>

                {indicators.length > 0 && (
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
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <IconButton
          onClick={onAdd}
          disabled={disabled}
          color="primary"
          size="small"
          aria-label={t('add_training_data')}
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

