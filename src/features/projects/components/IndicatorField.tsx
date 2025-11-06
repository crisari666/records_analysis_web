import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Typography,
  Paper,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Indicator, IndicatorType } from '../types';

type IndicatorFieldProps = {
  indicator: Indicator;
  onUpdate: (indicator: Indicator) => void;
  onDelete: () => void;
  disabled?: boolean;
  index: number;
};

export const IndicatorField: React.FC<IndicatorFieldProps> = ({
  indicator,
  onUpdate,
  onDelete,
  disabled = false,
  index,
}) => {
  const { t } = useTranslation('projects');

  const handleFieldChange = (field: keyof Indicator) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    onUpdate({
      ...indicator,
      [field]: value,
    });
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
          {t('indicator')} #{index + 1}
        </Typography>
        <IconButton
          onClick={onDelete}
          disabled={disabled}
          color="error"
          size="small"
          aria-label={t('delete_indicator')}
        >
          <DeleteIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <TextField
            label={t('indicator_name')}
            value={indicator.name}
            onChange={handleFieldChange('name')}
            sx={{ flex: 2 }}
            disabled={disabled}
            required
            placeholder={t('indicator_name_placeholder')}
            size="small"
          />

          <FormControl sx={{ flex: 1 }} disabled={disabled} size="small">
            <InputLabel>{t('indicator_type')}</InputLabel>
            <Select
              value={indicator.type}
              label={t('indicator_type')}
              onChange={(e) =>
                onUpdate({
                  ...indicator,
                  type: e.target.value as IndicatorType,
                })
              }
            >
              <MenuItem value="string">{t('type_string')}</MenuItem>
              <MenuItem value="boolean">{t('type_boolean')}</MenuItem>
              <MenuItem value="number">{t('type_number')}</MenuItem>
              <MenuItem value="list">{t('type_list')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TextField
          label={t('indicator_description')}
          value={indicator.description}
          onChange={handleFieldChange('description')}
          fullWidth
          multiline
          rows={3}
          disabled={disabled}
          required
          placeholder={t('indicator_description_placeholder')}
          size="small"
        />

        <TextField
          label={t('example_output')}
          value={indicator.exampleOutput || ''}
          onChange={handleFieldChange('exampleOutput')}
          fullWidth
          disabled={disabled}
          placeholder={t('example_output_placeholder')}
          helperText={t('example_output_helper')}
          size="small"
        />
      </Box>
    </Paper>
  );
};

