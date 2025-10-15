import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { updateProjectDevices } from '../store/projectsSlice';
import { fetchDevicesAsync, selectDevices, selectLoading as selectDevicesLoading } from '../../devices/store/devicesSlice';
import { Project } from '../types';
import { CallerDevice } from '../../devices/types';

type ProjectDevicesModalProps = {
  open: boolean;
  onClose: () => void;
  project: Project | null;
};

export const ProjectDevicesModal: React.FC<ProjectDevicesModalProps> = ({
  open,
  onClose,
  project,
}) => {
  const { t } = useTranslation('projects');
  const dispatch = useAppDispatch();
  
  const devices = useAppSelector(selectDevices);
  const devicesLoading = useAppSelector(selectDevicesLoading);
  
  const [selectedDevices, setSelectedDevices] = useState<CallerDevice[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter devices to show only those without projects
  const availableDevices = useMemo(() => {
    return devices.filter(device => !device.project);
  }, [devices]);

  // Load devices when modal opens
  useEffect(() => {
    if (open) {
      dispatch(fetchDevicesAsync());
    }
  }, [open, dispatch]);

  // Set initial selected devices when project changes
  useEffect(() => {
    if (project && open) {
      const projectDevices = devices.filter(device => 
        project.devices.includes(device._id)
      );
      setSelectedDevices(projectDevices);
    }
  }, [project, devices, open]);

  const handleClose = () => {
    setSelectedDevices([]);
    onClose();
  };

  const handleSubmit = async () => {
    if (!project) return;

    setIsSubmitting(true);
    try {
      const deviceIds = selectedDevices.map(device => device._id);
      await dispatch(updateProjectDevices({
        id: project._id,
        devices: deviceIds,
      })).unwrap();
      handleClose();
    } catch (error) {
      console.error('Failed to update project devices:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDeviceLabel = (device: CallerDevice) => {
    return `${device.title} (${device.brand} ${device.model}) - ${device.imei}`;
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {t('manage_devices')} - {project?.title}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('select_devices_description')}
          </Typography>

          {devicesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Autocomplete
              multiple
              options={availableDevices}
              value={selectedDevices}
              onChange={(_, newValue) => setSelectedDevices(newValue)}
              getOptionLabel={getDeviceLabel}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('select_devices')}
                  placeholder={t('search_devices')}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option._id}
                    label={option.title}
                    size="small"
                  />
                ))
              }
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {option.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.brand} {option.model} - {option.imei}
                    </Typography>
                  </Box>
                </Box>
              )}
              noOptionsText={t('no_available_devices')}
            />
          )}

          {availableDevices.length === 0 && !devicesLoading && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('no_available_devices_info')}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          {t('cancel')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={20} />
          ) : (
            t('save_devices')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
