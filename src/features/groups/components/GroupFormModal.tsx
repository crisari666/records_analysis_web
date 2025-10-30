import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  Autocomplete,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { createGroup, updateGroup, clearError as clearGroupsError } from '../store/groupsSlice';
import { Group, CreateGroupRequest, UpdateGroupRequest } from '../types';
import { getUsersAsync } from '../../users/store/usersSlice';
import { fetchProjects } from '../../projects/store/projectsSlice';

type GroupFormModalProps = {
  open: boolean;
  onClose: () => void;
  group?: Group | null;
};

export const GroupFormModal: React.FC<GroupFormModalProps> = ({ open, onClose, group }) => {
  const { t } = useTranslation('groups');
  const dispatch = useAppDispatch();

  const status = useAppSelector((state) => state.groups.status);
  const error = useAppSelector((state) => state.groups.error);
  const users = useAppSelector((state) => state.users.users);
  const projects = useAppSelector((state) => state.projects.projects);

  const [formData, setFormData] = useState<{ name: string; projectId: string; users: string[] }>({
    name: '',
    projectId: '',
    users: [],
  });

  useEffect(() => {
    if (open) {
      if (users.length === 0) {
        dispatch(getUsersAsync());
      }
      if (projects.length === 0) {
        dispatch(fetchProjects());
      }
    }
  }, [open, dispatch, users.length, projects.length]);

  useEffect(() => {
    if (group) {
      setFormData({ name: group.name, projectId: group.projectId, users: group.users });
    } else {
      setFormData({ name: '', projectId: '', users: [] });
    }
  }, [group, open]);

  const userOptions = useMemo(() => users.map(u => ({ label: u.name, value: u.id })), [users]);
  const projectOptions = useMemo(() => projects.map(p => ({ label: p.title, value: p._id })), [projects]);

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.projectId) return;
    if (group) {
      const updateData: UpdateGroupRequest = {
        id: group._id,
        name: formData.name.trim(),
        projectId: formData.projectId,
        users: formData.users,
      };
      dispatch(updateGroup(updateData));
    } else {
      const createData: CreateGroupRequest = {
        name: formData.name.trim(),
        projectId: formData.projectId,
        users: formData.users,
      };
      dispatch(createGroup(createData));
    }
  };

  const handleClose = () => {
    if (status !== 'loading') {
      dispatch(clearGroupsError());
      onClose();
    }
  };

  const isEditMode = !!group;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditMode ? t('edit_group') : t('create_group')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => dispatch(clearGroupsError())}>
              {error}
            </Alert>
          )}

          <TextField
            label={t('group_title')}
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
            required
            disabled={status === 'loading'}
          />

          <Autocomplete
            options={projectOptions}
            value={projectOptions.find(o => o.value === formData.projectId) || null}
            onChange={(_, val) => setFormData(prev => ({ ...prev, projectId: val ? val.value : '' }))}
            renderInput={(params) => (
              <TextField {...params} label={t('project')} required disabled={status === 'loading'} />
            )}
          />

          <Autocomplete
            multiple
            options={userOptions}
            value={userOptions.filter(o => formData.users.includes(o.value))}
            onChange={(_, vals) => setFormData(prev => ({ ...prev, users: vals.map(v => v.value) }))}
            renderInput={(params) => (
              <TextField {...params} label={t('users')} disabled={status === 'loading'} />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={status === 'loading'}>
          {t('cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={status === 'loading' || !formData.name.trim() || !formData.projectId}>
          {status === 'loading' ? t('loading') : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


