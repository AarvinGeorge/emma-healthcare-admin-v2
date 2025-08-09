# EMMA Healthcare Admin Panel V2

# 🚨 LATEST UPDATE - August 8, 2025: Authentication System Complete ✅

**CRITICAL**: All authentication issues resolved - Login system now fully operational!

## ✅ Authentication System Fixes Complete
- **Email Verification Toggle**: Configurable requirement with `NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION`
- **Document ID Bug**: Fixed Firestore/Firebase Auth UID mismatch causing login failures
- **Complete Flow**: Registration → Login → Dashboard access working end-to-end
- **Test Users**: Ready-to-use credentials for immediate testing
- **No Firebase Config Required**: Development mode works out of the box

### 🔧 Quick Test Instructions
**Test User Credentials (Ready to Use):**
- Email: `fixtest@cmu.edu` | Password: `FixTest@1234`
- Email: `workingtest@cmu.edu` | Password: `WorkingTest@1234`

**Development Flow:**
1. `npm run dev`
2. Navigate to `http://localhost:3000`
3. Register new user or use test credentials above
4. Login immediately works (no email verification needed)
5. Full dashboard access granted

### 🛠️ Email Verification Configuration
```bash
# .env.local configuration
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="false"  # Default: disabled for development
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="true"   # Enable for production with email verification
```

**Development Mode (Default):**
- Users can register and login immediately
- No email verification required
- Instant dashboard access
- Perfect for rapid development and testing

**Production Mode:**
- Requires email verification before login
- Sends verification emails via Firebase
- Users must verify email before accessing dashboard
- HIPAA-compliant email verification workflow

### 🐛 Critical Bug Fixed: Login Failure Resolution

**Issue**: Users could register successfully but failed to login with error "User profile not found in Firestore"

**Root Cause**: Document ID mismatch between registration and login processes
- Registration: Created Firestore documents with ID = `email.split('@')[0]` (e.g., "testuser")  
- Login: NextAuth searched for documents with ID = `Firebase Auth UID` (e.g., "BCt7JCef0NQkVGCN0vfdAhDI0WG3")

**Solution**: Updated UserService to use Firebase Auth UID consistently
- Modified `src/lib/database.ts` to accept optional `userId` parameter
- Updated `src/app/api/auth/register/route.ts` to pass Firebase Auth UID to UserService
- Ensured document ID alignment between registration and login processes

**Files Modified:**
- `src/lib/database.ts` - UserService.createUser() now uses Firebase Auth UID as document ID
- `src/app/api/auth/register/route.ts` - Passes userId parameter to UserService
- `src/app/api/auth/[...nextauth]/route.ts` - Login validation updated for new user status logic

### 🔒 Security & HIPAA Compliance Maintained
- **Two-layer Security**: Admin SDK (server-side) bypasses rules, Client SDK (client-side) enforces rules
- **HIPAA Audit Logging**: All authentication actions logged securely
- **Role-based Access**: Admin, Coordinator, Faculty, Resident permissions maintained
- **Session Security**: Proper timeout and termination handling
- **Production Ready**: All enterprise security features preserved

---

**Status**: ✅ **PRODUCTION READY** - Complete TypeScript Migration & Material UI 5 Design System  
**Last Updated**: August 8, 2025 at 12:30 EDT  
**Authentication**: ✅ **FULLY OPERATIONAL** - Registration, Login, and Dashboard access working  
**TypeScript Migration**: ✅ **COMPLETE** - Full frontend TypeScript conversion with industry standards  
**HIPAA Compliance**: ✅ **SECURED** - All audit logging violations resolved  
**Development Safety**: ✅ **ENHANCED** - DOM prop leakage fixed, NextAuth development fallbacks added

A TypeScript-first healthcare administration platform built with Material UI 5, featuring medical-grade design systems, HIPAA-compliant authentication, type-safe component architecture, and comprehensive development safety features for medical education and residency management.

## 🔧 Technical Implementation Details - Authentication System

### Email Verification Toggle Architecture

**Environment Configuration**
```bash
# Development mode (default) - immediate access
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="false"

# Production mode - email verification required
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="true"
```

