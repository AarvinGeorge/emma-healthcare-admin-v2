import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { logAdminAction } from '@/lib/firebase-admin'
import type { UserRole, Department, PGYLevel } from '@/types/user'

export const authOptions: NextAuthOptions = {
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

        try {
          // Authenticate with Firebase Auth
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          )

          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))

          if (!userDoc.exists()) {
            throw new Error('User profile not found in Firestore')
          }

          const userData = userDoc.data()

          // Healthcare access control - check if user is active
          if (!userData.isActive || userData.status !== 'ACTIVE') {
            throw new Error('Account is inactive or suspended')
          }

          // HIPAA audit logging
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

          // HIPAA audit logging for failed attempts
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
        token.emailVerified = user.emailVerified
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
        session.user.emailVerified = token.emailVerified as boolean
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

    async signOut({ session, token }) {
      // HIPAA audit logging for logout
      if (token?.sub) {
        await logAdminAction(
          'LOGOUT',
          token.sub,
          'USER',
          token.sub,
          {
            email: token.email,
            role: token.role,
            sessionDuration: Date.now() - (token.iat || 0) * 1000
          }
        )
      }
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  events: {
    async signOut({ token }) {
      console.log('🏥 EMMA: User signed out', {
        userId: token?.sub,
        email: token?.email,
        role: token?.role
      })
    },
    async session({ session, token }) {
      // Update last activity for HIPAA compliance
      if (process.env.NEXT_PUBLIC_ENABLE_HIPAA_AUDIT === 'true') {
        console.log('🏥 EMMA: Session activity', {
          userId: token?.sub,
          role: token?.role,
          timestamp: new Date().toISOString()
        })
      }
    }
  }
}

export default NextAuth(authOptions)