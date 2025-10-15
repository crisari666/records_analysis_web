import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { Clear as ClearIcon, Edit as EditIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../app/hooks';
import { setDeviceProjectAsync, removeDeviceProjectAsync } from '../store/devicesSlice';
import { projectsService } from '../../projects/services/projectsService';
import type { Project } from '../../projects/types';
import type { CallerDevice } from '../types';

type ProjectSelectorProps = {
  device: CallerDevice;
  onProjectChange?: (device: CallerDevice) => void;
};

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ device, onProjectChange }) => {
  const { t } = useTranslation('devices');
  const dispatch = useAppDispatch();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const projectsData = await projectsService.getProjects();
        setProjects(projectsData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch projects';
        setError(errorMessage);
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [retryCount]);

  const handleProjectChange = async (selectedProject: Project | null) => {
    if (updating) return;

    setUpdating(true);
    setError(null);
    try {
      let result;
      
      if (selectedProject) {
        // Set project
        result = await dispatch(setDeviceProjectAsync({ 
          id: device._id, 
          projectId: selectedProject._id 
        }));
      } else {
        // Remove project
        result = await dispatch(removeDeviceProjectAsync(device._id));
      }

      if (setDeviceProjectAsync.fulfilled.match(result) || removeDeviceProjectAsync.fulfilled.match(result)) {
        const updatedDevice = result.payload as CallerDevice;
        onProjectChange?.(updatedDevice);
      } else if (setDeviceProjectAsync.rejected.match(result) || removeDeviceProjectAsync.rejected.match(result)) {
        const errorMessage = result.error.message || 'Failed to update device project';
        setError(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update device project';
      setError(errorMessage);
      console.error('Failed to update device project:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleClearProject = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmRemove = () => {
    setShowConfirmDialog(false);
    handleProjectChange(null);
  };

  const handleCancelRemove = () => {
    setShowConfirmDialog(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null); // Clear any errors when closing
  };

  const handleErrorClose = () => {
    setError(null);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
  };

  const currentProject = projects.find(project => project._id === device.project);

  return (
    <Box display="flex" alignItems="center" gap={1} minWidth={200}>
      {!isOpen ? (
        // Display mode - show chip or placeholder
        <Box display="flex" alignItems="center" gap={1} flexGrow={1}>
          {currentProject ? (
            <Chip
              label={currentProject.title}
              size="small"
              color="primary"
              variant="outlined"
              onClick={handleOpen}
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                }
              }}
            />
          ) : (
            <Chip
              label={t('assignProject')}
              size="small"
              variant="outlined"
              onClick={handleOpen}
              icon={<EditIcon fontSize="small" />}
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }}
            />
          )}
          {currentProject && (
            <Tooltip title={t('removeProject')}>
              <IconButton
                size="small"
                onClick={handleClearProject}
                disabled={updating}
                color="error"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ) : (
        // Edit mode - show autocomplete
        <Autocomplete
          value={currentProject || null}
          onChange={(_, newValue) => {
            handleProjectChange(newValue);
            handleClose();
          }}
          onOpen={handleOpen}
          onClose={handleClose}
          open={isOpen}
          options={projects}
          getOptionLabel={(option) => option.title}
          isOptionEqualToValue={(option, value) => option._id === value?._id}
          loading={loading}
          disabled={updating}
          size="small"
          sx={{ flexGrow: 1 }}
          autoFocus
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={t('assignProject')}
              error={!!error}
              helperText={error}
              slotProps={{
                input: {
                  ...params.InputProps,
                },
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box>
                <Box component="span" fontWeight="medium">
                  {option.title}
                </Box>
                <Box component="span" color="text.secondary" fontSize="0.875rem" ml={1}>
                  ({option.devices.length} devices)
                </Box>
              </Box>
            </Box>
          )}
        />
      )}
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleErrorClose} 
          severity="error" 
          sx={{ width: '100%' }}
          action={
            error && !loading ? (
              <IconButton size="small" onClick={handleRetry} color="inherit">
                <EditIcon fontSize="small" />
              </IconButton>
            ) : null
          }
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelRemove}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {t('confirmRemoveProject')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {currentProject 
              ? t('confirmRemoveProjectMessage').replace('{{projectName}}', currentProject.title)
              : t('confirmRemoveProjectMessageGeneric')
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemove} color="primary">
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleConfirmRemove} 
            color="error" 
            variant="contained"
            disabled={updating}
          >
            {updating ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                {t('removing')}
              </>
            ) : (
              t('remove')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
