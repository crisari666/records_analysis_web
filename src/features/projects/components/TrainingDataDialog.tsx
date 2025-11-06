import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ExampleAnalysis, Indicator } from '../types';

type TrainingDataDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (example: ExampleAnalysis) => void;
  example: ExampleAnalysis | null;
  indicators: Indicator[];
  disabled?: boolean;
};

export const TrainingDataDialog: React.FC<TrainingDataDialogProps> = ({
  open,
  onClose,
  onSave,
  example,
  indicators,
  disabled = false,
}) => {
  const { t } = useTranslation('projects');
  const [formData, setFormData] = useState<ExampleAnalysis>({
    name: '',
    input: '',
    output: {},
  });

  useEffect(() => {
    if (example) {
      setFormData(example);
    } else {
      setFormData({
        name: '',
        input: '',
        output: {},
      });
    }
  }, [example, open]);

  const handleFieldValueChange = (fieldName: string, value: any) => {
    setFormData({
      ...formData,
      output: {
        ...formData.output,
        [fieldName]: value,
      },
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const renderFieldInput = (indicator: Indicator) => {
    const fieldName = indicator.name;
    const currentValue = formData.output[fieldName];

    switch (indicator.type) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={currentValue === true}
                onChange={(e) => handleFieldValueChange(fieldName, e.target.checked)}
                disabled={disabled}
                size="small"
              />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {fieldName}
                </Typography>
                {indicator.description && (
                  <Typography variant="caption" color="text.secondary">
                    {indicator.description}
                  </Typography>
                )}
              </Box>
            }
          />
        );

      case 'number':
        return (
          <TextField
            label={fieldName}
            value={currentValue === null || currentValue === undefined ? '' : String(currentValue)}
            onChange={(e) => {
              const numValue = e.target.value === '' ? null : Number(e.target.value);
              handleFieldValueChange(fieldName, isNaN(numValue as number) ? null : numValue);
            }}
            fullWidth
            disabled={disabled}
            type="number"
            placeholder={indicator.description || t('enter_number')}
            helperText={indicator.description}
            size="small"
          />
        );

      case 'list':
        return (
          <TextField
            label={fieldName}
            value={currentValue === null || currentValue === undefined ? '' : (Array.isArray(currentValue) ? JSON.stringify(currentValue) : String(currentValue))}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleFieldValueChange(fieldName, Array.isArray(parsed) ? parsed : null);
              } catch {
                if (e.target.value.trim() === '') {
                  handleFieldValueChange(fieldName, null);
                } else {
                  const arrayValue = e.target.value.split(',').map((item: string) => item.trim()).filter(Boolean);
                  handleFieldValueChange(fieldName, arrayValue);
                }
              }
            }}
            fullWidth
            disabled={disabled}
            placeholder={indicator.description || '["item1", "item2"] or item1, item2'}
            helperText={indicator.description || t('enter_list_helper')}
            size="small"
          />
        );

      default: // string
        return (
          <TextField
            label={fieldName}
            value={currentValue === null || currentValue === undefined ? '' : String(currentValue)}
            onChange={(e) => handleFieldValueChange(fieldName, e.target.value || null)}
            fullWidth
            disabled={disabled}
            placeholder={indicator.description || t('enter_text')}
            helperText={indicator.description}
            size="small"
          />
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{example ? t('edit_training_data') : t('add_training_data')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label={t('training_data_name')}
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            disabled={disabled}
            placeholder={t('training_data_name_placeholder')}
            size="small"
          />

          <TextField
            label={t('example_input')}
            value={formData.input || ''}
            onChange={(e) => setFormData({ ...formData, input: e.target.value })}
            fullWidth
            multiline
            rows={4}
            disabled={disabled}
            required
            placeholder={t('example_input_placeholder')}
            size="small"
          />

          {indicators.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {t('example_output_fields')}
              </Typography>
              {indicators.map((indicator) => (
                <Box key={indicator.id || indicator.name}>
                  {renderFieldInput(indicator)}
                </Box>
              ))}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={disabled}>
          {t('cancel')}
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={disabled || !formData.input.trim()}>
          {t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

