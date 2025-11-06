import React, { useState } from 'react';
import { TextField, Box, FormControlLabel, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';

type MainPromptFieldProps = {
  value: string;
  onChange: (value: string) => void;
  jsonConfig: string;
  onJsonConfigChange: (jsonConfig: string) => void;
  disabled?: boolean;
  error?: string;
};

export const MainPromptField: React.FC<MainPromptFieldProps> = ({
  value,
  onChange,
  jsonConfig,
  onJsonConfigChange,
  disabled = false,
  error,
}) => {
  const { t } = useTranslation('projects');
  const [isJsonView, setIsJsonView] = useState(false);

  const handleToggleView = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsJsonView(event.target.checked);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', flex: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isJsonView}
              onChange={handleToggleView}
              disabled={disabled}
              size="small"
            />
          }
          label={isJsonView ? t('json_view') : t('form_view')}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {isJsonView ? (
          <TextField
            label={t('complete_json_config')}
            value={jsonConfig}
            onChange={(e) => onJsonConfigChange(e.target.value)}
            fullWidth
            multiline
            rows={20}
            disabled={disabled}
            error={!!error}
            helperText={error}
            sx={{
              flex: 1,
              '& .MuiInputBase-root': {
                height: '100%',
                alignItems: 'flex-start',
              },
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                height: '100% !important',
                overflow: 'auto !important',
              },
            }}
          />
        ) : (
          <TextField
            label={t('main_prompt_placeholder')}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
            multiline
            rows={20}
            disabled={disabled}
            error={!!error}
            helperText={error}
            placeholder={t('main_prompt_placeholder')}
            size="small"
            sx={{
              flex: 1,
              '& .MuiInputBase-root': {
                height: '100%',
                alignItems: 'flex-start',
              },
              '& .MuiInputBase-input': {
                height: '100% !important',
                overflow: 'auto !important',
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

