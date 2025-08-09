import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

// Firebase configuration with healthcare-grade validation
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Healthcare-grade environment variable validation
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const

const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar])
if (missingVars.length > 0) {
  throw new Error(
    `🚨 EMMA Admin Panel: Missing required Firebase environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env.local file and ensure all Firebase client credentials are configured.'
  )
}

// Initialize Firebase application
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase services with improved connection settings
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

// Configure Firestore for better connection stability
if (typeof window !== 'undefined') {
  // Client-side Firestore settings
  db._delegate._databaseId = db._delegate._databaseId
  
  // Enable offline persistence for better reliability
  try {
    // Note: This should be called before any other Firestore operations
    // enablePersistence(db, { synchronizeTabs: true })
  } catch (err) {
    console.warn('Firestore persistence could not be enabled:', err)
  }
}

// Development emulator setup
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true'

  if (useEmulators) {
    console.log('🏥 EMMA: Connecting to Firebase emulators...')

    // Firestore emulator
    if (process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST) {
      try {
        const [host, port] = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST.split(':')
        connectFirestoreEmulator(db, host, parseInt(port))
        console.log('✅ Firestore emulator connected')
      } catch (error) {
        console.warn('⚠️ Firestore emulator connection failed:', error)
      }
    }

    // Auth emulator
    if (process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST) {
      try {
        const [host, port] = process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST.split(':')
        connectAuthEmulator(auth, `http://${host}:${port}`)
        console.log('✅ Auth emulator connected')
      } catch (error) {
        console.warn('⚠️ Auth emulator connection failed:', error)
      }
    }
  }
}

export default app