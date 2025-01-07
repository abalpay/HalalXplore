import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Header from './components/Header';
import Home from './pages/Home';
import Discover from './pages/Discover';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E90FF',
    },
    secondary: {
      main: '#FF6F61',
    },
    background: {
      default: '#2B2D42',
      paper: '#2B2D42',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <Box sx={{ flex: 1, mt: 8 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
            </Routes>
          </Box>
        </Box>
      </ThemeProvider>
    </BrowserRouter>
  );
}