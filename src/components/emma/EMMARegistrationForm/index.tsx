/**
 * EMMA Registration Form Component
 * 
 * Healthcare-specific user registration form using EMMA design system
 * with role-based fields, institutional validation, and HIPAA compliance.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  FormControlLabel,
  Checkbox,
  Alert,
  InputAdornment,
  IconButton,
  MenuItem,
  Grid,
  Link,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  LocalHospital,
  School,
  Badge,
  Phone,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import EMMACard from '../EMMACard';
import EMMAInput from '../EMMAInput';
import EMMAButton from '../EMMAButton';
import { UserRole, Department, PGYLevel } from '@/types/user';

// ===== TYPES =====

export interface RegistrationFormData {
  // Step 1: Basic Information
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  middleName?: string
  preferredName?: string
  title?: string
  phoneNumber?: string
  
  // Step 2: Professional Information
  role: UserRole
  department?: Department
  pgyLevel?: PGYLevel
  institutionId: string
  medicalLicenseNumber?: string
  supervisingFacultyId?: string
  
  // Step 3: Terms and Verification
  acceptedTerms: boolean
  acceptedHIPAA: boolean
}

export interface EMMARegistrationFormProps {
  onSubmit: (formData: RegistrationFormData) => Promise<void>
  loading?: boolean
  error?: string | null
  onSwitchToLogin: () => void
}

interface ValidationErrors {
  [key: string]: string
}

// ===== CONSTANTS =====

const STEPS = ['Basic Information', 'Professional Details', 'Terms & Verification']

const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: 'EMERGENCY_MEDICINE', label: 'Emergency Medicine' },
  { value: 'INTERNAL_MEDICINE', label: 'Internal Medicine' },
  { value: 'SURGERY', label: 'Surgery' },
  { value: 'PEDIATRICS', label: 'Pediatrics' },
  { value: 'FAMILY_MEDICINE', label: 'Family Medicine' },
  { value: 'PSYCHIATRY', label: 'Psychiatry' },
  { value: 'RADIOLOGY', label: 'Radiology' },
  { value: 'ANESTHESIOLOGY', label: 'Anesthesiology' },
  { value: 'PATHOLOGY', label: 'Pathology' },
  { value: 'NEUROLOGY', label: 'Neurology' },
  { value: 'CARDIOLOGY', label: 'Cardiology' },
  { value: 'OTHER', label: 'Other' },
]

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { 
    value: 'RESIDENT', 
    label: 'Resident Physician', 
    description: 'Medical resident in training program' 
  },
  { 
    value: 'FACULTY', 
    label: 'Faculty Member', 
    description: 'Attending physician or teaching staff' 
  },
  { 
    value: 'COORDINATOR', 
    label: 'Program Coordinator', 
    description: 'Administrative coordinator for residency program' 
  },
  { 
    value: 'ADMIN', 
    label: 'System Administrator', 
    description: 'System administrator with full access' 
  },
]

const TITLES = [
  'Dr.', 'MD', 'DO', 'PharmD', 'PhD', 'RN', 'PA', 'NP', 'Ms.', 'Mr.', 'Mrs.'
]

// ===== STYLED COMPONENTS =====

const RegistrationContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)`,
  padding: theme.spacing(2),
}));

const RegistrationCard = styled(EMMACard)(({ theme }) => ({
  maxWidth: 600,
  width: '100%',
  padding: theme.spacing(3),
}));

const StepContent = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const RoleCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ theme, selected }) => ({
  padding: theme.spacing(2),
  cursor: 'pointer',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
  backgroundColor: selected ? theme.palette.primary.light + '10' : 'transparent',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '08',
  },
}));

// ===== MAIN COMPONENT =====

const EMMARegistrationForm: React.FC<EMMARegistrationFormProps> = ({
  onSubmit,
  loading = false,
  error = null,
  onSwitchToLogin,
}) => {
  const [activeStep, setActiveStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    middleName: '',
    preferredName: '',
    title: '',
    phoneNumber: '',
    role: 'RESIDENT',
    department: undefined,
    pgyLevel: undefined,
    institutionId: 'allegheny-general', // Default institution
    medicalLicenseNumber: '',
    supervisingFacultyId: '',
    acceptedTerms: false,
    acceptedHIPAA: false,
  })

  // Handle input changes
  const handleInputChange = (field: keyof RegistrationFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: '',
      }))
    }
  }

  // Handle role selection
  const handleRoleSelect = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role,
      // Clear role-specific fields when role changes
      department: undefined,
      pgyLevel: undefined,
      medicalLicenseNumber: '',
      supervisingFacultyId: '',
    }))
  }

  // Validate current step
  const validateStep = (step: number): boolean => {
    const errors: ValidationErrors = {}

    if (step === 0) {
      // Basic Information validation
      if (!formData.email) {
        errors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address'
      } else if (!formData.email.includes('.edu') && !formData.email.includes('.org') && !formData.email.includes('.gov')) {
        errors.email = 'Please use your institutional email address'
      }

      if (!formData.password) {
        errors.password = 'Password is required'
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        errors.password = 'Password must contain uppercase, lowercase, and number'
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }

      if (!formData.firstName) {
        errors.firstName = 'First name is required'
      }

      if (!formData.lastName) {
        errors.lastName = 'Last name is required'
      }

      if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber)) {
        errors.phoneNumber = 'Please enter a valid phone number'
      }
    }

    if (step === 1) {
      // Professional Information validation
      if (formData.role === 'RESIDENT') {
        if (!formData.department) {
          errors.department = 'Department is required for residents'
        }
        if (!formData.pgyLevel) {
          errors.pgyLevel = 'PGY level is required for residents'
        }
      }

      if ((formData.role === 'FACULTY' || formData.role === 'RESIDENT') && !formData.department) {
        errors.department = 'Department is required'
      }

      if (formData.role === 'FACULTY' && formData.medicalLicenseNumber && formData.medicalLicenseNumber.length < 5) {
        errors.medicalLicenseNumber = 'Medical license number must be at least 5 characters'
      }
    }

    if (step === 2) {
      // Terms validation
      if (!formData.acceptedTerms) {
        errors.acceptedTerms = 'You must accept the terms of service'
      }
      if (!formData.acceptedHIPAA) {
        errors.acceptedHIPAA = 'You must accept the HIPAA agreement'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle next step
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1)
    }
  }

  // Handle previous step
  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!validateStep(activeStep)) {
      return
    }

    await onSubmit(formData)
  }

  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <StepContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <EMMAInput
                  fullWidth
                  label="First Name"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  error={!!validationErrors.firstName}
                  helperText={validationErrors.firstName}
                  startAdornment={<Person />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <EMMAInput
                  fullWidth
                  label="Last Name"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  error={!!validationErrors.lastName}
                  helperText={validationErrors.lastName}
                  startAdornment={<Person />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <EMMAInput
                  fullWidth
                  label="Middle Name"
                  value={formData.middleName}
                  onChange={handleInputChange('middleName')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <EMMAInput
                  fullWidth
                  label="Preferred Name"
                  value={formData.preferredName}
                  onChange={handleInputChange('preferredName')}
                  helperText="How you'd like to be addressed"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <EMMAInput
                  select
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                >
                  {TITLES.map((title) => (
                    <MenuItem key={title} value={title}>
                      {title}
                    </MenuItem>
                  ))}
                </EMMAInput>
              </Grid>
              <Grid item xs={12} sm={6}>
                <EMMAInput
                  fullWidth
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange('phoneNumber')}
                  error={!!validationErrors.phoneNumber}
                  helperText={validationErrors.phoneNumber}
                  startAdornment={<Phone />}
                />
              </Grid>
              <Grid item xs={12}>
                <EMMAInput
                  fullWidth
                  label="Email Address"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email || 'Use your institutional email address'}
                  startAdornment={<Email />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <EMMAInput
                  fullWidth
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  error={!!validationErrors.confirmPassword}
                  helperText={validationErrors.confirmPassword}
                  startAdornment={<Lock />}
                  endAdornment={
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  }
                />
              </Grid>
            </Grid>
          </StepContent>
        )

      case 1:
        return (
          <StepContent>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Select Your Role
              </Typography>
              <Grid container spacing={2}>
                {ROLES.map((role) => (
                  <Grid item xs={12} sm={6} key={role.value}>
                    <RoleCard
                      selected={formData.role === role.value}
                      onClick={() => handleRoleSelect(role.value)}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {role.label}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {role.description}
                      </Typography>
                    </RoleCard>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Grid container spacing={3}>
              {(formData.role === 'RESIDENT' || formData.role === 'FACULTY') && (
                <Grid item xs={12} sm={6}>
                  <EMMAInput
                    select
                    fullWidth
                    label="Department"
                    required
                    value={formData.department || ''}
                    onChange={handleInputChange('department')}
                    error={!!validationErrors.department}
                    helperText={validationErrors.department}
                    startAdornment={<LocalHospital />}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <MenuItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </MenuItem>
                    ))}
                  </EMMAInput>
                </Grid>
              )}

              {formData.role === 'RESIDENT' && (
                <Grid item xs={12} sm={6}>
                  <EMMAInput
                    select
                    fullWidth
                    label="PGY Level"
                    required
                    value={formData.pgyLevel || ''}
                    onChange={handleInputChange('pgyLevel')}
                    error={!!validationErrors.pgyLevel}
                    helperText={validationErrors.pgyLevel}
                    startAdornment={<School />}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                      <MenuItem key={level} value={level}>
                        PGY-{level}
                      </MenuItem>
                    ))}
                  </EMMAInput>
                </Grid>
              )}

              {formData.role === 'FACULTY' && (
                <Grid item xs={12}>
                  <EMMAInput
                    fullWidth
                    label="Medical License Number"
                    value={formData.medicalLicenseNumber}
                    onChange={handleInputChange('medicalLicenseNumber')}
                    error={!!validationErrors.medicalLicenseNumber}
                    helperText={validationErrors.medicalLicenseNumber}
                    startAdornment={<Badge />}
                  />
                </Grid>
              )}
            </Grid>
          </StepContent>
        )

      case 2:
        return (
          <StepContent>
            <Typography variant="h6" gutterBottom>
              Terms and Agreements
            </Typography>
            
            <Box mb={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.acceptedTerms}
                    onChange={handleInputChange('acceptedTerms')}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link href="#" color="primary">
                      Terms of Service
                    </Link>{' '}
                    and understand my responsibilities as a healthcare professional using this system.
                  </Typography>
                }
              />
              {validationErrors.acceptedTerms && (
                <Typography color="error" variant="caption">
                  {validationErrors.acceptedTerms}
                </Typography>
              )}
            </Box>

            <Box mb={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.acceptedHIPAA}
                    onChange={handleInputChange('acceptedHIPAA')}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I acknowledge that I have read and understand the{' '}
                    <Link href="#" color="primary">
                      HIPAA Privacy Notice
                    </Link>{' '}
                    and agree to comply with all healthcare data privacy regulations.
                  </Typography>
                }
              />
              {validationErrors.acceptedHIPAA && (
                <Typography color="error" variant="caption">
                  {validationErrors.acceptedHIPAA}
                </Typography>
              )}
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              By creating an account, you agree to comply with healthcare data privacy 
              regulations and institutional security policies. Your account will be 
              activated after email verification.
            </Alert>
          </StepContent>
        )

      default:
        return null
    }
  }

  return (
    <RegistrationContainer>
      <RegistrationCard emmaVariant="patient-info" elevation={3}>
        {/* Header */}
        <Box textAlign="center" mb={3}>
          <LocalHospital sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join EMMA Healthcare Administration
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}

          {/* Navigation Buttons */}
          <Box display="flex" justifyContent="space-between" mt={3}>
            <EMMAButton
              emmaVariant="medical-secondary"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </EMMAButton>

            {activeStep === STEPS.length - 1 ? (
              <EMMAButton
                type="submit"
                emmaVariant="medical-primary"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </EMMAButton>
            ) : (
              <EMMAButton
                emmaVariant="medical-primary"
                onClick={handleNext}
              >
                Next
              </EMMAButton>
            )}
          </Box>
        </Box>

        {/* Switch to Login */}
        <Box textAlign="center" mt={3} pt={3} borderTop="1px solid #e0e0e0">
          <Typography variant="body2">
            Already have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={onSwitchToLogin}
              sx={{ fontWeight: 500 }}
            >
              Sign in here
            </Link>
          </Typography>
        </Box>
      </RegistrationCard>
    </RegistrationContainer>
  )
}

export default EMMARegistrationForm