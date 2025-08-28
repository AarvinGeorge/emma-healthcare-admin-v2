/**
 * EMMA Healthcare Add Resident Form
 * 
 * Comprehensive form for creating new resident physicians with healthcare-specific
 * validation, EMMA design system integration, and proper medical field validation.
 */

'use client'

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  FormHelperText,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
// import { Department, PGYLevel } from '@/types/user'

// Temporary type definitions
enum Department {
  EMERGENCY_MEDICINE = 'EMERGENCY_MEDICINE',
  INTERNAL_MEDICINE = 'INTERNAL_MEDICINE',
  SURGERY = 'SURGERY',
  PEDIATRICS = 'PEDIATRICS',
  FAMILY_MEDICINE = 'FAMILY_MEDICINE',
  PSYCHIATRY = 'PSYCHIATRY',
  RADIOLOGY = 'RADIOLOGY',
  ANESTHESIOLOGY = 'ANESTHESIOLOGY',
  PATHOLOGY = 'PATHOLOGY',
  NEUROLOGY = 'NEUROLOGY',
  CARDIOLOGY = 'CARDIOLOGY',
  OTHER = 'OTHER'
}

type PGYLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7
import { EMMAInput, EMMAButton } from '@/components/emma'

// Validation schema for resident physician creation
const residentSchema = z.object({
  // Personal Information
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
    
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
    
  middleName: z.string()
    .max(50, 'Middle name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']*$/, 'Middle name can only contain letters, spaces, hyphens, and apostrophes')
    .optional(),
    
  preferredName: z.string()
    .max(50, 'Preferred name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']*$/, 'Preferred name can only contain letters, spaces, hyphens, and apostrophes')
    .optional(),
    
  title: z.enum(['Dr.', 'Mr.', 'Ms.', 'Mrs.'], {
    errorMap: () => ({ message: 'Please select a valid title' })
  }).optional(),

  // Contact Information
  email: z.string()
    .email('Please enter a valid email address')
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|org|gov|mil)$/i,
      'Please use an institutional email address (.edu, .org, .gov, or .mil)'
    ),
    
  phoneNumber: z.string()
    .regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),

  // Professional Information
  department: z.nativeEnum(Department, {
    errorMap: () => ({ message: 'Please select a valid department' })
  }),
  
  pgyLevel: z.number()
    .int('PGY level must be a whole number')
    .min(1, 'PGY level must be at least 1')
    .max(7, 'PGY level must be 7 or less'),

  medicalLicenseNumber: z.string()
    .min(5, 'Medical license number must be at least 5 characters')
    .max(20, 'Medical license number must be less than 20 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Medical license number can only contain letters, numbers, and hyphens')
    .optional()
    .or(z.literal('')),

  supervisingFacultyId: z.string().optional(),

  // Education Information
  medicalSchool: z.string()
    .min(3, 'Medical school name must be at least 3 characters')
    .max(200, 'Medical school name must be less than 200 characters')
    .optional()
    .or(z.literal('')),
    
  graduationYear: z.number()
    .int('Graduation year must be a whole number')
    .min(1950, 'Graduation year must be 1950 or later')
    .max(new Date().getFullYear() + 10, `Graduation year must be ${new Date().getFullYear() + 10} or earlier`)
    .optional(),
    
  undergraduateInstitution: z.string()
    .max(200, 'Undergraduate institution name must be less than 200 characters')
    .optional()
    .or(z.literal(''))
})

type ResidentFormData = z.infer<typeof residentSchema>

interface AddResidentFormProps {
  onSubmit: (data: ResidentFormData) => Promise<void>
  loading?: boolean
  error?: string | null
  onCancel?: () => void
}

// Department options for healthcare
const departmentOptions = [
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
] as const

