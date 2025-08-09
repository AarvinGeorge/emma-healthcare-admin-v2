/**
 * EMMA Login Form Component
 * 
 * Comprehensive healthcare authentication form using EMMA design system
 * components with medical-specific validation and security features.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  LocalHospital,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import EMMACard from '../EMMACard';
import EMMAInput from '../EMMAInput';
import EMMAButton from '../EMMAButton';
import { EMMALoginFormProps, LoginFormData, ValidationErrors } from '@/types/emma';

// Healthcare login form styling
const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)`,
  padding: theme.spacing(2),
}));

const LoginCard = styled(EMMACard)(({ theme }) => ({
  maxWidth: 400,
  width: '100%',
  padding: theme.spacing(1),
}));

const BrandHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  
  '& .brand-icon': {
    fontSize: 48,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
  },
  
  '& .brand-title': {
    fontWeight: 700,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(0.5),
  },
  
  '& .brand-subtitle': {
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
}));

const EMMALoginForm: React.FC<EMMALoginFormProps> = ({
  onSubmit,
  loading = false,
  error = null,
  successMessage = null,
  title = 'EMMA Healthcare',
  subtitle = 'Medical Education Administration',
  onSwitchToRegister,
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Handle input changes
  const handleInputChange = (field: keyof LoginFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    } else if (!formData.email.includes('.edu') && !formData.email.includes('.org') && !formData.email.includes('.gov')) {
      errors.email = 'Please use your institutional email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <LoginContainer>
      <LoginCard emmaVariant="patient-info" elevation={3}>
        {/* Brand Header */}
        <BrandHeader>
          <LocalHospital className="brand-icon" />
          <Typography variant="h4" className="brand-title">
            {title}
          </Typography>
          <Typography variant="body2" className="brand-subtitle">
            {subtitle}
          </Typography>
        </BrandHeader>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {/* Login Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Email Input */}
          <EMMAInput
            fullWidth
            label="Email Address"
            medicalType="email-medical"
            required
            value={formData.email}
            onChange={handleInputChange('email')}
            error={!!validationErrors.email}
            helperText={validationErrors.email || 'Use your institutional email address'}
            startAdornment={<Email />}
            sx={{ mb: 2 }}
          />

          {/* Password Input */}
          <EMMAInput
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={handleInputChange('password')}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
            startAdornment={<Lock />}
            endAdornment={
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                size="small"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            }
            sx={{ mb: 2 }}
          />

          {/* Remember Me Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.rememberMe}
                onChange={handleInputChange('rememberMe')}
                color="primary"
              />
            }
            label="Keep me signed in"
            sx={{ mb: 3 }}
          />

          {/* Login Button */}
          <EMMAButton
            type="submit"
            fullWidth
            emmaVariant="medical-primary"
            emmaSize="large"
            loading={loading}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </EMMAButton>

          {/* Forgot Password Link */}
          <Box textAlign="center">
            <Link
              href="#"
              variant="body2"
              color="primary"
              sx={{ 
                fontWeight: 500,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Forgot your password?
            </Link>
          </Box>
        </Box>

        {/* Footer Notice */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
            By signing in, you agree to comply with healthcare data privacy regulations
            and institutional security policies.
          </Typography>
          
          {/* Registration Link */}
          {onSwitchToRegister && (
            <Box textAlign="center" mt={2}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={onSwitchToRegister}
                  sx={{ 
                    fontWeight: 500,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Create an account
                </Link>
              </Typography>
            </Box>
          )}
        </Box>
      </LoginCard>
    </LoginContainer>
  );
};

export default EMMALoginForm;