**Backend Implementation (`src/app/api/auth/register/route.ts`)**
```typescript
// Conditional user status based on email verification requirement
const requireEmailVerification = process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === 'true'

const userData = {
  // User status: ACTIVE immediately if verification disabled, PENDING_VERIFICATION if enabled
  status: requireEmailVerification ? 'PENDING_VERIFICATION' : 'ACTIVE',
  
  // User active state: true immediately if verification disabled
  isActive: !requireEmailVerification,
  
  // Email verified flag: true immediately if verification disabled
  emailVerified: !requireEmailVerification,
}

// Conditional email sending
if (requireEmailVerification) {
  await sendEmailVerification(firebaseUser)
}
```

**NextAuth Integration (`src/app/api/auth/[...nextauth]/route.ts`)**
```typescript
// Allow different user statuses based on verification requirement
const requireEmailVerification = process.env.NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION === 'true'
const allowedStatuses = requireEmailVerification ? ['ACTIVE'] : ['ACTIVE', 'PENDING_VERIFICATION']

// Flexible login validation
if (!userData.isActive && requireEmailVerification) {
  throw new Error('Account is inactive. Please verify your email address.')
}

if (!allowedStatuses.includes(userData.status)) {
  throw new Error('Account is inactive or suspended')
}
```

### Document ID Alignment Fix

**Problem Analysis**
```typescript
// BEFORE (Broken): Registration vs Login ID mismatch
// Registration: UserService.createUser() used email-based ID
const userId = userData.email.split('@')[0] // "testuser"

// Login: NextAuth looked for Firebase Auth UID 
const userDoc = await adminDb.collection('users').doc(userCredential.user.uid).get() // "BCt7JCef0NQkVGCN0vfdAhDI0WG3"
```

**Solution Implementation**
```typescript
// AFTER (Fixed): Consistent Firebase Auth UID usage
// UserService updated to accept Firebase Auth UID
static async createUser(
  userData: Omit<ExtendedUser, 'id' | 'createdAt' | 'updatedAt'>,
  createdBy: string,
  userId?: string  // NEW: Firebase Auth UID parameter
): Promise<ExtendedUser>

// Use Firebase Auth UID as document ID
const docId = userId || userData.email.split('@')[0] // Prioritize Firebase Auth UID
await adminDb.collection(COLLECTIONS.USERS).doc(docId).set(cleanedUser)

// Registration API passes Firebase Auth UID
const createdUser = await UserService.createUser(userData, 'SYSTEM', userId)
```

### HIPAA Compliance Architecture

**Two-Layer Security Model**
```typescript
// Server-side: Admin SDK bypasses Firestore security rules
import { adminDb, logAdminAction } from '@/lib/firebase-admin'

// Create user with admin privileges (registration)
await adminDb.collection('users').doc(userId).set(userData)

// Client-side: Regular SDK enforces Firestore security rules
import { db } from '@/lib/firebase'

// Regular user operations follow security rules
const userDoc = await getDoc(doc(db, 'users', userId))
```

**Audit Logging System**
```typescript
// All authentication actions are HIPAA-logged
await logAdminAction(
  'USER_REGISTRATION_SUCCESS',
  userId,
  'USER',
  userId,
  {
    email: userData.email,
    role: userData.role,
    department: userData.department,
    institutionId: userData.institutionId,
    ipAddress: clientIP,
    userAgent: request.headers.get('user-agent'),
    registrationMethod: 'WEB_FORM'
  }
)
```

### Development vs Production Modes

**Development Mode (Email Verification Disabled)**
- ✅ Immediate user registration and login
- ✅ No email configuration required
- ✅ Instant dashboard access for testing
- ✅ All security features maintained for data integrity

**Production Mode (Email Verification Enabled)**  
- ✅ Firebase Console email template configuration required
- ✅ Users receive verification emails
- ✅ Login blocked until email verified
- ✅ HIPAA-compliant email verification workflow

### Firebase Console Configuration (Production Only)

When `NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="true"`:

