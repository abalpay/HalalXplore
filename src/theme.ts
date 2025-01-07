import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E90FF', // Electric Blue
    },
    secondary: {
      main: '#FF6F61', // Coral Orange
    },
    background: {
      default: '#2B2D42', // Dark Slate
      paper: '#2B2D42',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
    },
    success: {
      main: '#98FF98', // Mint Green
    },
    warning: {
      main: '#FFD700', // Yellow
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1.1rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '10px 24px',
          fontSize: '1rem',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#1976D2',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
  },
})

export default theme;