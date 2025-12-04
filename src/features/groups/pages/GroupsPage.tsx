import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GroupsControls, GroupsList } from '../components';

export const GroupsPage: React.FC = () => {
  const { t } = useTranslation('groups');
  console.log("groups page")
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('title')}
      </Typography>

      <GroupsControls />
      <GroupsList />
    </Box>
  );
};


