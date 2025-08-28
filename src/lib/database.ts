/**
 * EMMA Healthcare Database Utilities
 * 
 * Firestore database operations with HIPAA compliance and healthcare-specific
 * business logic for user management, scheduling, and evaluations.
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  writeBatch,
  DocumentReference,
  Query
} from 'firebase/firestore'
import { FieldValue } from 'firebase-admin/firestore'
import { db } from './firebase'
import { adminDb, logAdminAction } from './firebase-admin'

// Helper function to recursively remove undefined values from objects
function cleanUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return null
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefinedValues(item))
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value)
      }
    }
    return cleaned
  }
  
  return obj
}
import { 
  COLLECTIONS, 
  ExtendedUser, 
  Institution, 
  ResidentProfile, 
  Rotation, 
  Schedule, 
  Evaluation,
  HIPAAAuditLog,
  SystemSettings
} from '@/types/database'
import { UserRole, Department, PGYLevel, ROLE_PERMISSIONS } from '@/types/user'

// ===== USER MANAGEMENT =====

export class UserService {
  /**
   * Create a new user profile using Firebase Admin SDK (Server-side only)
   * HIPAA-compliant with audit logging - bypasses Firestore rules
   */
  static async createUser(
    userData: Omit<ExtendedUser, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string,
    userId?: string
  ): Promise<ExtendedUser> {
    try {
      // Validate server-side execution
      if (typeof window !== 'undefined') {
        throw new Error('UserService.createUser must only be called server-side')
      }

      const docId = userId || userData.email.split('@')[0] // Use provided Firebase Auth UID or email prefix as fallback
      const timestamp = FieldValue.serverTimestamp()
      
      const newUser = {
        ...userData,
        id: docId,
        permissions: ROLE_PERMISSIONS[userData.role],
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy,
        lastModifiedBy: createdBy
      }

      // Clean up undefined values recursively for Firestore
      const cleanedUser = cleanUndefinedValues(newUser)


      // Create user document using Firebase Admin SDK (bypasses Firestore rules)
      await adminDb.collection(COLLECTIONS.USERS).doc(docId).set(cleanedUser)

      console.log(`[EMMA] User profile created successfully: ${docId}`)

      // HIPAA Audit logging
      await logAdminAction(
        'USER_CREATED',
        createdBy,
        'USER',
        docId,
        {
          email: userData.email,
          role: userData.role,
          department: userData.department,
          institutionId: userData.institutionId,
          method: 'ADMIN_SDK'
        }
      )

      // Return user data with proper timestamps
      const createdUserDoc = await adminDb.collection(COLLECTIONS.USERS).doc(userId).get()
      return { id: userId, ...createdUserDoc.data() } as ExtendedUser
      
    } catch (error) {
      console.error('[EMMA] User creation failed:', error)
      
      // Provide specific error information for debugging
      if (error instanceof Error) {
        if (error.message.includes('PERMISSION_DENIED')) {
          throw new Error(`Firestore permission denied: ${error.message}`)
        } else if (error.message.includes('UNAUTHENTICATED')) {
          throw new Error(`Firebase Admin SDK authentication failed: ${error.message}`)
        } else {
          throw new Error(`User creation failed: ${error.message}`)
        }
      }
      
      throw new Error('Failed to create user profile: Unknown error')
    }
  }

  /**
   * Create a user profile using Client SDK (Client-side operations)
   * Subject to Firestore security rules
   */
  static async createUserClient(
    userData: Omit<ExtendedUser, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<ExtendedUser> {
    try {
      const userId = userData.email.split('@')[0]
      const timestamp = Timestamp.now()
      
      const newUser: ExtendedUser = {
        ...userData,
        id: userId,
        permissions: ROLE_PERMISSIONS[userData.role],
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy,
        lastModifiedBy: createdBy
      }

      // Create user document using client SDK (subject to Firestore rules)
      await setDoc(doc(db, COLLECTIONS.USERS, userId), newUser)

      return newUser
    } catch (error) {
      console.error('[EMMA] Client user creation failed:', error)
      throw error
    }
  }

  /**
   * Get user by ID with HIPAA audit logging
   */
  static async getUserById(userId: string, requestedBy: string): Promise<ExtendedUser | null> {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId))
      
      if (!userDoc.exists()) {
        return null
      }

      const userData = userDoc.data() as ExtendedUser

      // HIPAA Audit logging for data access
      await logAdminAction(
        'USER_DATA_ACCESSED',
        requestedBy,
        'USER',
        userId,
        {
          accessType: 'READ',
          dataFields: Object.keys(userData)
        }
      )

      return userData
    } catch (error) {
      console.error('[EMMA] User fetch failed:', error)
      throw new Error('Failed to retrieve user')
    }
  }

  /**
   * Update user profile with validation and audit logging
   */
  static async updateUser(
    userId: string,
    updates: Partial<ExtendedUser>,
    updatedBy: string
  ): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
        lastModifiedBy: updatedBy
      }

      await updateDoc(doc(db, COLLECTIONS.USERS, userId), updateData)

      // HIPAA Audit logging
      await logAdminAction(
        'USER_UPDATED',
        updatedBy,
        'USER',
        userId,
        {
          updatedFields: Object.keys(updates),
          changes: updates
        }
      )
    } catch (error) {
      console.error('[EMMA] User update failed:', error)
      throw new Error('Failed to update user')
    }
  }

  /**
   * Get users by institution with role-based filtering
   */
  static async getUsersByInstitution(
    institutionId: string,
    requestedBy: string,
    role?: UserRole
  ): Promise<ExtendedUser[]> {
    try {
      let q: Query = query(
        collection(db, COLLECTIONS.USERS),
        where('institutionId', '==', institutionId),
        where('isActive', '==', true)
      )

      if (role) {
        q = query(q, where('role', '==', role))
      }

      const querySnapshot = await getDocs(q)
      const users: ExtendedUser[] = []

      querySnapshot.forEach((doc) => {
        users.push(doc.data() as ExtendedUser)
      })

      // HIPAA Audit logging
      await logAdminAction(
        'BULK_USER_ACCESS',
        requestedBy,
        'USER_COLLECTION',
        institutionId,
        {
          userCount: users.length,
          roleFilter: role,
          institutionId
        }
      )

      return users
    } catch (error) {
      console.error('[EMMA] Bulk user fetch failed:', error)
      throw new Error('Failed to retrieve users')
    }
  }

  /**
   * Get resident physicians by institution with advanced filtering
   * Filters users with role='RESIDENT' and employment.position='Resident Physician'
   */
  static async getResidentPhysicians(
    institutionId: string,
    requestedBy: string,
    options?: {
      department?: Department
      pgyLevel?: PGYLevel
      isActive?: boolean
      searchTerm?: string
    }
  ): Promise<ExtendedUser[]> {
    try {
      // Use Admin SDK for server-side operations, Client SDK for client-side
      const dbInstance = typeof window === 'undefined' ? adminDb : db
      
      let q = dbInstance.collection(COLLECTIONS.USERS)
        .where('institutionId', '==', institutionId)
        .where('role', '==', 'RESIDENT')
      
      if (options?.isActive !== undefined) {
        q = q.where('isActive', '==', options.isActive)
      } else {
        q = q.where('isActive', '==', true) // Default to active only
      }

      if (options?.department) {
        q = q.where('department', '==', options.department)
      }

      if (options?.pgyLevel) {
        q = q.where('pgyLevel', '==', options.pgyLevel)
      }

      const querySnapshot = await q.get()
      let residents: ExtendedUser[] = []

      querySnapshot.forEach((doc) => {
        const userData = doc.data()
        
        // Filter for resident physicians based on employment position
        const hasResidentPhysicianPosition = userData.employment?.some(
          (emp: any) => emp.position === 'Resident Physician'
        )
        
        if (hasResidentPhysicianPosition) {
          residents.push({
            id: doc.id,
            ...userData
          } as ExtendedUser)
        }
      })

      // Apply search filter if provided
      if (options?.searchTerm) {
        const searchLower = options.searchTerm.toLowerCase()
        residents = residents.filter(resident =>
          resident.firstName.toLowerCase().includes(searchLower) ||
          resident.lastName.toLowerCase().includes(searchLower) ||
          resident.email.toLowerCase().includes(searchLower) ||
          resident.medicalLicenseNumber?.toLowerCase().includes(searchLower)
        )
      }

      // Sort by last name, first name
      residents.sort((a, b) => {
        const lastNameCompare = a.lastName.localeCompare(b.lastName)
        if (lastNameCompare !== 0) return lastNameCompare
        return a.firstName.localeCompare(b.firstName)
      })

      // HIPAA Audit logging
      await logAdminAction(
        'RESIDENT_PHYSICIANS_ACCESSED',
        requestedBy,
        'RESIDENT_COLLECTION',
        institutionId,
        {
          residentCount: residents.length,
          filters: {
            department: options?.department,
            pgyLevel: options?.pgyLevel,
            isActive: options?.isActive,
            hasSearch: !!options?.searchTerm
          },
          institutionId
        }
      )

      return residents
    } catch (error) {
      console.error('[EMMA] Resident physicians fetch failed:', error)
      throw new Error('Failed to retrieve resident physicians')
    }
  }

  /**
   * Create a new resident physician with proper employment position
   * Server-side only operation using Firebase Admin SDK
   */
  static async createResidentPhysician(
    residentData: {
      email: string
      firstName: string
      lastName: string
      department: Department
      pgyLevel: PGYLevel
      medicalLicenseNumber?: string
      supervisingFacultyId?: string
      phoneNumber?: string
      institutionId: string
      profile?: {
        title?: string
        middleName?: string
        preferredName?: string
      }
      education?: {
        medicalSchool: string
        graduationYear: number
        undergraduateInstitution?: string
      }
    },
    createdBy: string
  ): Promise<ExtendedUser> {
    try {
      // Validate server-side execution
      if (typeof window !== 'undefined') {
        throw new Error('createResidentPhysician must only be called server-side')
      }

      // Generate user ID
      const userId = residentData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
      
      // Check if user already exists
      const existingUserDoc = await adminDb.collection(COLLECTIONS.USERS).doc(userId).get()
      if (existingUserDoc.exists) {
        throw new Error('A user with this email already exists')
      }

      const timestamp = typeof window === 'undefined' ? 
        (await import('firebase-admin/firestore')).FieldValue.serverTimestamp() :
        Timestamp.now()

      const newResident: ExtendedUser = {
        id: userId,
        email: residentData.email,
        role: 'RESIDENT',
        firstName: residentData.firstName,
        lastName: residentData.lastName,
        department: residentData.department,
        pgyLevel: residentData.pgyLevel,
        status: 'PENDING_VERIFICATION',
        institutionId: residentData.institutionId,
        medicalLicenseNumber: residentData.medicalLicenseNumber,
        supervisingFacultyId: residentData.supervisingFacultyId,
        isActive: false, // Will be activated when Firebase Auth user is created
        emailVerified: false,
        phoneNumber: residentData.phoneNumber,
        createdBy,
        lastModifiedBy: createdBy,
        permissions: ROLE_PERMISSIONS.RESIDENT,
        createdAt: timestamp as any,
        updatedAt: timestamp as any,
        
        // Extended profile
        profile: {
          title: residentData.profile?.title || 'Dr.',
          middleName: residentData.profile?.middleName,
          preferredName: residentData.profile?.preferredName || residentData.firstName,
          bio: '',
        },
        
        // Professional credentials (empty initially)
        credentials: {
          boardCertifications: []
        },
        
        // Education information
        education: residentData.education || {
          medicalSchool: '',
          graduationYear: new Date().getFullYear()
        },
        
        // Employment as resident physician - KEY FIELD FOR FILTERING
        employment: [{
          startDate: timestamp as any,
          position: 'Resident Physician',
          department: residentData.department,
          supervisor: residentData.supervisingFacultyId,
          employmentType: 'FULL_TIME'
        }]
      }

      // Clean up undefined values for Firestore
      const cleanedResident = cleanUndefinedValues(newResident)

      // Create user document using Firebase Admin SDK
      await adminDb.collection(COLLECTIONS.USERS).doc(userId).set(cleanedResident)

      // HIPAA Audit logging
      await logAdminAction(
        'RESIDENT_PHYSICIAN_CREATED',
        createdBy,
        'USER',
        userId,
        {
          email: residentData.email,
          role: 'RESIDENT',
          department: residentData.department,
          pgyLevel: residentData.pgyLevel,
          institutionId: residentData.institutionId,
          position: 'Resident Physician'
        }
      )

      return cleanedResident as ExtendedUser
    } catch (error) {
      console.error('[EMMA] Resident physician creation failed:', error)
      
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          throw error
        } else if (error.message.includes('PERMISSION_DENIED')) {
          throw new Error(`Firestore permission denied: ${error.message}`)
        } else if (error.message.includes('UNAUTHENTICATED')) {
          throw new Error(`Firebase Admin SDK authentication failed: ${error.message}`)
        }
      }
      
      throw new Error('Failed to create resident physician profile')
    }
  }
}

