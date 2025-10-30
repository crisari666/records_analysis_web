import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Autocomplete, TextField } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { GroupFormModal } from './GroupFormModal';
import { fetchProjects, selectProjects } from '../../projects/store/projectsSlice';
import { setFilterProjectId, fetchGroups } from '../store/groupsSlice';

export const GroupsControls: React.FC = () => {
  const { t } = useTranslation('groups');
  const dispatch = useAppDispatch();
  const projects = useAppSelector((state) => selectProjects(state));
  const filterProjectId = useAppSelector((state) => state.groups.filterProjectId);

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projects.length]);

  const projectOptions = useMemo(() => projects.map(p => ({ label: p.title, value: p._id })), [projects]);

  const handleCreate = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleFilterChange = (_: any, val: { label: string; value: string } | null) => {
    const newProjectId = val ? val.value : null;
    dispatch(setFilterProjectId(newProjectId));
    dispatch(fetchGroups(newProjectId || undefined));
  };

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Autocomplete
          sx={{ minWidth: 280 }}
          options={projectOptions}
          value={projectOptions.find(o => o.value === filterProjectId) || null}
          onChange={handleFilterChange}
          renderInput={(params) => <TextField {...params} label={t('filter_by_project')} />}
          clearOnEscape
        />
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate} sx={{ minWidth: 150 }}>
          {t('create_group')}
        </Button>
      </Box>

      <GroupFormModal open={modalOpen} onClose={handleCloseModal} group={null} />
    </>
  );
};


