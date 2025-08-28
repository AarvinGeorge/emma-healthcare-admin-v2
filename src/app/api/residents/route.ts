/**
 * EMMA Healthcare Residents API
 * 
 * API endpoints for managing resident physicians with healthcare-specific validation,
 * HIPAA-compliant audit logging, and integration with existing user management system.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { adminDb, logAdminAction } from '@/lib/firebase-admin'
import { UserRole, Department, PGYLevel, ROLE_PERMISSIONS } from '@/types/user'
import { ExtendedUser, COLLECTIONS } from '@/types/database'
import { Timestamp } from 'firebase-admin/firestore'

// Import NextAuth configuration
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

interface CreateResidentRequest {
  // Core user information
  email: string
  firstName: string
  lastName: string
  
  // Resident-specific fields
  pgyLevel: PGYLevel
  department: Department
  medicalLicenseNumber?: string
  supervisingFacultyId?: string
  phoneNumber?: string
  
  // Professional information
  profile?: {
    title?: string
    middleName?: string
    preferredName?: string
  }
  
  // Education information
  education?: {
    medicalSchool: string
    graduationYear: number
    undergraduateInstitution?: string
  }
}

interface CreateResidentResponse {
  success: boolean
  message: string
  resident?: ExtendedUser
  error?: string
}

interface GetResidentsResponse {
  success: boolean
  residents?: ExtendedUser[]
  total?: number
  error?: string
}

/**
 * GET /api/residents - Fetch resident physicians
 */
export async function GET(request: NextRequest): Promise<NextResponse<GetResidentsResponse>> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Check permissions for viewing resident data
    if (!session.user.permissions?.canViewAllResidents) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions to view resident data'
      }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId') || session.user.institutionId
    const department = searchParams.get('department') as Department
    const pgyLevel = searchParams.get('pgyLevel') ? parseInt(searchParams.get('pgyLevel')!) as PGYLevel : undefined
    const search = searchParams.get('search')

    if (!institutionId) {
      return NextResponse.json({
        success: false,
        error: 'Institution ID is required'
      }, { status: 400 })
    }

    // Build query for resident physicians
    let query = adminDb.collection(COLLECTIONS.USERS)
      .where('institutionId', '==', institutionId)
      .where('role', '==', 'RESIDENT')
      .where('isActive', '==', true)

    // Add additional filters
    if (department) {
      query = query.where('department', '==', department)
    }

    if (pgyLevel) {
      query = query.where('pgyLevel', '==', pgyLevel)
    }

    // Execute query
    const querySnapshot = await query.get()
    let residents: ExtendedUser[] = []

    querySnapshot.forEach((doc) => {
      const userData = doc.data() as ExtendedUser
      
      // Filter for resident physicians based on employment position
      const hasResidentPhysicianPosition = userData.employment?.some(
        emp => emp.position === 'Resident Physician'
      )
      
      if (hasResidentPhysicianPosition) {
        residents.push({
          id: doc.id,
          ...userData
        })
      }
    })

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase()
      residents = residents.filter(resident =>
        resident.firstName.toLowerCase().includes(searchLower) ||
        resident.lastName.toLowerCase().includes(searchLower) ||
        resident.email.toLowerCase().includes(searchLower) ||
        resident.department?.toLowerCase().includes(searchLower) ||
        resident.medicalLicenseNumber?.toLowerCase().includes(searchLower)
      )
    }

    // Sort by last name, first name
    residents.sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName)
      if (lastNameCompare !== 0) return lastNameCompare
      return a.firstName.localeCompare(b.firstName)
    })

    // HIPAA audit logging
    await logAdminAction(
      'RESIDENTS_FETCHED',
      session.user.id,
      'RESIDENT_COLLECTION',
      institutionId,
      {
        residentCount: residents.length,
        filters: {
          department,
          pgyLevel,
          search: search ? '[FILTERED]' : undefined
        },
        institutionId
      }
    )

    return NextResponse.json({
      success: true,
      residents,
      total: residents.length
    })

  } catch (error) {
    console.error('[EMMA] Residents fetch failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch residents'
    }, { status: 500 })
  }
}

/**
 * POST /api/residents - Create new resident physician
 */
