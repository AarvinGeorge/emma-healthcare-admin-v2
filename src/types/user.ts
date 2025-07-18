import { Timestamp } from 'firebase/firestore'

export type UserRole = 'ADMIN' | 'COORDINATOR' | 'FACULTY' | 'RESIDENT'

export type Department =
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

export type PGYLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION'

export interface User {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  department?: Department
  pgyLevel?: PGYLevel
  status: UserStatus
  lastLogin?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
  institutionId?: string
  medicalLicenseNumber?: string
  supervisingFacultyId?: string
  isActive: boolean
  emailVerified: boolean
  phoneNumber?: string
  createdBy: string
  lastModifiedBy: string
  permissions: UserPermissions
}

export interface UserPermissions {
  canViewAllUsers: boolean
  canCreateUsers: boolean
  canEditUsers: boolean
  canDeleteUsers: boolean
  canViewAllResidents: boolean
  canEditResidents: boolean
  canViewAllSchedules: boolean
  canCreateSchedules: boolean
  canEditSchedules: boolean
  canDeleteSchedules: boolean
  canViewAllEvaluations: boolean
  canCreateEvaluations: boolean
  canEditEvaluations: boolean
  canAccessReports: boolean
  canExportData: boolean
  canViewAuditLogs: boolean
  canManageSystem: boolean
}

// Role-based permissions
export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  ADMIN: {
    canViewAllUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canViewAllResidents: true,
    canEditResidents: true,
    canViewAllSchedules: true,
    canCreateSchedules: true,
    canEditSchedules: true,
    canDeleteSchedules: true,
    canViewAllEvaluations: true,
    canCreateEvaluations: true,
    canEditEvaluations: true,
    canAccessReports: true,
    canExportData: true,
    canViewAuditLogs: true,
    canManageSystem: true,
  },
  COORDINATOR: {
    canViewAllUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: false,
    canViewAllResidents: true,
    canEditResidents: true,
    canViewAllSchedules: true,
    canCreateSchedules: true,
    canEditSchedules: true,
    canDeleteSchedules: true,
    canViewAllEvaluations: true,
    canCreateEvaluations: true,
    canEditEvaluations: true,
    canAccessReports: true,
    canExportData: true,
    canViewAuditLogs: false,
    canManageSystem: false,
  },
  FACULTY: {
    canViewAllUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewAllResidents: true,
    canEditResidents: false,
    canViewAllSchedules: true,
    canCreateSchedules: false,
    canEditSchedules: false,
    canDeleteSchedules: false,
    canViewAllEvaluations: true,
    canCreateEvaluations: true,
    canEditEvaluations: true,
    canAccessReports: true,
    canExportData: false,
    canViewAuditLogs: false,
    canManageSystem: false,
  },
  RESIDENT: {
    canViewAllUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canViewAllResidents: false,
    canEditResidents: false,
    canViewAllSchedules: false,
    canCreateSchedules: false,
    canEditSchedules: false,
    canDeleteSchedules: false,
    canViewAllEvaluations: false,
    canCreateEvaluations: false,
    canEditEvaluations: false,
    canAccessReports: false,
    canExportData: false,
    canViewAuditLogs: false,
    canManageSystem: false,
  },
}