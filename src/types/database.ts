/**
 * EMMA Healthcare Database Schema Types
 * 
 * Comprehensive Firestore collection schemas for healthcare education
 * administration with HIPAA compliance and role-based access control.
 */

import { Timestamp } from 'firebase/firestore'
import { UserRole, Department, PGYLevel, UserPermissions } from './user'

// ===== CORE ENTITY TYPES =====

export interface Institution {
  id: string
  name: string
  type: 'HOSPITAL' | 'CLINIC' | 'UNIVERSITY' | 'MEDICAL_CENTER'
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  contactInfo: {
    phone: string
    email: string
    website?: string
    fax?: string
  }
  accreditation: {
    body: string // e.g., "ACGME", "AAMC"
    status: 'ACCREDITED' | 'PROBATION' | 'WARNING' | 'WITHDRAWN'
    expirationDate: Timestamp
    certificateNumber: string
  }[]
  activePrograms: string[] // Department IDs
  adminUserIds: string[]
  settings: {
    timezone: string
    academicYearStart: Timestamp
    academicYearEnd: Timestamp
    evaluationDeadlineDays: number
    enableHIPAAAudit: boolean
    enableRealTimeUpdates: boolean
  }
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  lastModifiedBy: string
}

export interface ExtendedUser {
  // Core user fields (from existing user.ts)
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  department?: Department
  pgyLevel?: PGYLevel
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION'
  lastLogin?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
  institutionId: string
  medicalLicenseNumber?: string
  supervisingFacultyId?: string
  isActive: boolean
  emailVerified: boolean
  phoneNumber?: string
  createdBy: string
  lastModifiedBy: string
  permissions: UserPermissions
  
  // Extended healthcare fields
  profile: {
    middleName?: string
    preferredName?: string
    title?: string // Dr., MD, DO, etc.
    bio?: string
    profileImageUrl?: string
    emergencyContact?: {
      name: string
      relationship: string
      phone: string
      email?: string
    }
  }
  
  // Professional information
  credentials: {
    deaNumber?: string
    npiNumber?: string
    stateId?: string
    boardCertifications?: {
      board: string
      specialty: string
      dateObtained: Timestamp
      expirationDate?: Timestamp
    }[]
  }
  
  // Educational information (for residents)
  education?: {
    medicalSchool: string
    graduationYear: number
    undergraduateInstitution?: string
    otherDegrees?: string[]
  }
  
  // Employment history
  employment?: {
    startDate: Timestamp
    endDate?: Timestamp
    position: string
    department: Department
    supervisor?: string
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FELLOWSHIP'
  }[]
}

export interface ResidentProfile {
  id: string // Same as user ID
  userId: string
  institutionId: string
  
  // Program information
  program: {
    name: string
    department: Department
    trackType?: 'TRADITIONAL' | 'RESEARCH' | 'GLOBAL_HEALTH' | 'COMBINED'
    startDate: Timestamp
    expectedGraduationDate: Timestamp
    currentPGYLevel: PGYLevel
    totalPGYLevels: number
  }
  
  // Academic performance
  academicStatus: {
    standing: 'GOOD' | 'PROBATION' | 'REMEDIATION' | 'DISMISSED'
    gpa?: number
    examScores?: {
      examName: string
      score: number
      percentile?: number
      date: Timestamp
    }[]
    milestones?: {
      milestoneId: string
      status: 'NOT_STARTED' | 'DEVELOPING' | 'PROFICIENT' | 'ADVANCED'
      assessmentDate: Timestamp
      assessorId: string
    }[]
  }
  
  // Current assignments
  currentRotation?: {
    rotationId: string
    name: string
    department: Department
    attendingId: string
    startDate: Timestamp
    endDate: Timestamp
    location: string
  }
  
  supervisingFaculty: {
    primarySupervisorId: string
    academicAdvisorId?: string
    researchMentorId?: string
  }
  
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  lastModifiedBy: string
}

export interface Rotation {
  id: string
  name: string
  department: Department
  institutionId: string
  
  // Rotation details
  description: string
  objectives: string[]
  duration: number // weeks
  capacity: number // max residents
  isRequired: boolean
  pgyLevels: PGYLevel[] // Which PGY levels can take this rotation
  
  // Scheduling
  schedule: {
    startDate: Timestamp
    endDate: Timestamp
    daysOfWeek: number[] // 0=Sunday, 1=Monday, etc.
    startTime: string // "08:00"
    endTime: string // "17:00"
    callSchedule?: {
      frequency: 'NONE' | 'WEEKLY' | 'MONTHLY' | 'AS_NEEDED'
      maxCallsPerMonth?: number
    }
  }
  
  // Faculty and location
  attendingPhysicians: string[] // User IDs
  location: {
    building: string
    floor?: string
    room?: string
    address?: string
  }
  
