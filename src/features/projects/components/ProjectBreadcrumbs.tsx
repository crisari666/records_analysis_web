import React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../app/hooks';
import { selectSelectedProject } from '../store/projectsSlice';

export const ProjectBreadcrumbs: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation(['projects', 'dashboard']);
  const project = useAppSelector(selectSelectedProject);

  const isEditing = !!id;
  const projectTitle = project?.title || '';

  return (
    <Box sx={{ mb: 2 }}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link component={RouterLink} color="inherit" to="/dashboard">
          {t('dashboard:navigation.home')}
        </Link>
        <Link component={RouterLink} color="inherit" to="/dashboard/projects">
          {t('dashboard:navigation.projects')}
        </Link>
        <Typography color="text.primary">
          {isEditing
            ? projectTitle
              ? `${t('edit_project')}: ${projectTitle}`
              : t('edit_project')
            : t('create_project')}
        </Typography>
      </Breadcrumbs>
    </Box>
  );
};