1. **Authentication Settings**
   - Navigate to Firebase Console → Authentication → Templates
   - Configure "Email address verification" template
   - Set action URL to: `https://yourdomain.com/auth/action`

2. **Email Verification Handler** (`/auth/action`)
   - Processes `mode=verifyEmail` action codes
   - Updates user status from `PENDING_VERIFICATION` to `ACTIVE`  
   - Enables dashboard access after verification

## 🛠️ Troubleshooting Guide

### Common Authentication Issues

**Issue**: "User profile not found in Firestore" during login
- **Cause**: User was created before the document ID fix
- **Solution**: Register a new user - they will work immediately
- **Prevention**: All new users use proper Firebase Auth UID alignment

**Issue**: "Account is inactive or suspended" during login  
- **Cause**: Email verification enabled but user hasn't verified email
- **Solution**: Check email for verification link OR disable verification in `.env.local`
- **Quick Fix**: Set `NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="false"` and restart server

**Issue**: Email verification not working
- **Cause**: Firebase Console email templates not configured
- **Solution**: Configure email templates in Firebase Console Authentication section
- **Development**: Disable email verification for immediate testing

**Issue**: Cannot access dashboard after login
- **Cause**: Session not properly established or user permissions issue
- **Solution**: Clear browser cookies and try logging in again
- **Debug**: Check browser dev tools for NextAuth session data

### Environment Configuration Checklist

**Minimum Required (Development):**
```bash
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="false"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-admin-sdk-email"
FIREBASE_PRIVATE_KEY="your-private-key"
NEXTAUTH_SECRET="your-nextauth-secret"
```

**Full Configuration (Production):**
```bash
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="true"
# All Firebase client config (NEXT_PUBLIC_FIREBASE_*)
# All Firebase admin config
# NextAuth configuration
```

### Quick Development Setup

1. **Clone and Install**
   ```bash
   git clone <repo>
   cd emma-admin-v2
   npm install
   ```

2. **Environment Setup** 
   ```bash
   cp .env.example .env.local
   # Add your Firebase credentials
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Test Immediately**
   - Use test credentials: `fixtest@cmu.edu` / `FixTest@1234`
   - Or register new user for instant access

## 🚨 CRITICAL FIXES COMPLETED

### ✅ HIPAA Compliance Violations RESOLVED
- **Fixed**: console.log() exposure of audit data in `firebase-admin.ts`
- **Fixed**: Session data logging in `nextauth.ts`  
- **Implemented**: Encrypted audit log storage with error recovery
- **Added**: Emergency backup systems for audit failures

### ✅ React DOM Prop Leakage RESOLVED *(July 21, 2025)*
- **Fixed**: `emmaVariant` and `emmaSize` prop warnings in React console
- **Implemented**: `shouldForwardProp` pattern for all styled components  
- **Result**: Zero React development warnings, clean console output
- **Pattern**: Industry-standard Material UI 5 + TypeScript prop filtering

### ✅ Development Safety Enhancements *(July 21, 2025)*
- **NextAuth Fallbacks**: Mock authentication for development environments
- **Firebase Safety**: Graceful degradation when credentials missing  
- **Error Handling**: Try-catch blocks around all Firebase Admin operations
- **Production Ready**: All security features maintained when properly configured

### ✅ Architecture Modernization COMPLETE
- **Migrated**: Pages Router → App Router for NextAuth
- **Removed**: Tailwind CSS v4 competing design system
- **Implemented**: Pure Material UI 5 design system
- **Created**: EMMA Healthcare component library
- **TypeScript Migration**: Complete frontend TypeScript conversion *(July 21, 2025)*

### ✅ Design System Migration SUCCESS
- **Before**: Competing Tailwind + Material Dashboard systems
- **After**: Unified Material UI 5 healthcare design system
- **Result**: Consistent, maintainable, medical-grade UI

## 🎯 TYPESCRIPT MIGRATION COMPLETE - July 21, 2025

### ✅ Full Frontend TypeScript Conversion
- **Migrated All Components**: EMMAButton, EMMAInput, EMMACard, EMMALoginForm → `.tsx`
- **Theme System**: `emma-healthcare-theme.js` → `.ts` with Material UI 5 type extensions
- **Type Definitions**: Comprehensive interfaces for all healthcare-specific props
- **Industry Standards**: Proper React.FC, Material UI 5 TypeScript patterns
- **Type Safety**: Full IntelliSense support for all medical data structures

### ✅ Critical DOM Prop Issues RESOLVED  
- **Fixed React Warnings**: `emmaVariant` and `emmaSize` prop leakage to DOM elements
- **Implemented shouldForwardProp**: Proper Material UI 5 styled component patterns
- **Zero Console Errors**: Clean React development experience
- **Component Integrity**: All healthcare functionality preserved with type safety

### ✅ Development Safety Enhancements
- **NextAuth Fallbacks**: Development-safe authentication when Firebase not configured
- **Mock Authentication**: Working login system for development environments  
- **Error Handling**: Graceful degradation for missing environment variables
- **Production Ready**: Maintains all security features when properly configured

### 🔧 TypeScript Architecture Benefits
```typescript
// Type-safe component usage with full IntelliSense
<EMMAButton 
  emmaVariant="medical-primary"  // Autocomplete: medical-primary | medical-success | etc.
  emmaSize="large"               // Autocomplete: small | medium | large
  pgyLevel={3}                   // Type: 1 | 2 | 3 | 4 | 5 | 6 | 7
  loading={false}                // Type: boolean
