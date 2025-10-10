import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchDevicesAsync, deleteDeviceAsync } from '../store/devicesSlice';
import { selectError } from '../store/devicesSlice';
import { DevicesList, DeviceFormModal } from '../components';
import type { CallerDevice } from '../types';

export const DevicesPage: React.FC = () => {
  const { t } = useTranslation('devices');
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<CallerDevice | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<CallerDevice | null>(null);

  useEffect(() => {
    dispatch(fetchDevicesAsync());
  }, [dispatch]);

  const handleAddDevice = () => {
    setSelectedDevice(null);
    setIsModalOpen(true);
  };

  const handleEditDevice = (device: CallerDevice) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const handleDeleteDevice = (device: CallerDevice) => {
    setDeviceToDelete(device);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deviceToDelete) {
      try {
        await dispatch(deleteDeviceAsync(deviceToDelete._id)).unwrap();
        setDeleteDialogOpen(false);
        setDeviceToDelete(null);
      } catch (err) {
        // Error is handled by the slice
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDevice(null);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeviceToDelete(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddDevice}
        >
          {t('addDevice')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('error')}: {error}
        </Alert>
      )}

      <DevicesList
        onEditDevice={handleEditDevice}
        onDeleteDevice={handleDeleteDevice}
      />

      <DeviceFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        device={selectedDevice}
      />

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t('deleteDevice')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('confirmDelete')}
          </Typography>
          {deviceToDelete && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {deviceToDelete.title} ({deviceToDelete.brand} {deviceToDelete.model})
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            {t('form.cancel')}
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            {t('deleteDevice')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
