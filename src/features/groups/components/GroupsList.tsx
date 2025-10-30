import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardActions, CardContent, Typography, Button, Grid, Alert, CircularProgress, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchGroups, deleteGroup } from '../store/groupsSlice';
import { Group } from '../types';
import { GroupFormModal } from './GroupFormModal';

export const GroupsList: React.FC = () => {
  const { t } = useTranslation('groups');
  const dispatch = useAppDispatch();

  const groups = useAppSelector((state) => state.groups.groups);
  const status = useAppSelector((state) => state.groups.status);
  const error = useAppSelector((state) => state.groups.error);
  const filterProjectId = useAppSelector((state) => state.groups.filterProjectId);
  const projects = useAppSelector((state) => state.projects.projects);

  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    //dispatch(fetchGroups(filterProjectId || undefined));
  }, [dispatch, filterProjectId]);

  const projectNameById = useMemo(() => {
    const map: Record<string, string> = {};
    projects.forEach(p => { map[p._id] = p.title; });
    return map;
  }, [projects]);

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


