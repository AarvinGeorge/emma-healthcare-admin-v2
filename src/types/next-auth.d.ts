import { UserRole, Department, PGYLevel, UserPermissions } from './user'

declare module 'next-auth' {
  interface User {
    role: UserRole
    firstName: string
    lastName: string
    department?: Department
    pgyLevel?: PGYLevel
    permissions: UserPermissions
    displayName: string
    institutionId?: string
    emailVerified: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      role: UserRole
      firstName: string
      lastName: string
      department?: Department
      pgyLevel?: PGYLevel
      permissions: UserPermissions
      displayName: string
      institutionId?: string
      emailVerified: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    firstName: string
    lastName: string
    department?: Department
    pgyLevel?: PGYLevel
    permissions: UserPermissions
    displayName: string
    institutionId?: string
    emailVerified: boolean
  }
}