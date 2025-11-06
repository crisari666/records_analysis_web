import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Indicator, IndicatorType } from '../types';
import { IndicatorField } from './IndicatorField';

type IndicatorsListProps = {
  indicators: Indicator[];
  onAdd: () => void;
  onUpdate: (indicator: Indicator) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
};

export const IndicatorsList: React.FC<IndicatorsListProps> = ({
  indicators,
  onAdd,
  onUpdate,
  onDelete,
  disabled = false,
}) => {
  const { t } = useTranslation('projects');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          📊 {t('indicators')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAdd}
          disabled={disabled}
          size="small"
        >
          {t('add_indicator')}
        </Button>
      </Box>

      {indicators.length === 0 ? (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('no_indicators')}
          </Typography>
        </Box>
      ) : (
        indicators.map((indicator, index) => (
          <IndicatorField
            key={indicator.id}
            indicator={indicator}
            onUpdate={onUpdate}
            onDelete={() => onDelete(indicator.id)}
            disabled={disabled}
            index={index}
          />
        ))
      )}
    </Box>
  );
};

