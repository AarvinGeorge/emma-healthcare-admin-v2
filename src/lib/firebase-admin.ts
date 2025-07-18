import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Server-side only validation
if (typeof window !== 'undefined') {
  throw new Error('🚨 EMMA: Firebase Admin SDK must only be used server-side')
}

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

// Validate environment variables
const requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY']
const missingVars = requiredVars.filter((envVar) => !process.env[envVar])

if (missingVars.length > 0) {
  throw new Error(`🚨 EMMA: Missing Firebase Admin variables: ${missingVars.join(', ')}`)
}

// Initialize Firebase Admin
const app = getApps().length === 0
  ? initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    })
  : getApps()[0]

export const adminDb = getFirestore(app)
export const adminAuth = getAuth(app)

// HIPAA-compliant audit logging
export const logAdminAction = async (
  action: string,
  userId?: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, any>
) => {
  if (process.env.NEXT_PUBLIC_ENABLE_HIPAA_AUDIT === 'true') {
    const auditLog = {
      timestamp: new Date().toISOString(),
      action,
      userId,
      resourceType,
      resourceId,
      details: details ? sanitizeForLogging(details) : undefined,
      source: 'EMMA_ADMIN_PANEL',
      environment: process.env.NODE_ENV,
    }

    console.log(`[HIPAA_AUDIT] ${action}`, auditLog)

    // In production, save to secure audit collection
    if (process.env.NODE_ENV === 'production') {
      try {
        await adminDb.collection('audit_logs').add(auditLog)
      } catch (error) {
        console.error('Failed to save audit log:', error)
      }
    }
  }
}

// Sanitize sensitive data for logging
function sanitizeForLogging(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = ['password', 'ssn', 'dob', 'phoneNumber', 'address']
  const sanitized = { ...data }

  sensitiveFields.forEach((field) => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  })

  return sanitized
}

export default app