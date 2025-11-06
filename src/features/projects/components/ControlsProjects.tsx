import React from 'react';
import { Button, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const ControlsProjects: React.FC = () => {
  const { t } = useTranslation('projects');
  const navigate = useNavigate();

  const handleCreateProject = () => {
    navigate('/dashboard/project');
  };

  return (
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleCreateProject}
        sx={{ minWidth: 150 }}
      >
        {t('create_project')}
      </Button>
    </Box>
  );
};