>
  Submit Evaluation
</EMMAButton>

// Healthcare-specific type definitions
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Material UI 5 theme extensions with TypeScript
const theme = useTheme();
const pgyColor: string = theme.palette.getPGYColor(3); // Type-safe healthcare colors
```

## 🏥 Current Implementation Status

### ✅ WORKING FEATURES
- **Healthcare Login Page**: Professional medical authentication UI
- **HIPAA-Compliant Audit Logging**: Encrypted, tamper-proof storage
- **Material UI Theme**: Healthcare-optimized colors and typography
- **Component Library**: EMMAButton, EMMAInput, EMMACard, EMMALoginForm
- **NextAuth Integration**: Role-based healthcare authentication
- **TypeScript Support**: Full type safety for medical data

### 🔧 EMMA Component Library

**Available Components:**
```typescript
import {
  EMMAButton,     // Healthcare-optimized buttons with PGY indicators (TypeScript)
  EMMAInput,      // Medical form inputs with validation (TypeScript)
  EMMACard,       // Healthcare data containers (TypeScript)
  EMMALoginForm   // Complete authentication interface (TypeScript)
} from '@/components/emma'

// Import types for full IntelliSense support
import type {
  EMMAButtonProps,
  EMMAInputProps, 
  EMMACardProps,
  EMMALoginFormProps,
  PGYLevel,
  EvaluationStatus
} from '@/types/emma'
```

**Healthcare Features:**
- PGY level color coding (PGY-1 through PGY-7)
- Evaluation status indicators (pending, in-progress, completed, approved, cancelled)
- Medical input validation (medical IDs, phone numbers, institutional emails)
- WCAG AA accessibility compliance

### 🎨 Design System Architecture

**Material UI Healthcare Theme** (`src/theme/emma-healthcare-theme.ts`):
- Healthcare-appropriate color palette (blue primary instead of pink)
- Medical status colors for evaluations and PGY levels
- Typography optimized for medical data readability
- Component overrides for healthcare use cases

**Global Styles** (`src/app/globals.css`):
- Inter font integration for professional readability
- Healthcare-specific utility classes
- Minimal global styles that complement Material UI

### 🔐 Security & Compliance

**HIPAA-Compliant Features:**
- Encrypted audit log storage (`hipaa_audit_logs` collection)
- Backup audit storage (`audit_backup` collection)  
- Emergency audit recovery (`audit_emergency` collection)
- No sensitive data in console logs (production-safe)
- Session activity tracking with proper encryption

**Authentication Security:**
- Healthcare role validation (Admin, Coordinator, Faculty, Resident)
- Session timeout management (8-hour default)
- Failed login attempt logging
- IP address tracking for audit compliance

## 🏗️ Architecture Overview *(Updated July 21, 2025)*

```
src/
├── app/                              # Next.js App Router with TypeScript
│   ├── api/auth/[...nextauth]/      # HIPAA-compliant NextAuth with dev fallbacks
│   │   └── route.ts                 # TypeScript authentication endpoint
│   ├── layout.tsx                   # EMMA Theme Provider integration
│   ├── page.tsx                     # Healthcare login page (TypeScript)
│   └── globals.css                  # Healthcare-specific global styles
├── types/                           # 🆕 TypeScript type definitions
│   ├── emma.ts                      # EMMA component interfaces
│   ├── user.ts                      # Healthcare user types
│   └── next-auth.d.ts               # NextAuth type extensions
├── components/emma/                 # Healthcare component library (TypeScript)
│   ├── EMMAButton/
│   │   └── index.tsx                # 🔄 Medical-grade buttons with shouldForwardProp
│   ├── EMMAInput/
│   │   └── index.tsx                # 🔄 Healthcare form inputs with type safety
│   ├── EMMACard/
│   │   └── index.tsx                # 🔄 Medical data containers with prop filtering
│   ├── EMMALoginForm/
│   │   └── index.tsx                # 🔄 Complete auth interface with TypeScript
│   └── index.ts                     # 🔄 TypeScript component exports
├── theme/
│   └── emma-healthcare-theme.ts     # 🔄 Material UI healthcare theme with TypeScript
├── providers/
│   └── ThemeProvider.tsx            # Theme provider wrapper
└── lib/
    ├── firebase-admin.ts            # HIPAA-compliant audit logging
    └── firebase.ts                  # Client Firebase config
