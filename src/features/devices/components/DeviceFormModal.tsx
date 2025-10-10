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
  CircularProgress,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { createDeviceAsync, updateDeviceAsync, clearError } from '../store/devicesSlice';
import { selectLoading, selectError } from '../store/devicesSlice';
import type { CallerDevice, CreateCallerDeviceRequest, UpdateCallerDeviceRequest } from '../types';

type DeviceFormModalProps = {
  open: boolean;
  onClose: () => void;
  device?: CallerDevice | null;
};

export const DeviceFormModal: React.FC<DeviceFormModalProps> = ({ open, onClose, device }) => {
  const { t } = useTranslation('devices');
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  const [formData, setFormData] = useState({
    imei: '',
    brand: '',
    model: '',
    title: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isEditing = Boolean(device);

  useEffect(() => {
    if (device) {
      setFormData({
        imei: device.imei,
        brand: device.brand,
        model: device.model,
        title: device.title,
      });
    } else {
      setFormData({
        imei: '',
        brand: '',
        model: '',
        title: '',
      });
    }
    setFormErrors({});
    dispatch(clearError());
  }, [device, dispatch]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.imei.trim()) {
      errors.imei = t('form.imeiRequired');
    } else if (!/^\d{15}$/.test(formData.imei.trim())) {
      errors.imei = t('form.imeiInvalid');
    }

    if (!formData.brand.trim()) {
      errors.brand = t('form.brandRequired');
    }

    if (!formData.model.trim()) {
      errors.model = t('form.modelRequired');
    }

    if (!formData.title.trim()) {
      errors.title = t('form.titleRequired');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const trimmedData = {
      imei: formData.imei.trim(),
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      title: formData.title.trim(),
    };

    try {
      if (isEditing && device) {
        await dispatch(updateDeviceAsync({ id: device._id, deviceData: trimmedData as UpdateCallerDeviceRequest })).unwrap();
      } else {
        await dispatch(createDeviceAsync(trimmedData as CreateCallerDeviceRequest)).unwrap();
      }
      onClose();
    } catch (err) {
      // Error is handled by the slice
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? t('editDevice') : t('addDevice')}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {error && (
              <Alert severity="error">
                {isEditing ? t('updateError') : t('createError')}: {error}
              </Alert>
            )}

            <TextField
              label={t('imei')}
              value={formData.imei}
              onChange={handleInputChange('imei')}
              error={Boolean(formErrors.imei)}
              helperText={formErrors.imei}
              placeholder={t('form.imeiPlaceholder')}
              fullWidth
              disabled={loading}
              inputProps={{ maxLength: 15 }}
            />

            <TextField
              label={t('brand')}
              value={formData.brand}
              onChange={handleInputChange('brand')}
              error={Boolean(formErrors.brand)}
              helperText={formErrors.brand}
              placeholder={t('form.brandPlaceholder')}
              fullWidth
              disabled={loading}
            />

            <TextField
              label={t('model')}
              value={formData.model}
              onChange={handleInputChange('model')}
              error={Boolean(formErrors.model)}
              helperText={formErrors.model}
              placeholder={t('form.modelPlaceholder')}
              fullWidth
              disabled={loading}
            />

            <TextField
              label={t('deviceTitle')}
              value={formData.title}
              onChange={handleInputChange('title')}
              error={Boolean(formErrors.title)}
              helperText={formErrors.title}
              placeholder={t('form.titlePlaceholder')}
              fullWidth
              disabled={loading}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            {t('form.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            {isEditing ? t('form.save') : t('form.create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
