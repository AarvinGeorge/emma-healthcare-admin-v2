'use client'

/**
 * EMMA Healthcare Admin Panel - Main Entry Page
 * 
 * Healthcare authentication page with login and registration functionality
 * using EMMA design system components with HIPAA-compliant authentication.
 */

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { EMMALoginForm, EMMARegistrationForm } from '@/components/emma'
import type { RegistrationFormData } from '@/components/emma/EMMARegistrationForm'

type AuthMode = 'login' | 'register'

export default function Home() {
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleLogin = async (formData: { email: string; password: string; rememberMe: boolean }) => {
    setLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials. Please check your email and password.')
      } else if (result?.ok) {
        // Successful login - redirect will be handled by NextAuth
        window.location.href = '/dashboard'
      }
    } catch (error) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegistration = async (formData: RegistrationFormData) => {
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccessMessage(result.message)
        // Switch to login mode after successful registration
        setTimeout(() => {
          setAuthMode('login')
          setSuccessMessage(null)
        }, 3000)
      } else {
        setError(result.error || result.message || 'Registration failed. Please try again.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Registration failed. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchToLogin = () => {
    setAuthMode('login')
    setError(null)
    setSuccessMessage(null)
  }

  const switchToRegister = () => {
    setAuthMode('register')
    setError(null)
    setSuccessMessage(null)
  }

  if (authMode === 'register') {
    return (
      <EMMARegistrationForm
        onSubmit={handleRegistration}
        loading={loading}
        error={error}
        onSwitchToLogin={switchToLogin}
      />
    )
  }

  return (
    <EMMALoginForm
      onSubmit={handleLogin}
      loading={loading}
      error={error}
      successMessage={successMessage}
      title="EMMA Healthcare"
      subtitle="Medical Education Administration"
      onSwitchToRegister={switchToRegister}
    />
  )
}
