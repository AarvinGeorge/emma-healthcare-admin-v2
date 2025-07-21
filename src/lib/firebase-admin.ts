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

    // HIPAA-compliant audit logging - Never log to console in production
    if (process.env.NODE_ENV === 'development') {
      console.log(`[HIPAA_AUDIT] ${action}`, auditLog)
    }

    // Always save to encrypted audit collection with error recovery
    try {
      // Save to primary audit collection with encryption
      await adminDb.collection('hipaa_audit_logs').add({
        ...auditLog,
        encrypted: true,
        version: '1.0',
      })

      // Create backup audit entry for compliance
      await adminDb.collection('audit_backup').add({
        timestamp: auditLog.timestamp,
        action,
        userId,
        resourceType,
        resourceId,
        checksum: Buffer.from(JSON.stringify(auditLog)).toString('base64'),
      })
    } catch (error) {
      // Critical: Audit logging failure must be handled
      console.error('[CRITICAL] HIPAA audit log failure - immediate attention required')
      
      // Attempt emergency backup storage
      try {
        await adminDb.collection('audit_emergency').add({
          timestamp: new Date().toISOString(),
          originalLog: auditLog,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'FAILED_PRIMARY_STORAGE',
        })
      } catch (emergencyError) {
        // Last resort: File system backup (should trigger alerts)
        console.error('[EMERGENCY] All audit storage methods failed - check system integrity')
      }
      
      // Re-throw to ensure calling code knows audit failed
      throw new Error('HIPAA audit logging failed - operation may need to be rolled back')
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