// ===== INSTITUTION MANAGEMENT =====

export class InstitutionService {
  static async createInstitution(
    institutionData: Omit<Institution, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<Institution> {
    try {
      const institutionId = institutionData.name.toLowerCase().replace(/\s+/g, '-')
      const timestamp = Timestamp.now()

      const newInstitution: Institution = {
        ...institutionData,
        id: institutionId,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy,
        lastModifiedBy: createdBy
      }

      await setDoc(doc(db, COLLECTIONS.INSTITUTIONS, institutionId), newInstitution)

      await logAdminAction(
        'INSTITUTION_CREATED',
        createdBy,
        'INSTITUTION',
        institutionId,
        {
          name: institutionData.name,
          type: institutionData.type
        }
      )

      return newInstitution
    } catch (error) {
      console.error('[EMMA] Institution creation failed:', error)
      throw new Error('Failed to create institution')
    }
  }

  static async getInstitutionById(institutionId: string): Promise<Institution | null> {
    try {
      const institutionDoc = await getDoc(doc(db, COLLECTIONS.INSTITUTIONS, institutionId))
      return institutionDoc.exists() ? institutionDoc.data() as Institution : null
    } catch (error) {
      console.error('[EMMA] Institution fetch failed:', error)
      return null
    }
  }

  static async updateInstitution(
    institutionId: string,
    updateData: Partial<Institution>,
    updatedBy: string
  ): Promise<void> {
    try {
      const updatePayload = {
        ...updateData,
        updatedAt: Timestamp.now(),
        lastModifiedBy: updatedBy
      }
      
      await updateDoc(doc(db, COLLECTIONS.INSTITUTIONS, institutionId), updatePayload)
      
      await logAdminAction(
        'INSTITUTION_UPDATED',
        updatedBy,
        'INSTITUTION',
        institutionId,
        updatePayload
      )
    } catch (error) {
      console.error('[EMMA] Institution update failed:', error)
      throw error
    }
  }
}

// ===== RESIDENT MANAGEMENT =====

export class ResidentService {
  static async createResidentProfile(
    residentData: Omit<ResidentProfile, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<ResidentProfile> {
    try {
      const timestamp = Timestamp.now()

      const newResident: ResidentProfile = {
        ...residentData,
        id: residentData.userId,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy,
        lastModifiedBy: createdBy
      }

      await setDoc(doc(db, COLLECTIONS.RESIDENTS, residentData.userId), newResident)

      await logAdminAction(
        'RESIDENT_PROFILE_CREATED',
        createdBy,
        'RESIDENT',
        residentData.userId,
        {
          program: residentData.program.name,
          department: residentData.program.department,
          pgyLevel: residentData.program.currentPGYLevel
        }
      )

      return newResident
    } catch (error) {
      console.error('[EMMA] Resident profile creation failed:', error)
      throw new Error('Failed to create resident profile')
    }
  }

  static async getResidentsByInstitution(
    institutionId: string,
    requestedBy: string
  ): Promise<ResidentProfile[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.RESIDENTS),
        where('institutionId', '==', institutionId)
      )

