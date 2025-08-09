/**
 * EMMA Healthcare Database Initialization
 * 
 * Scripts for initializing Firestore database with default data,
 * creating indexes, and setting up healthcare-specific collections.
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'
import { adminDb, adminAuth, logAdminAction } from './firebase-admin'
import { 
  COLLECTIONS, 
  Institution, 
  ExtendedUser, 
  SystemSettings,
  ResidentProfile
} from '@/types/database'
import { UserRole, Department, ROLE_PERMISSIONS } from '@/types/user'

// ===== DEFAULT INSTITUTION DATA =====

export const DEFAULT_INSTITUTION: Omit<Institution, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'> = {
  name: 'Allegheny General Hospital',
  type: 'HOSPITAL',
  address: {
    street: '320 E North Ave',
    city: 'Pittsburgh',
    state: 'PA',
    zipCode: '15212',
    country: 'USA'
  },
  contactInfo: {
    phone: '(412) 359-3131',
    email: 'info@ahn.org',
    website: 'https://www.ahn.org',
    fax: '(412) 359-4000'
  },
  accreditation: [{
    body: 'ACGME',
    status: 'ACCREDITED',
    expirationDate: Timestamp.fromDate(new Date('2027-12-31')),
    certificateNumber: 'ACGME-EM-2024-001'
  }],
  activePrograms: ['EMERGENCY_MEDICINE', 'INTERNAL_MEDICINE', 'SURGERY'],
  adminUserIds: [],
  settings: {
    timezone: 'America/New_York',
    academicYearStart: Timestamp.fromDate(new Date('2024-07-01')),
    academicYearEnd: Timestamp.fromDate(new Date('2025-06-30')),
    evaluationDeadlineDays: 30,
    enableHIPAAAudit: true,
    enableRealTimeUpdates: true
  },
  status: 'ACTIVE'
}

// ===== DEFAULT SYSTEM SETTINGS =====

export const DEFAULT_SYSTEM_SETTINGS: Omit<SystemSettings, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'> = {
  institutionId: 'allegheny-general',
  authentication: {
    sessionTimeout: 480, // 8 hours
    maxLoginAttempts: 5,
    lockoutDuration: 30, // 30 minutes
    requireMFA: false,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      preventReuse: true,
      reuseHistory: 3
    }
  },
  hipaa: {
    auditLogging: true,
    dataRetentionDays: 2555, // 7 years
    automaticLogout: true,
    screenLockTimeout: 15, // 15 minutes
    requireEncryption: true
  },
  academic: {
    academicYearStart: '2024-07-01',
    academicYearEnd: '2025-06-30',
    evaluationDeadlineDays: 30,
    scheduleAdvanceNotice: 14, // 2 weeks
    allowSelfScheduling: false
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    evaluationReminders: true,
    scheduleUpdates: true,
    systemAlerts: true
  }
}

// ===== DEFAULT ADMIN USER =====

export const createDefaultAdminUser = (
  email: string,
  firstName: string,
  lastName: string,
  institutionId: string = 'allegheny-general'
): Omit<ExtendedUser, 'id' | 'createdAt' | 'updatedAt'> => ({
  email,
  role: 'ADMIN',
  firstName,
  lastName,
  department: 'EMERGENCY_MEDICINE',
  pgyLevel: undefined,
  status: 'ACTIVE',
  institutionId,
  medicalLicenseNumber: undefined,
  supervisingFacultyId: undefined,
  isActive: true,
  emailVerified: true,
  phoneNumber: undefined,
  createdBy: 'SYSTEM_INIT',
  lastModifiedBy: 'SYSTEM_INIT',
  permissions: ROLE_PERMISSIONS.ADMIN,
  
  profile: {
    title: 'Dr.',
    preferredName: firstName,
    bio: 'System Administrator',
    profileImageUrl: undefined,
    emergencyContact: undefined
  },
  
  credentials: {
    deaNumber: undefined,
    npiNumber: undefined,
    stateId: undefined,
    boardCertifications: []
  },
  
  education: undefined,
  
  employment: [{
    startDate: Timestamp.now(),
    position: 'System Administrator',
    department: 'EMERGENCY_MEDICINE',
    supervisor: undefined,
    employmentType: 'FULL_TIME'
  }]
})

// ===== INITIALIZATION FUNCTIONS =====

/**
 * Initialize the database with default institution and settings
 */
