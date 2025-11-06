import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ExampleAnalysis, Indicator } from '../types';
import { ExampleAnalysisField } from './ExampleAnalysisField';

type ExampleAnalysesListProps = {
  examples: Record<string, ExampleAnalysis>;
  onAdd: () => void;
  onEdit: (key: string) => void;
  onDelete: (key: string) => void;
  disabled?: boolean;
  indicators: Indicator[];
};

export const ExampleAnalysesList: React.FC<ExampleAnalysesListProps> = ({
  examples,
  onAdd,
  onEdit,
  onDelete,
  disabled = false,
  indicators,
}) => {
  const { t } = useTranslation('projects');
  const exampleEntries = Object.entries(examples);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 1.5 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          onClick={onAdd}
          disabled={disabled}
        >
          {t('add_example')}
        </Button>
      </Box>

      {exampleEntries.length === 0 ? (
        <Box
          sx={{
            p: 2,
            mb: 2,
            border: '1px dashed',
            borderColor: 'divider',
            textAlign: 'center',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('no_example_analysis')}
          </Typography>
        </Box>
      ) : (
        exampleEntries.map(([key, example]) => (
          <ExampleAnalysisField
            key={key}
            example={example}
            onDelete={() => onDelete(key)}
            onEdit={() => onEdit(key)}
            disabled={disabled}
            title={key}
            indicators={indicators}
          />
        ))
      )}
    </Box>
  );
};