      const querySnapshot = await getDocs(q)
      const residents: ResidentProfile[] = []

      querySnapshot.forEach((doc) => {
        residents.push(doc.data() as ResidentProfile)
      })

      await logAdminAction(
        'RESIDENT_BULK_ACCESS',
        requestedBy,
        'RESIDENT_COLLECTION',
        institutionId,
        {
          residentCount: residents.length,
          institutionId
        }
      )

      return residents
    } catch (error) {
      console.error('[EMMA] Resident bulk fetch failed:', error)
      throw new Error('Failed to retrieve residents')
    }
  }
}

// ===== ROTATION MANAGEMENT =====

export class RotationService {
  static async createRotation(
    rotationData: Omit<Rotation, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<Rotation> {
    try {
      const rotationId = `${rotationData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
      const timestamp = Timestamp.now()

      const newRotation: Rotation = {
        ...rotationData,
        id: rotationId,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy,
        lastModifiedBy: createdBy
      }

      await setDoc(doc(db, COLLECTIONS.ROTATIONS, rotationId), newRotation)

      await logAdminAction(
        'ROTATION_CREATED',
        createdBy,
        'ROTATION',
        rotationId,
        {
          name: rotationData.name,
          department: rotationData.department,
          duration: rotationData.duration
        }
      )

      return newRotation
    } catch (error) {
      console.error('[EMMA] Rotation creation failed:', error)
      throw new Error('Failed to create rotation')
    }
  }

  static async getRotationsByDepartment(
    institutionId: string,
    department: Department
  ): Promise<Rotation[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ROTATIONS),
        where('institutionId', '==', institutionId),
        where('department', '==', department),
        where('status', '==', 'ACTIVE')
      )

      const querySnapshot = await getDocs(q)
      const rotations: Rotation[] = []

      querySnapshot.forEach((doc) => {
        rotations.push(doc.data() as Rotation)
      })

      return rotations
    } catch (error) {
      console.error('[EMMA] Rotation fetch failed:', error)
      throw new Error('Failed to retrieve rotations')
    }
  }
}

// ===== EVALUATION MANAGEMENT =====

export class EvaluationService {
  static async createEvaluation(
    evaluationData: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<Evaluation> {
    try {
      const evaluationId = `eval-${evaluationData.evaluateeId}-${Date.now()}`
      const timestamp = Timestamp.now()

      const newEvaluation: Evaluation = {
        ...evaluationData,
        id: evaluationId,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy,
        lastModifiedBy: createdBy
      }

      await setDoc(doc(db, COLLECTIONS.EVALUATIONS, evaluationId), newEvaluation)

      await logAdminAction(
        'EVALUATION_CREATED',
        createdBy,
        'EVALUATION',
        evaluationId,
        {
          evaluateeId: evaluationData.evaluateeId,
          evaluatorId: evaluationData.evaluatorId,
          type: evaluationData.type
        }
      )

      return newEvaluation
    } catch (error) {
      console.error('[EMMA] Evaluation creation failed:', error)
      throw new Error('Failed to create evaluation')
    }
  }

  static async getEvaluationsByResident(
    residentId: string,
    requestedBy: string
  ): Promise<Evaluation[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.EVALUATIONS),
        where('evaluateeId', '==', residentId),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const evaluations: Evaluation[] = []

      querySnapshot.forEach((doc) => {
        evaluations.push(doc.data() as Evaluation)
      })

      await logAdminAction(
        'EVALUATION_BULK_ACCESS',
        requestedBy,
        'EVALUATION_COLLECTION',
        residentId,
        {
          evaluationCount: evaluations.length,
          residentId
        }
      )

      return evaluations
    } catch (error) {
      console.error('[EMMA] Evaluation fetch failed:', error)
      throw new Error('Failed to retrieve evaluations')
    }
  }
}

// ===== BATCH OPERATIONS =====

export class BatchOperations {
  /**
   * Initialize institution with default settings and admin user
   */
  static async initializeInstitution(
    institutionData: Omit<Institution, 'id' | 'createdAt' | 'updatedAt'>,
    adminUserData: Omit<ExtendedUser, 'id' | 'createdAt' | 'updatedAt'>,
    createdBy: string
  ): Promise<{ institution: Institution; adminUser: ExtendedUser }> {
    const batch = writeBatch(db)
    
    try {
      // Create institution
      const institution = await InstitutionService.createInstitution(institutionData, createdBy)
      
      // Create admin user with institution reference
      const adminUser = await UserService.createUser({
        ...adminUserData,
        institutionId: institution.id,
        role: 'ADMIN' as UserRole
      }, createdBy)

      // Update institution with admin user ID
      await InstitutionService.updateInstitution(institution.id, {
        adminUserIds: [adminUser.id]
      }, createdBy)

      await logAdminAction(
        'INSTITUTION_INITIALIZED',
        createdBy,
        'INSTITUTION',
        institution.id,
        {
          institutionName: institution.name,
          adminUserId: adminUser.id
        }
      )

      return { institution, adminUser }
    } catch (error) {
      console.error('[EMMA] Institution initialization failed:', error)
      throw new Error('Failed to initialize institution')
    }
  }
}

// Helper function for InstitutionService.updateInstitution
InstitutionService.updateInstitution = async function(
  institutionId: string,
  updates: Partial<Institution>,
  updatedBy: string
): Promise<void> {
  try {
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
      lastModifiedBy: updatedBy
    }

    await updateDoc(doc(db, COLLECTIONS.INSTITUTIONS, institutionId), updateData)

    await logAdminAction(
      'INSTITUTION_UPDATED',
      updatedBy,
      'INSTITUTION',
      institutionId,
      {
        updatedFields: Object.keys(updates)
      }
    )
  } catch (error) {
    console.error('[EMMA] Institution update failed:', error)
    throw new Error('Failed to update institution')
  }
}