/**
 * EMMA Button Component
 * 
 * Healthcare-optimized button component built on Material UI Button
 * with EMMA design system styling and medical-specific functionality.
 */

import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { EMMAButtonProps, EMMAButtonVariant, EMMAButtonSize } from '@/types/emma';

// Healthcare-specific button variants
interface EMMAButtonRootProps {
  emmaVariant?: EMMAButtonVariant;
  emmaSize?: EMMAButtonSize;
}

const EMMAButtonRoot = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'emmaVariant' && prop !== 'emmaSize',
})<EMMAButtonRootProps>(({ theme, emmaVariant, emmaSize }) => ({
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: 8,
  minHeight: emmaSize === 'large' ? 48 : emmaSize === 'small' ? 32 : 40,
  
  // Healthcare-specific button variants
  ...(emmaVariant === 'medical-primary' && {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, #1e40af 100%)`,
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  }),

  ...(emmaVariant === 'medical-success' && {
    backgroundColor: theme.palette.success.main,
    color: '#ffffff',
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
    },
  }),

  ...(emmaVariant === 'medical-warning' && {
    backgroundColor: theme.palette.warning.main,
    color: '#000000',
    '&:hover': {
      backgroundColor: theme.palette.warning.dark,
    },
  }),

  ...(emmaVariant === 'medical-error' && {
    backgroundColor: theme.palette.error.main,
    color: '#ffffff',
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  }),

  ...(emmaVariant === 'pgy-indicator' && {
    minWidth: 40,
    width: 40,
    height: 40,
    borderRadius: '50%',
    fontSize: '0.875rem',
    fontWeight: 700,
  }),

  // Disabled state for healthcare contexts
  '&.Mui-disabled': {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[500],
  },
}));

const EMMAButton: React.FC<EMMAButtonProps> = ({
  children,
  emmaVariant = 'medical-primary',
  emmaSize = 'medium',
  pgyLevel,
  loading = false,
  disabled = false,
  onClick,
  ...props
}) => {
  // Handle PGY level indicator styling
  const getPGYStyling = (): React.CSSProperties => {
    if (pgyLevel && emmaVariant === 'pgy-indicator') {
      return {
        backgroundColor: `var(--emma-pgy-${pgyLevel})`,
        color: '#ffffff',
      };
    }
    return {};
  };

  return (
    <EMMAButtonRoot
      emmaVariant={emmaVariant}
      emmaSize={emmaSize}
      disabled={disabled || loading}
      onClick={onClick}
      sx={getPGYStyling()}
      {...props}
    >
      {loading ? (
        <CircularProgress
          size={emmaSize === 'large' ? 24 : emmaSize === 'small' ? 16 : 20}
          color="inherit"
          sx={{ mr: 1 }}
        />
      ) : null}
      {children}
    </EMMAButtonRoot>
  );
};

export default EMMAButton;