export async function initializeDatabase(
  adminEmail: string,
  adminFirstName: string,
  adminLastName: string
): Promise<{
  institution: Institution
  adminUser: ExtendedUser
  systemSettings: SystemSettings
}> {
  console.log('[EMMA] Starting database initialization...')
  
  try {
    const batch = writeBatch(db)
    const timestamp = Timestamp.now()
    const institutionId = 'allegheny-general'
    
    // Check if already initialized
    const institutionDoc = await getDoc(doc(db, COLLECTIONS.INSTITUTIONS, institutionId))
    if (institutionDoc.exists()) {
      throw new Error('Database already initialized')
    }

    // Create institution
    const institution: Institution = {
      ...DEFAULT_INSTITUTION,
      id: institutionId,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: 'SYSTEM_INIT',
      lastModifiedBy: 'SYSTEM_INIT'
    }

    // Create admin user
    const adminUserData = createDefaultAdminUser(adminEmail, adminFirstName, adminLastName, institutionId)
    const adminUser: ExtendedUser = {
      ...adminUserData,
      id: adminEmail.split('@')[0],
      createdAt: timestamp,
      updatedAt: timestamp
    }

    // Update institution with admin user ID
    institution.adminUserIds = [adminUser.id]

    // Create system settings
    const systemSettings: SystemSettings = {
      ...DEFAULT_SYSTEM_SETTINGS,
      id: `${institutionId}-settings`,
      institutionId,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: 'SYSTEM_INIT',
      lastModifiedBy: 'SYSTEM_INIT'
    }

    // Add to batch
    batch.set(doc(db, COLLECTIONS.INSTITUTIONS, institutionId), institution)
    batch.set(doc(db, COLLECTIONS.USERS, adminUser.id), adminUser)
    batch.set(doc(db, COLLECTIONS.SYSTEM_SETTINGS, systemSettings.id), systemSettings)

    // Commit batch
    await batch.commit()

    // HIPAA audit logging
    await logAdminAction(
      'DATABASE_INITIALIZED',
      adminUser.id,
      'SYSTEM',
      institutionId,
      {
        institutionName: institution.name,
        adminUserId: adminUser.id,
        adminEmail: adminEmail,
        initializationDate: timestamp.toDate().toISOString()
      }
    )

    console.log('[EMMA] Database initialization completed successfully')
    
    return {
      institution,
      adminUser,
      systemSettings
    }

  } catch (error) {
    console.error('[EMMA] Database initialization failed:', error)
    throw error
  }
}

/**
 * Seed database with sample data for development/testing
 */
