import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Devices as DevicesIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  fetchProjects, 
  deleteProject
} from '../store/projectsSlice';
import { ProjectFormModal } from './ProjectFormModal';
import { ProjectDevicesModal } from './ProjectDevicesModal';
import { Project } from '../types';

export const ListProjects: React.FC = () => {
  const { t } = useTranslation('projects');
  const dispatch = useAppDispatch();
  const projects = useAppSelector((state) => state.projects.projects);
  const status = useAppSelector((state) => state.projects.status);
  const error = useAppSelector((state) => state.projects.error);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [devicesModalOpen, setDevicesModalOpen] = useState(false);
  const [selectedProjectForDevices, setSelectedProjectForDevices] = useState<Project | null>(null);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm(t('confirm_delete'))) {
      dispatch(deleteProject(projectId));
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProject(null);
  };

  const handleManageDevices = (project: Project) => {
    setSelectedProjectForDevices(project);
    setDevicesModalOpen(true);
  };

  const handleCloseDevicesModal = () => {
    setDevicesModalOpen(false);
    setSelectedProjectForDevices(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (status === 'loading' && projects.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (projects.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6" color="text.secondary">
          {t('no_projects')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {project.title}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={t('devices_count', { count: project.devices.length })}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {t('created_at', { date: formatDate(project.createdAt) })}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {t('updated_at', { date: formatDate(project.updatedAt) })}
                </Typography>

                {project.config && Object.keys(project.config).length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Tooltip title={JSON.stringify(project.config, null, 2)}>
                      <Chip
                        icon={<SettingsIcon />}
                        label="Config"
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Tooltip>
                  </Box>
                )}
              </CardContent>
              
              <CardActions>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditProject(project)}
                >
                  {t('edit')}
                </Button>
                <Button
                  size="small"
                  startIcon={<DevicesIcon />}
                  onClick={() => handleManageDevices(project)}
                  color="primary"
                >
                  {t('manage_devices')}
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteProject(project._id)}
                >
                  {t('delete')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <ProjectFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        project={editingProject}
      />

      <ProjectDevicesModal
        open={devicesModalOpen}
        onClose={handleCloseDevicesModal}
        project={selectedProjectForDevices}
      />
    </Box>
  );
};
