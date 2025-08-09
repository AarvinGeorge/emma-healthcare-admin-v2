/**
 * Firebase Email Action Handler
 * Handles email verification, password reset, and other email actions
 */

'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth'
import { Box, Typography, Alert, CircularProgress, Button } from '@mui/material'
import EMMACard from '@/components/emma/EMMACard'

type ActionMode = 'verifyEmail' | 'resetPassword' | 'recoverEmail'

export default function AuthActionPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [actionMode, setActionMode] = useState<ActionMode | null>(null)

  useEffect(() => {
    const handleAuthAction = async () => {
      const mode = searchParams.get('mode') as ActionMode
      const actionCode = searchParams.get('oobCode')
      
      if (!mode || !actionCode) {
        setError('Invalid or missing action parameters.')
        setLoading(false)
        return
      }

      setActionMode(mode)

      try {
        switch (mode) {
          case 'verifyEmail':
            await applyActionCode(auth, actionCode)
            setMessage('✅ Email verified successfully! You can now sign in to your EMMA account.')
            break

          case 'resetPassword':
            // Verify the password reset code
            await verifyPasswordResetCode(auth, actionCode)
            setMessage('✅ Password reset code verified. Please set your new password.')
            // You would typically show a password reset form here
            break

          case 'recoverEmail':
            await applyActionCode(auth, actionCode)
            setMessage('✅ Email recovery completed successfully.')
            break

          default:
            setError('Unknown action mode.')
        }
      } catch (error) {
        console.error('Auth action error:', error)
        
        if (error instanceof Error) {
          switch (error.message) {
            case 'Firebase: The action code is invalid. This can happen if the code is malformed, expired, or has already been used. (auth/invalid-action-code).':
              setError('This verification link has expired or has already been used. Please request a new verification email.')
              break
            case 'Firebase: The action code is expired. (auth/expired-action-code).':
              setError('This verification link has expired. Please request a new verification email.')
              break
            default:
              setError(`Action failed: ${error.message}`)
          }
        } else {
          setError('An unknown error occurred. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    handleAuthAction()
  }, [searchParams])

  const getTitle = () => {
    switch (actionMode) {
      case 'verifyEmail':
        return 'Email Verification'
      case 'resetPassword':
        return 'Password Reset'
      case 'recoverEmail':
        return 'Email Recovery'
      default:
        return 'Account Action'
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        padding: 2,
      }}
    >
      <EMMACard 
        emmaVariant="patient-info"
        elevation={3}
        sx={{ maxWidth: 500, width: '100%', padding: 4 }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          textAlign="center"
          color="primary"
        >
          🏥 EMMA Healthcare
        </Typography>
        
        <Typography 
          variant="h6" 
          component="h2" 
          gutterBottom 
          textAlign="center"
        >
          {getTitle()}
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
            <Typography variant="body2" ml={2} alignSelf="center">
              Processing your request...
            </Typography>
          </Box>
        ) : (
          <>
            {message && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box textAlign="center" mt={3}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => window.location.href = '/auth/signin'}
              >
                Continue to Sign In
              </Button>
            </Box>
          </>
        )}

        <Box mt={4} pt={2} borderTop="1px solid #e0e0e0">
          <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
            EMMA Healthcare - Medical Education Administration Platform
          </Typography>
        </Box>
      </EMMACard>
    </Box>
  )
}