/**
 * EMMA Healthcare Component TypeScript Interfaces
 * 
 * Comprehensive type definitions for all EMMA healthcare components
 * with Material UI 5 integration and medical-specific props.
 */

import { ReactNode, MouseEventHandler } from 'react';
import { ButtonProps, TextFieldProps, CardProps } from '@mui/material';

// Healthcare-specific types
export type PGYLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type EvaluationStatus = 
  | 'pending' 
  | 'inProgress' 
  | 'completed' 
  | 'approved' 
  | 'cancelled';

export type EMMAButtonVariant = 
  | 'medical-primary' 
  | 'medical-secondary'
  | 'medical-success' 
  | 'medical-warning' 
  | 'medical-error' 
  | 'pgy-indicator';

export type EMMAButtonSize = 'small' | 'medium' | 'large';

export type EMMAInputVariant = 
  | 'default' 
  | 'medical-required' 
  | 'medical-error' 
  | 'medical-success';

export type MedicalInputType = 
  | 'medical-id' 
  | 'phone-medical' 
  | 'email-medical' 
  | 'pgy-level' 
  | 'password-medical';

export type EMMACardVariant = 
  | 'default' 
  | 'patient-info' 
  | 'evaluation-card' 
  | 'urgent-card' 
  | 'warning-card' 
  | 'resident-card' 
  | 'dashboard-metric';

// EMMAButton Props Interface
export interface EMMAButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  children: ReactNode;
  emmaVariant?: EMMAButtonVariant;
  emmaSize?: EMMAButtonSize;
  pgyLevel?: PGYLevel;
  loading?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

// EMMAInput Props Interface
export interface EMMAInputProps extends Omit<TextFieldProps, 'variant'> {
  label: string;
  type?: string;
  emmaVariant?: EMMAInputVariant;
  medicalType?: MedicalInputType;
  required?: boolean;
  helperText?: string;
  error?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  validationRules?: Record<string, any>;
}

// Status Chip Interface
export interface StatusChip {
  status: EvaluationStatus;
  label: string;
}

// EMMACard Props Interface
export interface EMMACardProps extends Omit<CardProps, 'variant'> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  emmaVariant?: EMMACardVariant;
  statusChip?: StatusChip;
  pgyLevel?: PGYLevel;
  actions?: ReactNode;
  elevation?: number;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

// EMMALoginForm Props Interface
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ValidationErrors {
  [key: string]: string | undefined;
  email?: string;
  password?: string;
}

export interface EMMALoginFormProps {
  onSubmit?: (formData: LoginFormData) => void;
  loading?: boolean;
  error?: string | null;
  successMessage?: string | null;
  title?: string;
  subtitle?: string;
  onSwitchToRegister?: () => void;
}

// Healthcare Theme Extension Types (already defined in theme file)
export interface HealthcareColorShade {
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

export interface EvaluationColors {
  pending: string;
  inProgress: string;
  completed: string;
  approved: string;
  cancelled: string;
}

export interface PGYColors {
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
}