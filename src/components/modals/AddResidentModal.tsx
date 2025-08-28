/**
 * EMMA Healthcare Add Resident Modal
 * 
 * Modal wrapper component for creating new resident physicians with
 * EMMA design system styling and proper form state management.
 */

'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Alert,
  Fade,
} from '@mui/material'
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import { useSession } from 'next-auth/react'
import AddResidentForm from '@/components/forms/AddResidentForm'
// import { Department, PGYLevel } from '@/types/user'

// Temporary type definitions  
type Department =
  | 'EMERGENCY_MEDICINE'
  | 'INTERNAL_MEDICINE'
  | 'SURGERY'
  | 'PEDIATRICS'
  | 'FAMILY_MEDICINE'
  | 'PSYCHIATRY'
  | 'RADIOLOGY'
  | 'ANESTHESIOLOGY'
  | 'PATHOLOGY'
  | 'NEUROLOGY'
  | 'CARDIOLOGY'
  | 'OTHER'

type PGYLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7
import { EMMAButton } from '@/components/emma'

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    maxWidth: 800,
    width: '100%',
    maxHeight: '90vh',
    margin: theme.spacing(2),
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
  },
}))

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: '#ffffff',
  padding: theme.spacing(3),
  position: 'relative',
  '& .MuiIconButton-root': {
    position: 'absolute',
    right: theme.spacing(2),
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
}))

interface AddResidentModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: (resident: any) => void
}

interface ResidentFormData {
  firstName: string
  lastName: string
  middleName?: string
  preferredName?: string
  title?: string
  email: string
  phoneNumber?: string
  department: Department
  pgyLevel: PGYLevel
  medicalLicenseNumber?: string
  supervisingFacultyId?: string
  medicalSchool?: string
  graduationYear?: number
  undergraduateInstitution?: string
}

const AddResidentModal: React.FC<AddResidentModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (formData: ResidentFormData) => {
    if (!session?.user?.institutionId) {
      setError('Institution information is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/residents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          profile: {
            title: formData.title,
            middleName: formData.middleName,
            preferredName: formData.preferredName,
          },
          education: formData.medicalSchool || formData.graduationYear || formData.undergraduateInstitution ? {
            medicalSchool: formData.medicalSchool || '',
            graduationYear: formData.graduationYear || new Date().getFullYear(),
            undergraduateInstitution: formData.undergraduateInstitution,
          } : undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to create resident')
      }

      // Show success state
      setSuccess(true)
      
      // Call success callback with created resident data
      if (onSuccess && result.resident) {
        onSuccess(result.resident)
      }

      // Auto-close after success message is shown
      setTimeout(() => {
        handleClose()
      }, 2000)

    } catch (error) {
      console.error('[AddResidentModal] Creation failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to create resident physician')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return // Prevent closing during submission
    
    setError(null)
    setSuccess(false)
    setLoading(false)
    onClose()
  }

  const handleCancel = () => {
    if (loading) return // Prevent canceling during submission
    handleClose()
  }

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <StyledDialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <HospitalIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h5" component="div" fontWeight="bold">
              Add New Resident Physician
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Create a new resident physician profile in the EMMA system
            </Typography>
          </Box>
        </Box>
        
        <IconButton onClick={handleClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <DialogContent sx={{ p: 4 }}>
        {success ? (
          <Fade in={success}>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py={6}
              textAlign="center"
            >
              <SuccessIcon 
                sx={{ 
                  fontSize: 64, 
                  color: 'success.main', 
                  mb: 2 
                }} 
              />
              <Typography variant="h6" color="success.main" gutterBottom>
                Resident Physician Created Successfully!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The new resident physician has been added to the system.
                They will receive login credentials separately.
              </Typography>
            </Box>
          </Fade>
        ) : (
          <AddResidentForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>

      {/* Footer information when not in success state */}
      {!success && (
        <DialogActions sx={{ px: 4, pb: 3, pt: 0 }}>
          <Alert 
            severity="info" 
            sx={{ 
              width: '100%',
              '& .MuiAlert-message': {
                fontSize: '0.875rem'
              }
            }}
          >
            <Typography variant="body2">
              <strong>Note:</strong> The resident physician will be created in the system but will need to complete 
              their Firebase Authentication setup separately to access the platform.
            </Typography>
          </Alert>
        </DialogActions>
      )}
    </StyledDialog>
  )
}

export default AddResidentModal