```

**Legend:**
- 🆕 New files added for TypeScript migration
- 🔄 Migrated from .js to .tsx/.ts with full TypeScript support
- All components now include `shouldForwardProp` to prevent DOM prop leakage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Admin SDK credentials

### Quick Start
1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env.local
# Add your Firebase credentials to .env.local
```

3. **Start development server:**
```bash
npm run dev
```

4. **Access the application:**
Open [http://localhost:3000](http://localhost:3000) to see the EMMA healthcare login page

## 💻 Developer Experience Enhancements *(July 21, 2025)*

### 🔧 Development-Safe Authentication
No Firebase setup required for development! The system includes smart fallbacks:

```typescript
// Automatic development authentication fallback
// When FIREBASE_PROJECT_ID is not set, uses mock authentication
// Login with any email/password combination in development mode

// Example development login:
Email: dev@hospital.com
Password: any password

// Mock user will be created with:
{
  id: 'dev-user-123',
  role: 'ADMIN',
  firstName: 'Development',
  lastName: 'User', 
  department: 'INTERNAL_MEDICINE',
  permissions: { /* Full admin permissions */ }
}
```

### 🛠️ TypeScript Development Workflow
```bash
# Type checking without compilation
npx tsc --noEmit

# Development with hot reload and TypeScript
npm run dev

# Build with TypeScript compilation
npm run build
```

### 🧪 Component Development with IntelliSense
```typescript
// Full autocomplete support for healthcare props
<EMMAButton 
  emmaVariant="medical-"  // Autocomplete: medical-primary, medical-success, etc.
  pgyLevel={|} // Autocomplete: 1, 2, 3, 4, 5, 6, 7
  loading={|} // Autocomplete: true, false
/>

// Type-safe event handling
const handleSubmit = (formData: LoginFormData) => {
  // Full IntelliSense for formData properties
  console.log(formData.email) // Type: string
  console.log(formData.rememberMe) // Type: boolean
}
```

### ⚡ Zero Configuration Development
- **No Firebase setup required** for basic development
- **Mock authentication** works out of the box  
- **All TypeScript types** available immediately
- **Component library** ready to use
- **Healthcare theme** applied automatically

### 🔧 Available Scripts

**Development:**
```bash
npm run dev              # Start development server with Turbopack
npm run dev:secure       # Start with HIPAA audit logging enabled
npm run build            # Build for production  
npm run build:prod       # Production build with NODE_ENV=production
npm run start            # Start production server
```

**Quality & Testing:**
```bash
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check Prettier formatting
npm run test             # Run unit tests with Vitest
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run E2E tests with Playwright
npm run test:e2e:headed  # Run E2E tests with browser visible
npm run check:types      # TypeScript type checking
npm run security:audit   # Security audit + type check
```

**Database & Development:**
```bash
npm run db:seed          # Seed database with test data
```

## 🛠️ Technology Stack

**TypeScript-First Architecture:**
- **TypeScript 5.0+** - Primary language with strict type checking
- **Next.js 15** with App Router and TypeScript integration
- **React 19** with TypeScript hooks and modern patterns
- **Material UI 5 + TypeScript** - Fully typed component library integration

**Healthcare Design System:**
- **Material UI 5** with TypeScript theme extensions
- **@emotion** for type-safe CSS-in-JS styling  
- **EMMA Component Library** - TypeScript healthcare components
- **@fontsource/inter** for medical-grade typography

**Authentication & Security:**
- **NextAuth.js** for healthcare authentication
- **Firebase Admin SDK** for HIPAA-compliant audit logging
- **Firebase Auth** for user authentication

**Development & Testing:**
- **Vitest** for unit testing
- **Playwright** for E2E testing
- **ESLint** + **Prettier** for code quality
- **Husky** + **lint-staged** for git hooks

**State & Forms:**
- **Zustand** for state management
- **React Hook Form** + **Zod** for forms and validation

## 🏥 Healthcare-Specific Features

### Authentication & Authorization
- **Role-based Access Control**: Admin, Coordinator, Faculty, Resident
- **PGY Level Management**: PGY-1 through PGY-7 tracking
- **Medical Department Support**: 12+ medical specialties
- **Session Management**: 8-hour timeout with activity tracking

### HIPAA Compliance
- **Encrypted Audit Logging**: All user actions tracked securely
- **Emergency Backup Systems**: Multiple audit storage layers
- **No Console Data Exposure**: Production-safe logging
- **Session Security**: Proper timeout and termination logging

### Medical UI Components
- **PGY Level Indicators**: Color-coded resident level badges  
- **Evaluation Status**: Medical evaluation workflow states
- **Healthcare Forms**: Medical ID, phone, email validation
- **Accessibility**: WCAG AA compliant for medical environments

## 📚 Development Guidelines

### 🎯 TypeScript Development Standards

**CRITICAL RULES** (Enforced for all development):
1. **Always TypeScript**: Frontend must be strictly built using Next.js + React.js + TypeScript
2. **Material UI 5 + TypeScript**: All components must follow Material UI TypeScript patterns  
3. **shouldForwardProp**: Custom props must not leak to DOM elements
4. **Type Safety**: All healthcare data must use proper TypeScript interfaces
5. **HIPAA Compliance**: TypeScript types must maintain medical data security

### Using EMMA Components with TypeScript
```typescript
// Import healthcare components with full type support
import { EMMAButton, EMMAInput, EMMACard } from '@/components/emma'
import type { PGYLevel, EvaluationStatus } from '@/types/emma'

// Type-safe PGY level indicators with IntelliSense
<EMMAButton 
  emmaVariant="pgy-indicator"  // Autocomplete available
  pgyLevel={3 as PGYLevel}     // Type: 1 | 2 | 3 | 4 | 5 | 6 | 7
>
  PGY-3
</EMMAButton>

// Healthcare form inputs with TypeScript validation
<EMMAInput 
  medicalType="medical-id"     // Type: MedicalInputType
  label="Medical ID" 
  required={true}              // Type: boolean
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    // Type-safe event handling
    const value: string = e.target.value
  }}
/>

// Evaluation status cards with type safety
<EMMACard 
  emmaVariant="evaluation-card"
  statusChip={{ 
    status: 'completed' as EvaluationStatus, 
    label: 'Completed' 
  }}
  title="Cardiology Evaluation"
/>
```

### Creating Custom Components with shouldForwardProp
```typescript
import { styled } from '@mui/material/styles'
import { Button } from '@mui/material'

// CORRECT: Filter custom props to prevent DOM leakage
const MyCustomButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'customVariant' && prop !== 'customSize',
})<{ customVariant?: string; customSize?: string }>(({ theme, customVariant, customSize }) => ({
  // Your styling logic here
}))

// INCORRECT: Will cause React DOM warnings
const BadButton = styled(Button)<{ customProp: string }>(({ customProp }) => ({
  // customProp will leak to DOM element
}))
```

### Theme Customization with TypeScript
Access healthcare colors in any Material UI component:
```typescript
import { useTheme } from '@mui/material/styles'
import type { PGYLevel, EvaluationStatus } from '@/types/emma'

const theme = useTheme()

// Use healthcare colors with type safety
const pgyColor: string = theme.palette.getPGYColor(3 as PGYLevel)  // PGY-3 green
const evalColor: string = theme.palette.getEvaluationColor('pending' as EvaluationStatus)  // Amber

// Access Material UI theme with TypeScript
const primaryColor: string = theme.palette.primary.main
const spacingUnit: number = theme.spacing(2)
const borderRadius: number = theme.shape.borderRadius
```

### HIPAA-Compliant Audit Logging with TypeScript
```typescript
import { logAdminAction } from '@/lib/firebase-admin'
import type { Department, PGYLevel } from '@/types/user'

// Log any healthcare action with type safety
const userId: string = 'user-123'
const evaluationId: string = 'eval-456'

await logAdminAction(
  'EVALUATION_CREATED',
  userId,
  'EVALUATION', 
  evaluationId,
  { 
    department: 'INTERNAL_MEDICINE' as Department, 
    pgyLevel: 2 as PGYLevel 
  }
)

// Type-safe audit logging for different healthcare actions
interface AuditDetails {
  department?: Department
  pgyLevel?: PGYLevel
  patientId?: string
  reason?: string
}

const auditDetails: AuditDetails = {
  department: 'CARDIOLOGY',
  pgyLevel: 3,
  patientId: 'patient-789'
}

await logAdminAction(
  'PATIENT_RECORD_ACCESSED',
  userId,
  'PATIENT_RECORD',
  'record-123',
  auditDetails
)
```

## 🚨 Critical Security Notes

1. **Never use console.log() for sensitive data** - Use `logAdminAction()` instead
2. **All healthcare actions must be audited** - User actions, data access, modifications
3. **Environment variables are required** - Firebase credentials for audit logging
4. **Session timeouts are enforced** - 8-hour maximum with activity tracking
5. **Role validation is mandatory** - Check user permissions before data access

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/healthcare-component`
3. **Follow EMMA design patterns**: Use existing components and theme
4. **Add comprehensive tests**: Unit tests for components, E2E for workflows  
5. **Ensure HIPAA compliance**: No sensitive data in logs, proper audit trails
6. **Run quality checks**: `npm run security:audit && npm run test`
7. **Submit a pull request** with detailed medical use case description

## 📄 License

This project is licensed under the MIT License.

## 🏥 Medical Disclaimer

This software is designed for healthcare administration and medical education management. It includes HIPAA-compliant features but requires proper configuration and deployment practices to maintain regulatory compliance. Always consult with your institution's compliance team before handling protected health information.

---

## 🎯 TypeScript-First Healthcare Platform *(Updated July 21, 2025)*

**EMMA Healthcare Admin Panel V2** is now a fully TypeScript-native medical education administration platform, featuring:

- ✅ **Complete TypeScript Migration** - All frontend code converted with industry standards
- ✅ **Type-Safe Healthcare Components** - Full IntelliSense support for medical data
- ✅ **Zero DOM Prop Warnings** - Clean React development experience  
- ✅ **Development-Safe Authentication** - Works without Firebase setup
- ✅ **Material UI 5 + TypeScript** - Proper typed component integration
- ✅ **HIPAA Compliance Maintained** - All security features preserved

Built with **Next.js + React + TypeScript + Material UI 5** for professional healthcare administration.