  // Educational resources
  resources: {
    requiredReadings?: string[]
    recommendedReadings?: string[]
    onlineModules?: string[]
    skills?: string[]
  }
  
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  lastModifiedBy: string
}

export interface Schedule {
  id: string
  institutionId: string
  academicYear: string // "2024-2025"
  
  // Schedule metadata
  name: string
  description?: string
  type: 'ROTATION' | 'CALL' | 'CONFERENCE' | 'VACATION' | 'RESEARCH'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  
  // Time period
  startDate: Timestamp
  endDate: Timestamp
  
  // Assignments
  assignments: {
    residentId: string
    rotationId?: string
    supervisorId?: string
    location?: string
    notes?: string
  }[]
  
  // Publishing and approval
  publishedDate?: Timestamp
  approvedBy?: string
  approvalDate?: Timestamp
  
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  lastModifiedBy: string
}

export interface Evaluation {
  id: string
  institutionId: string
  type: 'ROTATION' | 'MILESTONE' | 'ANNUAL' | 'COMPETENCY' | 'RESEARCH'
  
  // Evaluation participants
  evaluateeId: string // Resident being evaluated
  evaluatorId: string // Faculty doing evaluation
  rotationId?: string // If rotation evaluation
  
  // Evaluation period
  evaluationPeriod: {
    startDate: Timestamp
    endDate: Timestamp
    rotationName?: string
  }
  
  // Evaluation content
  ratings: {
    category: string
    subcategory?: string
    score: number // 1-5 or 1-9 scale
    comments?: string
    milestoneLevel?: number
  }[]
  
  // Overall assessment
  overallRating: number
  strengths: string[]
  areasForImprovement: string[]
  goals: string[]
  summaryComments: string
  
  // Status and workflow
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'ARCHIVED'
  dueDate: Timestamp
  submittedDate?: Timestamp
  reviewedDate?: Timestamp
  reviewedBy?: string[]
  
  // Feedback
  residentFeedback?: {
    comments: string
    acknowledgedDate: Timestamp
  }
  
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  lastModifiedBy: string
}

// ===== AUDIT AND COMPLIANCE =====

export interface HIPAAAuditLog {
  id: string
  timestamp: Timestamp
  
  // Action details
  action: string
  actionCategory: 'LOGIN' | 'DATA_ACCESS' | 'DATA_MODIFICATION' | 'SYSTEM_CONFIG' | 'USER_MANAGEMENT'
  resource: {
    type: 'USER' | 'RESIDENT' | 'EVALUATION' | 'SCHEDULE' | 'SYSTEM'
    id?: string
    description?: string
  }
  
  // User information
  userId?: string
  userRole?: UserRole
  userEmail?: string
  sessionId?: string
  
  // Request details
  ipAddress?: string
  userAgent?: string
  endpoint?: string
  httpMethod?: string
  
  // Result
  success: boolean
  errorMessage?: string
  
  // Additional context
  details?: Record<string, any>
  sensitive: boolean // If contains PHI
  
  // Compliance
  institutionId: string
  environment: 'development' | 'staging' | 'production'
  version: string
  checksum?: string
}

// ===== SYSTEM CONFIGURATION =====

export interface SystemSettings {
  id: string
  institutionId: string
  
  // Authentication settings
  authentication: {
    sessionTimeout: number // minutes
    maxLoginAttempts: number
    lockoutDuration: number // minutes
    requireMFA: boolean
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
      preventReuse: boolean
      reuseHistory: number
    }
  }
  
  // HIPAA compliance
  hipaa: {
    auditLogging: boolean
    dataRetentionDays: number
    automaticLogout: boolean
    screenLockTimeout: number // minutes
    requireEncryption: boolean
  }
  
  // Academic settings
  academic: {
    academicYearStart: string // "YYYY-MM-DD"
    academicYearEnd: string
    evaluationDeadlineDays: number
    scheduleAdvanceNotice: number // days
    allowSelfScheduling: boolean
  }
  
  // Notification settings
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    evaluationReminders: boolean
    scheduleUpdates: boolean
    systemAlerts: boolean
  }
  
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  lastModifiedBy: string
}

// ===== COLLECTION NAMES (Constants) =====

export const COLLECTIONS = {
  USERS: 'users',
  INSTITUTIONS: 'institutions', 
  RESIDENTS: 'residents',
  ROTATIONS: 'rotations',
  SCHEDULES: 'schedules',
  EVALUATIONS: 'evaluations',
  HIPAA_AUDIT_LOGS: 'hipaa_audit_logs',
  AUDIT_BACKUP: 'audit_backup',
  AUDIT_EMERGENCY: 'audit_emergency',
  SYSTEM_SETTINGS: 'system_settings'
} as const

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS]