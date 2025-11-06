import React from 'react';
import { Box } from '@mui/material';
import { ProjectFormContainer } from '../components/ProjectFormContainer';
import { ProjectBreadcrumbs } from '../components/ProjectBreadcrumbs';

export const ProjectPage: React.FC = () => {
  return (
    <Box>
      <ProjectBreadcrumbs />
      <ProjectFormContainer />
    </Box>
  );
};

