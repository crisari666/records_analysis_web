import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouter } from './app/router';

const theme = createTheme();

export const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AppRouter />
  </ThemeProvider>
);
