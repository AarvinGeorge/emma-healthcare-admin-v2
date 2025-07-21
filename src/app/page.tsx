'use client'

/**
 * EMMA Healthcare Admin Panel - Main Entry Page
 * 
 * Healthcare login page using EMMA design system components
 * with HIPAA-compliant authentication and medical-specific UI.
 */

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { EMMALoginForm } from '@/components/emma'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <EMMALoginForm
      onSubmit={handleLogin}
      loading={loading}
      error={error}
      title="EMMA Healthcare"
      subtitle="Medical Education Administration"
    />
  )
}
