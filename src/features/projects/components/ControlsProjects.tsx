import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ProjectFormModal } from './ProjectFormModal';

export const ControlsProjects: React.FC = () => {
  const { t } = useTranslation('projects');
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreateProject = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateProject}
          sx={{ minWidth: 150 }}
        >
          {t('create_project')}
        </Button>
        
      </Box>
      <ProjectFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        project={null}
      />
    </>
  );
};
