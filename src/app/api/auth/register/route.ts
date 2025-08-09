/**
 * EMMA Healthcare User Registration API
 * 
 * Firebase-based user registration with healthcare-specific validation,
 * HIPAA-compliant audit logging, and role-based access control.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { adminAuth, logAdminAction } from '@/lib/firebase-admin'
import { UserService } from '@/lib/database'
import { UserRole, Department, PGYLevel, ROLE_PERMISSIONS } from '@/types/user'
import { ExtendedUser } from '@/types/database'
import { Timestamp } from 'firebase/firestore'

interface RegistrationRequest {
  // Core user information
  email: string
  password: string
  firstName: string
  lastName: string
  
  // Healthcare-specific fields
  role: UserRole
  department?: Department
  pgyLevel?: PGYLevel
  institutionId: string
  medicalLicenseNumber?: string
  supervisingFacultyId?: string
  phoneNumber?: string
  
  // Professional information
  profile?: {
    title?: string
    middleName?: string
    preferredName?: string
  }
  
  // Terms acceptance
  acceptedTerms: boolean
  acceptedHIPAA: boolean
}

interface RegistrationResponse {
  success: boolean
  message: string
  userId?: string
  emailVerificationSent?: boolean
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<RegistrationResponse>> {
  let requestData: RegistrationRequest | undefined
  
  try {
    requestData = await request.json()
    
    if (!requestData) {
      return NextResponse.json({
        success: false,
        message: 'Invalid request data',
        error: 'Request body is required'
      }, { status: 400 })
    }
    
    // Validate required fields
    const validationError = validateRegistrationData(requestData)
    if (validationError) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        error: validationError
      }, { status: 400 })
    }

    // Validate Firebase configuration
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.error('[EMMA] Firebase configuration incomplete for registration')
      return NextResponse.json({
        success: false,
        message: 'Server configuration error',
        error: 'Authentication service unavailable'
      }, { status: 500 })
    }

    // Extract client IP for audit logging
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      requestData.email,
      requestData.password
    )

    const firebaseUser = userCredential.user
    const userId = firebaseUser.uid

    try {
      // Create extended user profile in Firestore
      const userData: Omit<ExtendedUser, 'id' | 'createdAt' | 'updatedAt'> = {
        email: requestData.email,
        role: requestData.role,
        firstName: requestData.firstName,
        lastName: requestData.lastName,
        department: requestData.department,
        pgyLevel: requestData.pgyLevel,
        status: process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === 'true' ? 'PENDING_VERIFICATION' : 'ACTIVE',
        institutionId: requestData.institutionId,
        medicalLicenseNumber: requestData.medicalLicenseNumber,
        supervisingFacultyId: requestData.supervisingFacultyId,
        isActive: process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION !== 'true', // Active immediately if verification disabled
        emailVerified: process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION !== 'true', // Mark as verified if verification disabled
        phoneNumber: requestData.phoneNumber,
        createdBy: 'SELF_REGISTRATION',
        lastModifiedBy: 'SELF_REGISTRATION',
        permissions: ROLE_PERMISSIONS[requestData.role],
        
        // Extended profile information
        profile: {
          title: requestData.profile?.title,
          middleName: requestData.profile?.middleName,
          preferredName: requestData.profile?.preferredName || requestData.firstName,
          bio: '',
          profileImageUrl: undefined,
          emergencyContact: undefined
        },
        
        // Professional credentials (empty initially)
        credentials: {
          deaNumber: undefined,
          npiNumber: undefined,
          stateId: undefined,
          boardCertifications: []
        },
        
        // Education info (if resident)
        education: requestData.role === 'RESIDENT' ? {
          medicalSchool: '',
          graduationYear: new Date().getFullYear(),
          undergraduateInstitution: undefined,
          otherDegrees: []
        } : undefined,
        
        // Employment info
        employment: [{
          startDate: Timestamp.now(),
          position: getRolePosition(requestData.role),
          department: requestData.department || 'OTHER',
          supervisor: requestData.supervisingFacultyId,
          employmentType: 'FULL_TIME'
        }]
      }

      // Create user profile in Firestore using Firebase Auth UID
      const createdUser = await UserService.createUser(userData, 'SYSTEM', userId)

      // Send email verification only if required
      const requireEmailVerification = process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === 'true'
      if (requireEmailVerification) {
        await sendEmailVerification(firebaseUser)
      }

      // Set custom claims for role-based access
      await adminAuth.setCustomUserClaims(userId, {
        role: requestData.role,
        department: requestData.department,
        institutionId: requestData.institutionId,
        emailVerified: !requireEmailVerification,
        isActive: !requireEmailVerification
      })

      // HIPAA-compliant audit logging
      await logAdminAction(
        'USER_REGISTRATION_SUCCESS',
        userId,
        'USER',
        userId,
        {
          email: requestData.email,
          role: requestData.role,
          department: requestData.department,
          institutionId: requestData.institutionId,
          ipAddress: clientIP,
          userAgent: request.headers.get('user-agent') || 'unknown',
          acceptedTerms: requestData.acceptedTerms,
          acceptedHIPAA: requestData.acceptedHIPAA,
          registrationMethod: 'WEB_FORM'
        }
      )

      return NextResponse.json({
        success: true,
        message: requireEmailVerification 
          ? 'Registration successful. Please check your email to verify your account.'
          : 'Registration successful. You can now sign in to your account.',
        userId: userId,
        emailVerificationSent: requireEmailVerification
      }, { status: 201 })

    } catch (firestoreError) {
      // If Firestore creation fails, clean up Firebase Auth user
      console.error('[EMMA] User profile creation failed:', firestoreError)
      
      // Attempt cleanup of Firebase Auth user
      try {
        console.log(`[EMMA] Attempting cleanup of Firebase Auth user: ${userId}`)
        await adminAuth.deleteUser(userId)
        console.log(`[EMMA] Successfully cleaned up Firebase Auth user: ${userId}`)
      } catch (cleanupError) {
        console.error('[EMMA] Failed to cleanup Firebase Auth user:', cleanupError)
      }

      // Audit log the failure (with error handling to prevent cascading failures)
      try {
        await logAdminAction(
          'USER_REGISTRATION_FAILED',
          undefined,
          'USER',
          undefined,
          {
            email: requestData.email,
            error: firestoreError instanceof Error ? firestoreError.message : 'User profile creation error',
            stage: 'FIRESTORE_CREATION',
            ipAddress: clientIP,
            userId: userId
          }
        )
      } catch (auditError) {
        console.error('[EMMA] Failed to log user creation failure - continuing with error response:', auditError)
      }

      // Return specific error based on the underlying issue
      if (firestoreError instanceof Error) {
        if (firestoreError.message.includes('PERMISSION_DENIED')) {
          return NextResponse.json({
            success: false,
            message: 'Database permission error during registration',
            error: 'Please contact system administrator'
          }, { status: 500 })
        } else if (firestoreError.message.includes('UNAUTHENTICATED')) {
          return NextResponse.json({
            success: false,
            message: 'Authentication service error during registration',
            error: 'Please contact system administrator'
          }, { status: 500 })
        }
      }

      return NextResponse.json({
        success: false,
        message: 'Failed to create user profile',
        error: firestoreError instanceof Error ? firestoreError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('[EMMA] Registration error:', error)

    // Determine error message based on error type
    let errorMessage = 'Registration failed. Please try again.'
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('email-already-in-use')) {
        errorMessage = 'An account with this email already exists.'
        statusCode = 409
      } else if (error.message.includes('weak-password')) {
        errorMessage = 'Password is too weak. Please choose a stronger password.'
        statusCode = 400
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'Please enter a valid email address.'
        statusCode = 400
      }
    }

    // Audit log the failure (with error handling to prevent audit cascade failures)
    try {
      await logAdminAction(
        'USER_REGISTRATION_FAILED',
        undefined,
        'USER',
        undefined,
        {
          email: requestData?.email || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error',
          stage: 'FIREBASE_AUTH_CREATION',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          errorType: error instanceof Error ? error.constructor.name : 'UnknownError'
        }
      )
    } catch (auditError) {
      console.error('[EMMA] Failed to log registration failure - continuing with error response:', auditError)
      // Don't throw the audit error - continue with the original error response
    }

    return NextResponse.json({
      success: false,
      message: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: statusCode })
  }
}

/**
 * Validate registration data for healthcare compliance
 */
