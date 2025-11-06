import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  fetchProjectById, 
  clearSelectedProject,
  selectSelectedProject,
  selectStatus,
  selectError 
} from '../store/projectsSlice';
import { ProjectFormContent } from './ProjectFormContent';

export const ProjectFormContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const project = useAppSelector(selectSelectedProject);
  const status = useAppSelector(selectStatus);
  const error = useAppSelector(selectError);

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
    } else {
      dispatch(clearSelectedProject());
    }

    return () => {
      dispatch(clearSelectedProject());
    };
  }, [id, dispatch]);

  const handleSuccess = () => {
    navigate('/dashboard/projects');
  };

  if (id && status === 'loading' && !project) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (id && status !== 'loading' && !project && !error) {
    return (
      <Box sx={{ p: 1 }}>
        <Alert severity="error">Project not found</Alert>
      </Box>
    );
  }

  return <ProjectFormContent project={project || null} onSuccess={handleSuccess} />;
};