export async function POST(request: NextRequest): Promise<NextResponse<CreateResidentResponse>> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    // Check permissions
    if (!session.user.permissions?.canCreateUsers) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient permissions to create residents'
      }, { status: 403 })
    }

    const requestData: CreateResidentRequest = await request.json()

    // Validate required fields
    const validationError = validateResidentData(requestData)
    if (validationError) {
      return NextResponse.json({
        success: false,
        error: validationError
      }, { status: 400 })
    }

    // Check if user with email already exists
    const existingUserQuery = await adminDb.collection(COLLECTIONS.USERS)
      .where('email', '==', requestData.email)
      .get()

    if (!existingUserQuery.empty) {
      return NextResponse.json({
        success: false,
        error: 'A user with this email address already exists'
      }, { status: 409 })
    }

    // Generate user ID
    const userId = requestData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    const institutionId = session.user.institutionId!

    // Create resident physician user data
    const residentData: ExtendedUser = {
      id: userId,
      email: requestData.email,
      role: 'RESIDENT',
      firstName: requestData.firstName,
      lastName: requestData.lastName,
      department: requestData.department,
      pgyLevel: requestData.pgyLevel,
      status: 'PENDING_VERIFICATION',
      institutionId,
      medicalLicenseNumber: requestData.medicalLicenseNumber,
      supervisingFacultyId: requestData.supervisingFacultyId,
      isActive: false, // Will be activated after Firebase Auth user is created
      emailVerified: false,
      phoneNumber: requestData.phoneNumber,
      createdBy: session.user.id,
      lastModifiedBy: session.user.id,
      permissions: ROLE_PERMISSIONS.RESIDENT,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      
      // Extended profile
      profile: {
        title: requestData.profile?.title || 'Dr.',
        middleName: requestData.profile?.middleName,
        preferredName: requestData.profile?.preferredName || requestData.firstName,
        bio: '',
      },
      
      // Professional credentials (empty initially)
      credentials: {
        boardCertifications: []
      },
      
      // Education information
      education: requestData.education || {
        medicalSchool: '',
        graduationYear: new Date().getFullYear()
      },
      
      // Employment as resident physician
      employment: [{
        startDate: Timestamp.now(),
        position: 'Resident Physician', // Key field for filtering
        department: requestData.department,
        supervisor: requestData.supervisingFacultyId,
        employmentType: 'FULL_TIME'
      }]
    }

    // Create user document in Firestore
    await adminDb.collection(COLLECTIONS.USERS).doc(userId).set(residentData)

    // HIPAA audit logging
    await logAdminAction(
      'RESIDENT_PHYSICIAN_CREATED',
      session.user.id,
      'USER',
      userId,
      {
        email: requestData.email,
        role: 'RESIDENT',
        department: requestData.department,
        pgyLevel: requestData.pgyLevel,
        institutionId,
        createdBy: session.user.id,
        method: 'ADMIN_PANEL'
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Resident physician created successfully. They will receive login credentials separately.',
      resident: residentData
    }, { status: 201 })

  } catch (error) {
    console.error('[EMMA] Resident creation failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create resident'
    }, { status: 500 })
  }
}

/**
 * Validate resident physician creation data
 */
function validateResidentData(data: CreateResidentRequest): string | null {
  // Required fields validation
  if (!data.email || !data.firstName || !data.lastName) {
    return 'Missing required fields: email, firstName, lastName'
  }

  if (!data.pgyLevel || !data.department) {
    return 'Missing required fields: pgyLevel, department'
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    return 'Please enter a valid email address'
  }

  // PGY level validation
  if (data.pgyLevel < 1 || data.pgyLevel > 7) {
    return 'PGY level must be between 1 and 7'
  }

  // Medical license validation
  if (data.medicalLicenseNumber && data.medicalLicenseNumber.length < 5) {
    return 'Medical license number must be at least 5 characters'
  }

  // Phone number validation
  if (data.phoneNumber) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    if (!phoneRegex.test(data.phoneNumber)) {
      return 'Please enter a valid phone number'
    }
  }

  // Education validation
  if (data.education?.graduationYear) {
    const currentYear = new Date().getFullYear()
    if (data.education.graduationYear < 1950 || data.education.graduationYear > currentYear + 10) {
      return 'Please enter a valid graduation year'
    }
  }

  return null // No validation errors
}

// Only allow GET and POST requests
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