import React, { useState, useEffect } from 'react';
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
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { updateProjectUsers } from '../store/projectsSlice';
import { getUsersAsync } from '../../users/store/usersSlice';
import { Project } from '../types';
import { User } from '../../users/types';

type ProjectUsersModalProps = {
  open: boolean;
  onClose: () => void;
  project: Project | null;
};

export const ProjectUsersModal: React.FC<ProjectUsersModalProps> = ({
  open,
  onClose,
  project,
}) => {
  const { t } = useTranslation('projects');
  const dispatch = useAppDispatch();
  
  const users = useAppSelector((state) => state.users.users);
  const usersLoading = useAppSelector((state) => state.users.isLoading);
  const projectsStatus = useAppSelector((state) => state.projects.status);
  
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load users when modal opens
  useEffect(() => {
    if (open) {
      dispatch(getUsersAsync());
    }
  }, [open, dispatch]);

  // Set initial selected users when project changes
  useEffect(() => {
    if (project && open && users.length > 0) {
      const projectUserIds = project.users || [];
      const projectUsers = users.filter(user => 
        projectUserIds.includes(user._id)
      );
      setSelectedUsers(projectUsers);
    } else if (!project?.users || project.users?.length === 0) {
      setSelectedUsers([]);
    }
  }, [project, users, open]);

  const handleClose = () => {
    setSelectedUsers([]);
    onClose();
  };

  const handleSubmit = async () => {
    if (!project) return;

    setIsSubmitting(true);
    try {
      const userIds = selectedUsers.map(user => user._id);
      await dispatch(updateProjectUsers({
        id: project._id,
        users: userIds,
      })).unwrap();
      handleClose();
    } catch (error) {
      console.error('Failed to update project users:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserLabel = (user: User) => {
    return `${user.name} (${user.email})`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {t('manage_users')} - {project?.title}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {project && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                {t('project_information')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <strong>{t('project_title')}:</strong> {project.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {t('created_at', { date: formatDate(project.createdAt) })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('updated_at', { date: formatDate(project.updatedAt) })}
              </Typography>
              <Divider sx={{ mt: 2, mb: 2 }} />
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('select_users_description')}
          </Typography>

          {usersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Autocomplete
              multiple
              options={users}
              value={selectedUsers}
              onChange={(_, newValue) => setSelectedUsers(newValue)}
              getOptionLabel={getUserLabel}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('select_users')}
                  placeholder={t('search_users')}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={'project-user-' + option._id}
                    label={option.name}
                    size="small"
                  />
                ))
              }
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {option.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.email} - {option.role}
                    </Typography>
                  </Box>
                </Box>
              )}
              noOptionsText={t('no_available_users')}
            />
          )}

          {users.length === 0 && !usersLoading && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {t('no_available_users_info')}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting || projectsStatus === 'loading'}>
          {t('cancel')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting || projectsStatus === 'loading'}
        >
          {isSubmitting || projectsStatus === 'loading' ? (
            <CircularProgress size={20} />
          ) : (
            t('save_users')
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

