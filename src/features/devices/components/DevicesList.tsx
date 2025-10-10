import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../app/hooks';
import { selectDevices, selectLoading, selectError } from '../store/devicesSlice';
import type { CallerDevice } from '../types';

type DevicesListProps = {
  onEditDevice: (device: CallerDevice) => void;
  onDeleteDevice: (device: CallerDevice) => void;
};

export const DevicesList: React.FC<DevicesListProps> = ({ onEditDevice, onDeleteDevice }) => {
  const { t } = useTranslation('devices');
  const devices = useAppSelector(selectDevices);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          {t('loading')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {t('error')}: {error}
      </Alert>
    );
  }

  if (devices.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="text.secondary">
          {t('noDevices')}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('imei')}</TableCell>
            <TableCell>{t('brand')}</TableCell>
            <TableCell>{t('model')}</TableCell>
            <TableCell>{t('deviceTitle')}</TableCell>
            <TableCell>{t('createdAt')}</TableCell>
            <TableCell align="center">{t('actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device._id} hover>
              <TableCell>
                <Typography variant="body2" fontFamily="monospace">
                  {device.imei}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label={device.brand} size="small" variant="outlined" />
              </TableCell>
              <TableCell>{device.model}</TableCell>
              <TableCell>{device.title}</TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {new Date(device.createdAt).toLocaleDateString()}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <IconButton
                  size="small"
                  onClick={() => onEditDevice(device)}
                  color="primary"
                  title={t('editDevice')}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDeleteDevice(device)}
                  color="error"
                  title={t('deleteDevice')}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
