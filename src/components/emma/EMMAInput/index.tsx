/**
 * EMMA Input Component
 * 
 * Healthcare-optimized input component built on Material UI TextField
 * with medical data validation and EMMA design system styling.
 */

import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { styled } from '@mui/material/styles';
import { EMMAInputProps, EMMAInputVariant, MedicalInputType } from '@/types/emma';

// Healthcare-specific input styling
interface EMMAInputRootProps {
  emmaVariant?: EMMAInputVariant;
}

const EMMAInputRoot = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'emmaVariant',
})<EMMAInputRootProps>(({ theme, emmaVariant }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: '#ffffff',
    
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
    },
    
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },

    // Healthcare-specific input variants
    ...(emmaVariant === 'medical-required' && {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
    }),

    ...(emmaVariant === 'medical-error' && {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.error.main,
      },
    }),

    ...(emmaVariant === 'medical-success' && {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.success.main,
      },
    }),
  },

  '& .MuiInputLabel-root': {
    fontSize: '1rem',
    fontWeight: 500,
    
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },

    // Required field indicator
    '&.MuiInputLabel-required::after': {
      content: '" *"',
      color: theme.palette.error.main,
      fontWeight: 600,
    },
  },

  '& .MuiFormHelperText-root': {
    fontSize: '0.75rem',
    marginLeft: 0,
    marginTop: 4,

    '&.Mui-error': {
      color: theme.palette.error.main,
    },
  },
}));

const EMMAInput: React.FC<EMMAInputProps> = ({
  label,
  type = 'text',
  emmaVariant = 'default',
  medicalType,
  required = false,
  helperText,
  error = false,
  startAdornment,
  endAdornment,
  validationRules,
  ...props
}) => {
  // Healthcare-specific input types and validation
  const getMedicalInputProps = () => {
    const baseProps = {
      type,
      required,
      error,
    };

    switch (medicalType) {
      case 'medical-id':
        return {
          ...baseProps,
          inputProps: {
            pattern: '[0-9]*',
            maxLength: 10,
            placeholder: '1234567890',
          },
        };

      case 'phone-medical':
        return {
          ...baseProps,
          inputProps: {
            pattern: '[0-9]{3}-[0-9]{3}-[0-9]{4}',
            maxLength: 12,
            placeholder: '123-456-7890',
          },
        };

      case 'email-medical':
        return {
          ...baseProps,
          type: 'email',
          inputProps: {
            placeholder: 'provider@hospital.com',
          },
        };

      case 'pgy-level':
        return {
          ...baseProps,
          type: 'number',
          inputProps: {
            min: 1,
            max: 7,
            step: 1,
            placeholder: '1-7',
          },
        };

      case 'password-medical':
        return {
          ...baseProps,
          type: 'password',
          inputProps: {
            minLength: 12,
            placeholder: 'Min 12 characters',
          },
        };

      default:
        return baseProps;
    }
  };

  // Generate helper text based on medical type
  const getMedicalHelperText = (): string | undefined => {
    if (helperText) return helperText;

    switch (medicalType) {
      case 'medical-id':
        return 'Enter 10-digit medical ID number';
      case 'phone-medical':
        return 'Format: 123-456-7890';
      case 'email-medical':
        return 'Use institutional email address';
      case 'pgy-level':
        return 'Enter PGY level (1-7)';
      case 'password-medical':
        return 'Minimum 12 characters with mixed case, numbers, and symbols';
      default:
        return helperText;
    }
  };

  const inputProps = getMedicalInputProps();

  return (
    <EMMAInputRoot
      label={label}
      emmaVariant={emmaVariant}
      helperText={getMedicalHelperText()}
      InputProps={{
        startAdornment: startAdornment && (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ),
        endAdornment: endAdornment && (
          <InputAdornment position="end">{endAdornment}</InputAdornment>
        ),
      }}
      {...inputProps}
      {...props}
    />
  );
};

export default EMMAInput;