const AddResidentForm: React.FC<AddResidentFormProps> = ({
  onSubmit,
  loading = false,
  error,
  onCancel
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset
  } = useForm<ResidentFormData>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      title: 'Dr.',
      pgyLevel: 1,
      graduationYear: new Date().getFullYear() - 1
    }
  })

  const handleFormSubmit = async (data: ResidentFormData) => {
    try {
      await onSubmit(data)
      reset() // Clear form on successful submission
    } catch (error) {
      // Error handling is managed by parent component
      console.error('Form submission error:', error)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {/* Error Display */}
      {error && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'error.50', borderRadius: 1, border: '1px solid', borderColor: 'error.main' }}>
          <Typography variant="body2" color="error.main">
            {error}
          </Typography>
        </Box>
      )}

      {/* Personal Information Section */}
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
        Personal Information
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.title}>
                <InputLabel>Title</InputLabel>
                <Select {...field} label="Title">
                  <MenuItem value="Dr.">Dr.</MenuItem>
                  <MenuItem value="Mr.">Mr.</MenuItem>
                  <MenuItem value="Ms.">Ms.</MenuItem>
                  <MenuItem value="Mrs.">Mrs.</MenuItem>
                </Select>
                {errors.title && <FormHelperText>{errors.title.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4.5}>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <EMMAInput
                {...field}
                label="First Name"
                emmaVariant={errors.firstName ? 'medical-error' : 'default'}
                required
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4.5}>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <EMMAInput
                {...field}
                label="Last Name"
                emmaVariant={errors.lastName ? 'medical-error' : 'default'}
                required
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="middleName"
            control={control}
            render={({ field }) => (
              <EMMAInput
                {...field}
                label="Middle Name"
                emmaVariant={errors.middleName ? 'medical-error' : 'default'}
                error={!!errors.middleName}
                helperText={errors.middleName?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="preferredName"
            control={control}
            render={({ field }) => (
              <EMMAInput
                {...field}
                label="Preferred Name"
                emmaVariant={errors.preferredName ? 'medical-error' : 'default'}
                error={!!errors.preferredName}
                helperText={errors.preferredName?.message}
                fullWidth
              />
            )}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Contact Information Section */}
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
        Contact Information
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={8}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <EMMAInput
                {...field}
                label="Email Address"
                medicalType="email-medical"
                emmaVariant={errors.email ? 'medical-error' : 'medical-required'}
                required
                error={!!errors.email}
                helperText={errors.email?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <EMMAInput
                {...field}
                label="Phone Number"
                medicalType="phone-medical"
                emmaVariant={errors.phoneNumber ? 'medical-error' : 'default'}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                fullWidth
              />
            )}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Professional Information Section */}
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
        Professional Information
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.department}>
                <InputLabel>Department</InputLabel>
                <Select {...field} label="Department">
                  {departmentOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.department && <FormHelperText>{errors.department.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <Controller
            name="pgyLevel"
            control={control}
            render={({ field }) => (
              <EMMAInput
                {...field}
                label="PGY Level"
                medicalType="pgy-level"
                type="number"
                emmaVariant={errors.pgyLevel ? 'medical-error' : 'medical-required'}
                required
                error={!!errors.pgyLevel}
                helperText={errors.pgyLevel?.message}
                fullWidth
                inputProps={{ min: 1, max: 7 }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <Controller
            name="medicalLicenseNumber"
            control={control}
            render={({ field }) => (
              <EMMAInput
                {...field}
                label="Medical License"
                medicalType="medical-id"
                emmaVariant={errors.medicalLicenseNumber ? 'medical-error' : 'default'}
                error={!!errors.medicalLicenseNumber}
                helperText={errors.medicalLicenseNumber?.message}
                fullWidth
              />
            )}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Education Information Section */}
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
        Education Information
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="medicalSchool"
            control={control}
            render={({ field }) => (
              <EMMAInput
                {...field}
                label="Medical School"
                emmaVariant={errors.medicalSchool ? 'medical-error' : 'default'}
                error={!!errors.medicalSchool}
                helperText={errors.medicalSchool?.message}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={3}>
          <Controller
            name="graduationYear"
            control={control}
            render={({ field }) => (
              <EMMAInput
                {...field}
                label="Graduation Year"
                type="number"
                emmaVariant={errors.graduationYear ? 'medical-error' : 'default'}
                error={!!errors.graduationYear}
                helperText={errors.graduationYear?.message}
                fullWidth
                inputProps={{ 
                  min: 1950, 
                  max: new Date().getFullYear() + 10 
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="undergraduateInstitution"
            control={control}
            render={({ field }) => (
              <EMMAInput
                {...field}
                label="Undergraduate Institution"
                emmaVariant={errors.undergraduateInstitution ? 'medical-error' : 'default'}
                error={!!errors.undergraduateInstitution}
                helperText={errors.undergraduateInstitution?.message}
                fullWidth
              />
            )}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Form Actions */}
      <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 4 }}>
        {onCancel && (
          <EMMAButton
            emmaVariant="medical-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </EMMAButton>
        )}
        
        <Button
          type="submit"
          variant="contained"
          disabled={!isValid || loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
          sx={{
            minWidth: 160,
            background: `linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)`,
            },
            '&.Mui-disabled': {
              backgroundColor: 'grey.300',
            }
          }}
        >
          {loading ? 'Creating...' : 'Create Resident'}
        </Button>
      </Box>
    </Box>
  )
}

export default AddResidentForm