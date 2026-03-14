import { createTheme } from '@mui/material/styles'

// Modern E-Commerce Color Scheme (Amazon-Flipkart inspired)
const colors = {
  primary: '#FF9900', // Amazon Orange - Vibrant, attention-grabbing
  secondary: '#1F90D8', // Flipkart Blue - Trust and professionalism
  background: '#FFFFFF',
  backgroundAlt: '#F5F5F5', // Light gray for sections
  text: '#000000',
  textSecondary: '#333333',
  textLight: '#666666',
  border: '#E0E0E0',
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
}

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      light: '#FFB84D',
      dark: '#CC7A00',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.secondary,
      light: '#5BA5E5',
      dark: '#0D5C9E',
      contrastText: '#FFFFFF',
    },
    background: {
      default: colors.background,
      paper: colors.background,
    },
    text: {
      primary: colors.text,
      secondary: colors.textSecondary,
    },
    error: {
      main: colors.error,
    },
    warning: {
      main: colors.warning,
    },
    info: {
      main: colors.info,
    },
    success: {
      main: colors.success,
    },
    divider: colors.border,
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
    // Updated typography sizes for modern e-commerce
    h1: {
      fontSize: '32px',
      fontWeight: 700,
      color: colors.text,
      lineHeight: 1.3,
    },
    h2: {
      fontSize: '28px',
      fontWeight: 700,
      color: colors.text,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '24px',
      fontWeight: 700,
      color: colors.text,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '20px',
      fontWeight: 600,
      color: colors.text,
      lineHeight: 1.3,
    },
    h5: {
      fontSize: '16px',
      fontWeight: 600,
      color: colors.textSecondary,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '14px',
      fontWeight: 600,
      color: colors.textSecondary,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '14px',
      fontWeight: 400,
      color: colors.textSecondary,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '12px',
      fontWeight: 400,
      color: colors.textLight,
      lineHeight: 1.5,
    },
    button: {
      fontSize: '14px',
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.25px',
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 4,
  breakpoints: {
    values: {
      xs: 0,
      sm: 480,
      md: 768,
      lg: 1024,
      xl: 1440,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '6px',
          minHeight: '40px',
          padding: '8px 16px',
          fontSize: '14px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        containedPrimary: {
          backgroundColor: colors.primary,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#CC7A00',
          },
        },
        outline: {
          borderColor: colors.border,
          '&:hover': {
            borderColor: colors.primary,
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          border: `1px solid ${colors.border}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            transform: 'scale(1.02)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: colors.border,
            },
            '&:hover fieldset': {
              borderColor: colors.primary,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          backgroundColor: colors.background,
          color: colors.text,
          borderBottom: `1px solid ${colors.border}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          height: '32px',
        },
      },
    },
  },
})
