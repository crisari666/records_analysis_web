import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouter } from './app/router';
import { UserValidation } from './features/dashboard/components';

const theme = createTheme({
  components: {
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
      },
    },
  },
});

export const App = () => (
  <ThemeProvider theme={theme}>
    <UserValidation />
    <CssBaseline />
    <AppRouter />
  </ThemeProvider>
);