export async function seedDevelopmentData(institutionId: string = 'allegheny-general'): Promise<void> {
  console.log('[EMMA] Seeding development data...')
  
  try {
    const batch = writeBatch(db)
    const timestamp = Timestamp.now()

    // Sample users
    const sampleUsers: Omit<ExtendedUser, 'id' | 'createdAt' | 'updatedAt'>[] = [
      // Faculty member
      {
        email: 'john.attending@ahn.org',
        role: 'FACULTY',
        firstName: 'John',
        lastName: 'Attending',
        department: 'EMERGENCY_MEDICINE',
        status: 'ACTIVE',
        institutionId,
        medicalLicenseNumber: 'PA123456',
        isActive: true,
        emailVerified: true,
        createdBy: 'SEED_DATA',
        lastModifiedBy: 'SEED_DATA',
        permissions: ROLE_PERMISSIONS.FACULTY,
        profile: {
          title: 'Dr.',
          preferredName: 'John',
          bio: 'Emergency Medicine Attending Physician',
        },
        credentials: {
          boardCertifications: [{
            board: 'ABEM',
            specialty: 'Emergency Medicine',
            dateObtained: Timestamp.fromDate(new Date('2015-01-01')),
            expirationDate: Timestamp.fromDate(new Date('2025-01-01'))
          }]
        },
        employment: [{
          startDate: Timestamp.fromDate(new Date('2020-07-01')),
          position: 'Attending Physician',
          department: 'EMERGENCY_MEDICINE',
          employmentType: 'FULL_TIME'
        }]
      },
      
      // Program coordinator
      {
        email: 'sarah.coordinator@ahn.org',
        role: 'COORDINATOR',
        firstName: 'Sarah',
        lastName: 'Coordinator',
        department: 'EMERGENCY_MEDICINE',
        status: 'ACTIVE',
        institutionId,
        isActive: true,
        emailVerified: true,
        createdBy: 'SEED_DATA',
        lastModifiedBy: 'SEED_DATA',
        permissions: ROLE_PERMISSIONS.COORDINATOR,
        profile: {
          title: 'Ms.',
          preferredName: 'Sarah',
          bio: 'Emergency Medicine Program Coordinator',
        },
        credentials: {},
        employment: [{
          startDate: Timestamp.fromDate(new Date('2019-03-01')),
          position: 'Program Coordinator',
          department: 'EMERGENCY_MEDICINE',
          employmentType: 'FULL_TIME'
        }]
      },
      
      // Resident physicians
      {
        email: 'mike.resident@ahn.org',
        role: 'RESIDENT',
        firstName: 'Mike',
        lastName: 'Resident',
        department: 'EMERGENCY_MEDICINE',
        pgyLevel: 2,
        status: 'ACTIVE',
        institutionId,
        supervisingFacultyId: 'john.attending',
        isActive: true,
        emailVerified: true,
        createdBy: 'SEED_DATA',
        lastModifiedBy: 'SEED_DATA',
        permissions: ROLE_PERMISSIONS.RESIDENT,
        profile: {
          title: 'Dr.',
          preferredName: 'Mike',
          bio: 'PGY-2 Emergency Medicine Resident',
        },
        credentials: {},
        education: {
          medicalSchool: 'University of Pittsburgh School of Medicine',
          graduationYear: 2023,
          undergraduateInstitution: 'Penn State University'
        },
        employment: [{
          startDate: Timestamp.fromDate(new Date('2023-07-01')),
          position: 'Resident Physician',
          department: 'EMERGENCY_MEDICINE',
          supervisor: 'john.attending',
          employmentType: 'FULL_TIME'
        }]
      }
    ]

    // Add users to batch
    sampleUsers.forEach((userData) => {
      const userId = userData.email.split('@')[0]
      const user: ExtendedUser = {
        ...userData,
        id: userId,
        createdAt: timestamp,
        updatedAt: timestamp
      }
      batch.set(doc(db, COLLECTIONS.USERS, userId), user)
    })

    // Create resident profile for the resident user
    const residentProfile: ResidentProfile = {
      id: 'mike.resident',
      userId: 'mike.resident',
      institutionId,
      program: {
        name: 'Emergency Medicine Residency',
        department: 'EMERGENCY_MEDICINE',
        trackType: 'TRADITIONAL',
        startDate: Timestamp.fromDate(new Date('2023-07-01')),
        expectedGraduationDate: Timestamp.fromDate(new Date('2026-06-30')),
        currentPGYLevel: 2,
        totalPGYLevels: 3
      },
      academicStatus: {
        standing: 'GOOD',
        gpa: 3.8,
        examScores: [],
        milestones: []
      },
      supervisingFaculty: {
        primarySupervisorId: 'john.attending',
        academicAdvisorId: 'john.attending'
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: 'SEED_DATA',
      lastModifiedBy: 'SEED_DATA'
    }

    batch.set(doc(db, COLLECTIONS.RESIDENTS, residentProfile.id), residentProfile)

    // Commit all seeded data
    await batch.commit()

    // HIPAA audit logging
    await logAdminAction(
      'DEVELOPMENT_DATA_SEEDED',
      'SYSTEM_SEED',
      'SYSTEM',
      institutionId,
      {
        userCount: sampleUsers.length,
        residentProfileCount: 1,
        seedDate: timestamp.toDate().toISOString()
      }
    )

    console.log('[EMMA] Development data seeding completed successfully')

  } catch (error) {
    console.error('[EMMA] Development data seeding failed:', error)
    throw error
  }
}

/**
 * Check if database is initialized
 */
export async function isDatabaseInitialized(institutionId: string = 'allegheny-general'): Promise<boolean> {
  try {
    const institutionDoc = await getDoc(doc(db, COLLECTIONS.INSTITUTIONS, institutionId))
    return institutionDoc.exists()
  } catch (error) {
    console.error('[EMMA] Failed to check initialization status:', error)
    return false
  }
}

/**
 * Get initialization status and basic stats
 */
export async function getDatabaseStats(institutionId: string = 'allegheny-general'): Promise<{
  initialized: boolean
  userCount?: number
  residentCount?: number
  institutionName?: string
}> {
  try {
    const initialized = await isDatabaseInitialized(institutionId)
    
    if (!initialized) {
      return { initialized: false }
    }

    const institutionDoc = await getDoc(doc(db, COLLECTIONS.INSTITUTIONS, institutionId))
    const institutionData = institutionDoc.data() as Institution

    // These would require more complex queries in production
    // For now, return basic info
    return {
      initialized: true,
      institutionName: institutionData.name,
      userCount: institutionData.adminUserIds.length,
      residentCount: 0
    }

  } catch (error) {
    console.error('[EMMA] Failed to get database stats:', error)
    return { initialized: false }
  }
}