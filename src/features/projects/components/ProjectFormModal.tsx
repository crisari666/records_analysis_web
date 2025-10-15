import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { 
  createProject, 
  updateProject, 
  selectStatus, 
  selectError,
  clearError 
} from '../store/projectsSlice';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '../types';

type ProjectFormModalProps = {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
};

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  open,
  onClose,
  project,
}) => {
  const { t } = useTranslation('projects');
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.projects.status);
  const error = useAppSelector((state) => state.projects.error);

  const [formData, setFormData] = useState({
    title: '',
    config: '{}',
  });

  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        config: JSON.stringify(project.config, null, 2),
      });
    } else {
      setFormData({
        title: '',
        config: '{}',
      });
    }
    setConfigError(null);
  }, [project, open]);

  // useEffect(() => {
  //   if (status === 'idle' && !error) {
  //     onClose();
  //   }
  // }, [status, error, onClose]);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    if (field === 'config') {
      setConfigError(null);
    }
  };

  const validateConfig = (configString: string): boolean => {
    try {
      JSON.parse(configString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      return;
    }

    if (!validateConfig(formData.config)) {
      setConfigError(t('invalid_json'));
      return;
    }

    try {
      const config = JSON.parse(formData.config);
      
      if (project) {
        const updateData: UpdateProjectRequest = {
          id: project._id,
          title: formData.title.trim(),
          config,
        };
        dispatch(updateProject(updateData));
      } else {
        const createData: CreateProjectRequest = {
          title: formData.title.trim(),
          config,
        };
        dispatch(createProject(createData));
      }
    } catch (error) {
      setConfigError(t('invalid_json'));
    }
  };

  const handleClose = () => {
    if (status !== 'loading') {
      dispatch(clearError());
      onClose();
    }
  };

  const isEditMode = !!project;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditMode ? t('edit_project') : t('create_project')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}
          
          <TextField
            label={t('project_title')}
            value={formData.title}
            onChange={handleInputChange('title')}
            fullWidth
            required
            disabled={status === 'loading'}
          />
          
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('project_config')}
            </Typography>
            <TextField
              label={t('config_json')}
              value={formData.config}
              onChange={handleInputChange('config')}
              fullWidth
              multiline
              rows={15}
              disabled={status === 'loading'}
              error={!!configError}
              helperText={configError}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={status === 'loading'}>
          {t('cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={status === 'loading' || !formData.title.trim()}
        >
          {status === 'loading' ? t('loading') : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
