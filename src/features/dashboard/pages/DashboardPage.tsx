import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
// import { logoutAsync, getCurrentUserAsync } from '../../auth/store/authSlice';
import { LanguageSwitcher } from '../../../shared/components/LanguageSwitcher';

export const DashboardPage = () => {
  const { t } = useTranslation('dashboard');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      // dispatch(getCurrentUserAsync());
    }
  }, [dispatch, user]);

  const handleLogout = async () => {
    // await dispatch(logoutAsync());
    await navigate('/');
  };

  if (isLoading) {
    return (
      <Container>
        <Typography>{t('dashboard.loading')}</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t('dashboard.title')}
          </Typography>
          <LanguageSwitcher />
          <Button color="inherit" onClick={handleLogout} sx={{ ml: 2 }}>
            {t('dashboard.logout')}
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('dashboard.welcome')}
        </Typography>
        {user && (
          <Typography variant="h6" color="text.secondary">
            {t('dashboard.hello', { name: user.name })}
          </Typography>
        )}
      </Container>
    </Box>
  );
};
