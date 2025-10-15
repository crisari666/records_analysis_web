import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ControlsProjects, ListProjects } from '../components';

export const ProjectsPage: React.FC = () => {
  const { t } = useTranslation('projects');

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('title')}
      </Typography>
      
      <ControlsProjects />
      <ListProjects />
    </Box>
  );
};
