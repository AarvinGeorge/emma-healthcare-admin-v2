/**
 * NextAuth.js App Router Configuration for EMMA Healthcare
 * 
 * HIPAA-compliant authentication system for medical education administration
 * with healthcare-specific role-based access control and audit logging.
 */

import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { adminDb, logAdminAction } from '@/lib/firebase-admin'
import type { UserRole, Department, PGYLevel } from '@/types/user'

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'development' ? 'dev-secret-key-not-for-production' : undefined),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Validate Firebase configuration
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
          console.error('[EMMA] Firebase configuration incomplete. Check environment variables.')
          throw new Error('Firebase configuration is required for authentication')
        }

        try {
          // Authenticate with Firebase Auth
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          )

          // Fetch user profile from Firestore using Admin SDK (bypasses security rules)
          const userDoc = await adminDb.collection('users').doc(userCredential.user.uid).get()

          if (!userDoc.exists) {
            throw new Error('User profile not found in Firestore')
          }

          const userData = userDoc.data()

          // Healthcare access control - check if user is active
          const requireEmailVerification = process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === 'true'
          const allowedStatuses = requireEmailVerification ? ['ACTIVE'] : ['ACTIVE', 'PENDING_VERIFICATION']
          
          if (!userData.isActive && requireEmailVerification) {
            throw new Error('Account is inactive. Please verify your email address.')
          }
          
          if (!allowedStatuses.includes(userData.status)) {
            throw new Error('Account is inactive or suspended')
          }

          // HIPAA audit logging (only if Firebase Admin is configured)
          try {
            await logAdminAction(
              'LOGIN_SUCCESS',
              userCredential.user.uid,
              'USER',
              userCredential.user.uid,
              {
                email: credentials.email,
                role: userData.role,
                department: userData.department,
                ipAddress: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip']
              }
            )
          } catch (auditError) {
            console.warn('[DEV] Audit logging failed (likely due to missing Firebase Admin config):', auditError)
          }

          return {
            id: userCredential.user.uid,
            email: userCredential.user.email!,
            role: userData.role as UserRole,
            firstName: userData.firstName,
            lastName: userData.lastName,
            department: userData.department as Department,
            pgyLevel: userData.pgyLevel as PGYLevel,
            permissions: userData.permissions,
            displayName: `${userData.firstName} ${userData.lastName}`,
            institutionId: userData.institutionId,
            emailVerified: userCredential.user.emailVerified
          }
        } catch (error) {
          console.error('Authentication error:', error)

          // HIPAA audit logging for failed attempts (only if Firebase Admin is configured)
          try {
            await logAdminAction(
              'LOGIN_FAILED',
              undefined,
              'USER',
              undefined,
              {
                email: credentials.email,
                error: error instanceof Error ? error.message : 'Unknown error',
                ipAddress: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip']
              }
            )
          } catch (auditError) {
            console.warn('[DEV] Audit logging failed (likely due to missing Firebase Admin config):', auditError)
          }

          return null
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '28800'), // 8 hours default
    updateAge: 3600, // 1 hour
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.department = user.department
        token.pgyLevel = user.pgyLevel
        token.permissions = user.permissions
        token.displayName = user.displayName
        token.institutionId = user.institutionId
        token.emailVerified = Boolean(user.emailVerified)
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.department = token.department as Department
        session.user.pgyLevel = token.pgyLevel as PGYLevel
        session.user.permissions = token.permissions as any
        session.user.displayName = token.displayName as string
        session.user.institutionId = token.institutionId as string
        session.user.emailVerified = Boolean(token.emailVerified)
      }
      return session
    },

    async signIn({ user, account, profile }) {
      // Healthcare-specific sign-in validation
      if (user.role && !['ADMIN', 'COORDINATOR', 'FACULTY', 'RESIDENT'].includes(user.role)) {
        return false
      }
      return true
    },

    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful login
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  events: {
    async signOut({ token }) {
      // HIPAA-compliant session termination logging
      if (token?.sub) {
        try {
          await logAdminAction(
            'SESSION_TERMINATED',
            token.sub,
            'USER_SESSION',
            token.sub,
            {
              email: token.email as string,
              role: token.role as string,
              terminationType: 'USER_SIGNOUT',
            }
          )
        } catch (error) {
          console.error('[HIPAA] Session termination audit logging failed')
        }
      }
    },
    async session({ session, token }) {
      // HIPAA-compliant session activity logging
      if (process.env.NEXT_PUBLIC_ENABLE_HIPAA_AUDIT === 'true' && token?.sub) {
        try {
          await logAdminAction(
            'SESSION_ACTIVITY',
            token.sub,
            'USER_SESSION',
            token.sub,
            {
              role: token.role as string,
              lastActivity: new Date().toISOString(),
            }
          )
        } catch (error) {
          // Don't expose session data in console - just log that audit failed
          console.error('[HIPAA] Session audit logging failed')
        }
      }
    }
  }
}

const handler = NextAuth(authOptions)

// Export for App Router
export { handler as GET, handler as POST }