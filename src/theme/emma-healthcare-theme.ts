import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';
import { PaletteOptions } from '@mui/material/styles';

/**
 * EMMA Healthcare Design System - Material UI Theme
 * 
 * This theme converts the previous Tailwind-based healthcare design tokens
 * into a comprehensive Material UI theme optimized for medical applications.
 */

// Define healthcare-specific color interfaces
interface HealthcareColorShade {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

interface EvaluationColors {
  pending: string;
  inProgress: string;
  completed: string;
  approved: string;
  cancelled: string;
}

interface PGYColors {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
}

interface HealthcareColors {
  primary: HealthcareColorShade;
  success: HealthcareColorShade;
  warning: HealthcareColorShade;
  error: HealthcareColorShade;
  grey: HealthcareColorShade;
  evaluation: EvaluationColors;
  pgy: PGYColors;
}

// Extend MUI's Palette interface to include custom healthcare colors
declare module '@mui/material/styles' {
  interface Palette {
    evaluation: EvaluationColors;
    pgy: PGYColors;
    getPGYColor: (pgyLevel: keyof PGYColors) => string;
    getEvaluationColor: (status: keyof EvaluationColors) => string;
  }

  interface PaletteOptions {
    evaluation?: EvaluationColors;
    pgy?: PGYColors;
  }
}

// Healthcare Color Palette (converted from Tailwind design tokens)
const healthcareColors: HealthcareColors = {
  // Healthcare Primary Blue (instead of Material UI's pink)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main healthcare blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Healthcare Success Green
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0', 
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },

  // Healthcare Warning Amber
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d', 
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Healthcare Error Red
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Medical Professional Grays
  grey: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Healthcare Status Colors (custom additions)
  evaluation: {
    pending: '#f59e0b',
    inProgress: '#3b82f6',
    completed: '#10b981',
    approved: '#059669', 
    cancelled: '#ef4444',
  },

  // PGY Level Colors for Resident Identification
  pgy: {
    1: '#ef4444', // Red - PGY-1
    2: '#f59e0b', // Orange - PGY-2
    3: '#10b981', // Green - PGY-3
    4: '#3b82f6', // Blue - PGY-4
    5: '#8b5cf6', // Purple - PGY-5
    6: '#ec4899', // Pink - PGY-6
    7: '#6b7280', // Gray - PGY-7
  },
};

// Create the EMMA Healthcare Theme
export const emmaHealthcareTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    
    // Primary brand color (healthcare blue)
    primary: {
      main: healthcareColors.primary[500],
      light: healthcareColors.primary[400],
      dark: healthcareColors.primary[600],
      contrastText: '#ffffff',
    },

    // Secondary color (professional gray)  
    secondary: {
      main: healthcareColors.grey[600],
      light: healthcareColors.grey[400],
      dark: healthcareColors.grey[700],
      contrastText: '#ffffff',
    },

    // Success color (healthcare green)
    success: {
      main: healthcareColors.success[500],
      light: healthcareColors.success[400],
      dark: healthcareColors.success[600],
      contrastText: '#ffffff',
    },

    // Warning color (healthcare amber) 
    warning: {
      main: healthcareColors.warning[500],
      light: healthcareColors.warning[400],
      dark: healthcareColors.warning[600],
      contrastText: '#000000',
    },

    // Error color (healthcare red)
    error: {
      main: healthcareColors.error[500],
      light: healthcareColors.error[400], 
      dark: healthcareColors.error[600],
      contrastText: '#ffffff',
    },

    // Info color (using primary blue)
    info: {
      main: healthcareColors.primary[500],
      light: healthcareColors.primary[400],
      dark: healthcareColors.primary[600], 
      contrastText: '#ffffff',
    },

    // Background colors
    background: {
      default: '#f9fafb', // Light gray background
      paper: '#ffffff',
    },

    // Text colors
    text: {
      primary: healthcareColors.grey[900],
      secondary: healthcareColors.grey[600],
      disabled: healthcareColors.grey[400],
    },

    // Divider color
    divider: healthcareColors.grey[200],

    // Custom healthcare colors (accessible via theme.palette.evaluation, etc.)
    evaluation: healthcareColors.evaluation,
    pgy: healthcareColors.pgy,
  },

  // Typography optimized for healthcare applications
  typography: {
    fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(','),
    
    // Enhanced readability for medical data
    fontSize: 14,
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700,

    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem', 
      lineHeight: 1.3,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem', 
      lineHeight: 1.5,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.0075em',
    },
    
    // Body text optimized for medical forms and data
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },

    // Buttons and labels
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none', // No all-caps for medical UI
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.66,
      letterSpacing: '0.03333em',
    },
  },

  // Shape and spacing optimized for touch-friendly healthcare interfaces
  shape: {
    borderRadius: 8, // Rounded corners for modern medical UI
  },

  spacing: 8, // Base spacing unit

  // Shadows for depth and hierarchy
  shadows: [
    'none',
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 1
    '0px 4px 25px rgba(0, 0, 0, 0.12)', // 2
    '0px 10px 40px rgba(0, 0, 0, 0.15)', // 3
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 4
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 5
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 6
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 7
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 8
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 9
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 10
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 11
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 12
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 13
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 14
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 15
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 16
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 17
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 18
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 19
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 20
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 21
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 22
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 23
    '0px 2px 15px rgba(0, 0, 0, 0.08)', // 24
  ],

  // Component customizations for healthcare use
  components: {
    // Button customizations
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${healthcareColors.primary[500]} 0%, ${healthcareColors.primary[600]} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${healthcareColors.primary[600]} 0%, ${healthcareColors.primary[700]} 100%)`,
          },
        },
      },
    },

    // Card customizations  
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${healthcareColors.grey[200]}`,
          boxShadow: '0px 2px 15px rgba(0, 0, 0, 0.08)',
        },
      },
    },

    // Input field customizations
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: healthcareColors.primary[400],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: healthcareColors.primary[500],
              borderWidth: 2,
            },
          },
        },
      },
    },

    // AppBar customizations
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: healthcareColors.grey[900],
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
          borderBottom: `1px solid ${healthcareColors.grey[200]}`,
        },
      },
    },

    // Chip customizations for badges/status indicators
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

// Healthcare-specific theme extensions
emmaHealthcareTheme.palette.getPGYColor = (pgyLevel: keyof PGYColors): string => {
  return healthcareColors.pgy[pgyLevel] || healthcareColors.grey[500];
};

emmaHealthcareTheme.palette.getEvaluationColor = (status: keyof EvaluationColors): string => {
  return healthcareColors.evaluation[status] || healthcareColors.grey[500];  
};

export default emmaHealthcareTheme;