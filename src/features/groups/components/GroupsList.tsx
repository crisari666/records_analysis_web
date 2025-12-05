import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardActions, CardContent, Typography, Button, Grid, Alert, CircularProgress, Chip, Divider } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchGroups, deleteGroup } from '../store/groupsSlice';
import { getUsersAsync } from '../../users/store/usersSlice';
import { Group } from '../types';
import { GroupFormModal } from './GroupFormModal';

export const GroupsList: React.FC = () => {
  const { t } = useTranslation('groups');
  const dispatch = useAppDispatch();

  const groups = useAppSelector((state) => state.groups.groups);
  const status = useAppSelector((state) => state.groups.status);
  const error = useAppSelector((state) => state.groups.error);
  const projects = useAppSelector((state) => state.projects.projects);
  const users = useAppSelector((state) => state.users.users);

  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    console.log("fetching groups in groups list")
    dispatch(fetchGroups());
  }, [dispatch]);

  useEffect(() => {
    if (users.length === 0) {
      dispatch(getUsersAsync());
    }
  }, [dispatch, users.length]);

  const projectNameById = useMemo(() => {
    const map: Record<string, string> = {};
    projects.forEach(p => { map[p._id] = p.title; });
    return map;
  }, [projects]);

  const userById = useMemo(() => {
    const map: Record<string, typeof users[0]> = {};
    users.forEach(u => { map[u._id] = u; });
    return map;
  }, [users]);

  const getUsersByProjectInGroup = (group: Group) => {
    const usersByProject: Record<string, string[]> = {};
    group.users.forEach(userId => {
      const user = userById[userId];
      if (user && user.projects) {
        user.projects.forEach(projectId => {
          if (!usersByProject[projectId]) {
            usersByProject[projectId] = [];
          }
          usersByProject[projectId].push(userId);
        });
      } else if (user) {
        // User with no projects
        if (!usersByProject['no-project']) {
          usersByProject['no-project'] = [];
        }
        usersByProject['no-project'].push(userId);
      }
    });
    return usersByProject;
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setModalOpen(true);
  };

  const handleDelete = (groupId: string) => {
    if (window.confirm(t('confirm_delete'))) {
      dispatch(deleteGroup(groupId));
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingGroup(null);
  };

  if (status === 'loading' && groups.length === 0) {
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

  if (groups.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6" color="text.secondary">
          {t('no_groups')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {groups.map((group) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={group._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {group.name}
                </Typography>

                <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={t('project_chip', { name: projectNameById[group.projectId] || group.projectId })} size="small" color="primary" variant="outlined" />
                  <Chip label={t('users_count', { count: group.users.length })} size="small" color="secondary" variant="outlined" />
                </Box>

                {group.users.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      {t('users_by_project')}:
                    </Typography>
                    {Object.entries(getUsersByProjectInGroup(group)).map(([projectId, userIds]) => (
                      <Box key={projectId} sx={{ mb: 1 }}>
                        <Chip
                          label={`${projectId === 'no-project' ? t('no_project_assigned') : projectNameById[projectId] || projectId}: ${userIds.length}`}
                          size="small"
                          variant="outlined"
                          color={projectId === 'no-project' ? 'default' : 'primary'}
                          sx={{ mb: 0.5 }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                <Divider sx={{ my: 1 }} />

                <Typography variant="body2" color="text.secondary">
                  {t('created_at', { date: new Date(group.createdAt).toLocaleDateString() })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('updated_at', { date: new Date(group.updatedAt).toLocaleDateString() })}
                </Typography>
              </CardContent>

              <CardActions>
                <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(group)}>
                  {t('edit')}
                </Button>
                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(group._id)}>
                  {t('delete')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <GroupFormModal open={modalOpen} onClose={handleCloseModal} group={editingGroup} />
    </Box>
  );
};