function validateRegistrationData(data: RegistrationRequest): string | null {
  // Required fields validation
  if (!data.email || !data.password || !data.firstName || !data.lastName) {
    return 'Missing required fields: email, password, firstName, lastName'
  }

  if (!data.role || !data.institutionId) {
    return 'Missing required fields: role, institutionId'
  }

  if (!data.acceptedTerms || !data.acceptedHIPAA) {
    return 'You must accept the terms of service and HIPAA agreement'
  }

  // Email validation - require institutional domains
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return 'Please enter a valid email address'
  }

  // Healthcare institution email validation
  const institutionalDomains = ['.edu', '.org', '.gov', '.mil']
  const hasInstitutionalDomain = institutionalDomains.some(domain => 
    data.email.toLowerCase().includes(domain)
  )
  
  if (!hasInstitutionalDomain) {
    return 'Please use your institutional email address (.edu, .org, .gov, or .mil)'
  }

  // Password strength validation
  if (data.password.length < 8) {
    return 'Password must be at least 8 characters long'
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  }

  // Role-specific validation
  if (data.role === 'RESIDENT') {
    if (!data.pgyLevel || data.pgyLevel < 1 || data.pgyLevel > 7) {
      return 'Valid PGY level (1-7) is required for residents'
    }
    
    if (!data.department) {
      return 'Department is required for residents'
    }
  }

  if ((data.role === 'RESIDENT' || data.role === 'FACULTY') && !data.department) {
    return 'Department is required for residents and faculty'
  }

  // Medical license validation for faculty
  if (data.role === 'FACULTY' && data.medicalLicenseNumber) {
    if (data.medicalLicenseNumber.length < 5) {
      return 'Medical license number must be at least 5 characters'
    }
  }

  // Phone number validation
  if (data.phoneNumber) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    if (!phoneRegex.test(data.phoneNumber)) {
      return 'Please enter a valid phone number'
    }
  }

  return null // No validation errors
}

/**
 * Get position title based on role
 */
function getRolePosition(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return 'System Administrator'
    case 'COORDINATOR':
      return 'Program Coordinator'
    case 'FACULTY':
      return 'Faculty Member'
    case 'RESIDENT':
      return 'Resident Physician'
    default:
      return 'Staff Member'
  }
}

// Only allow POST requests
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}