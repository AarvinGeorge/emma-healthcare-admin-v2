# EMMA Healthcare Admin Panel V2

A TypeScript-first healthcare administration platform built with Material UI 5 and React Query, featuring a comprehensive dashboard system, medical-grade design systems, HIPAA-compliant authentication, resident management, analytics, scheduling, and type-safe component architecture for medical education and residency management.

## 📑 Table of Contents
- [Quick Start Guide](#-quick-start-guide)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Firebase Setup](#-firebase-setup)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Development Workflow](#-development-workflow)
- [Troubleshooting](#-troubleshooting)
- [Latest Updates](#-latest-updates)
- [Technology Stack](#-technology-stack)
- [Contributing](#-contributing)

---

## 🚀 Quick Start Guide

Follow these steps to get the EMMA Healthcare Admin Panel running on your local machine:

### Step 1: Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd emma-admin-v2

# Install dependencies
npm install
```

### Step 2: Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Firebase credentials
# See Environment Configuration section for details
```

### Step 3: Start Development
```bash
# Start the development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Step 4: Test Login
Use these test credentials to verify setup:
- **Email**: `fixtest@cmu.edu`
- **Password**: `FixTest@1234`

---

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

### Required Software
- **Node.js**: Version 18.17.0 or higher
  ```bash
  # Check your Node.js version
  node --version
  
  # Install Node.js via nvm (recommended)
  nvm install 18.17.0
  nvm use 18.17.0
  ```

- **npm**: Version 9.0.0 or higher (comes with Node.js)
  ```bash
  # Check npm version
  npm --version
  
  # Update npm if needed
  npm install -g npm@latest
  ```

- **Git**: Latest version
  ```bash
  # Check Git version
  git --version
  ```

### Optional but Recommended
- **Firebase CLI**: For managing Firebase services
  ```bash
  # Install Firebase CLI globally
  npm install -g firebase-tools
  
  # Login to Firebase
  firebase login
  ```

- **Visual Studio Code**: With these extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Material Icon Theme

### System Requirements
- **OS**: macOS, Windows 10/11, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 8GB (16GB recommended for development)
- **Storage**: At least 2GB free space

---

## 📦 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd emma-admin-v2
```

### 2. Install Dependencies
```bash
# Using npm (recommended)
npm install

# Or using yarn
yarn install
```

### 3. Verify Installation
```bash
# Check if all dependencies are installed
npm list --depth=0

# Run type checking to verify TypeScript setup
npm run check:types
```

---

## 🔥 Firebase Setup

This project requires a Firebase project with specific services enabled. Follow these steps to set up Firebase:

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "emma-healthcare-admin")
4. Disable Google Analytics (optional for development)
5. Click "Create project"

### Step 2: Enable Required Services

#### Authentication
1. In Firebase Console, go to **Authentication** → **Get started**
2. Enable the following sign-in methods:
   - **Email/Password**: Toggle on and save
   - **Google** (optional): Configure with your OAuth consent screen
3. Go to **Authentication** → **Settings** → **User actions**
4. Enable "Email enumeration protection" for security

#### Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose "Start in production mode" for security
3. Select your preferred location (e.g., us-central1)
4. Click "Enable"

#### Storage (Optional for file uploads)
1. Go to **Storage** → **Get started**
2. Start in production mode
3. Choose the same location as Firestore
4. Click "Done"

### Step 3: Generate Firebase Configuration

#### Client Configuration (for frontend)
1. Go to **Project settings** → **General**
2. Scroll to "Your apps" → Click "Web" icon (</\>)
3. Register app with a nickname (e.g., "EMMA Admin Panel")
4. Copy the Firebase configuration object:
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

#### Admin SDK Configuration (for backend)
1. Go to **Project settings** → **Service accounts**
2. Click "Generate new private key"
3. Save the downloaded JSON file securely
4. Extract these values from the JSON:
   - `project_id` → FIREBASE_PROJECT_ID
   - `client_email` → FIREBASE_CLIENT_EMAIL
   - `private_key` → FIREBASE_PRIVATE_KEY

### Step 4: Deploy Security Rules

Create a file `firestore.rules` in your project root:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only admin SDK can write
    }
    
    // Protect audit logs
    match /hipaa_audit_logs/{document=**} {
      allow read: if false;
      allow write: if false; // Only admin SDK
    }
    
    // Add more rules as needed
  }
}
```

Deploy the rules:
```bash
firebase deploy --only firestore:rules
```

---

## ⚙️ Environment Configuration

### Step 1: Create Environment File
```bash
# Copy the template
cp .env.example .env.local
```

### Step 2: Configure Required Variables

Edit `.env.local` with your actual values:

#### Firebase Client Configuration (Public)
```bash
# These are safe for client-side and can be exposed
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key-from-firebase-config"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

#### Firebase Admin Configuration (Private - NEVER expose)
```bash
# Extract these from the service account JSON
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"

# For the private key, preserve the \n characters
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
```

#### NextAuth Configuration
```bash
# Generate a secure secret (32+ characters)
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Set your application URL
NEXTAUTH_URL="http://localhost:3000"  # Development
# NEXTAUTH_URL="https://your-domain.com"  # Production
```

#### Application Settings
```bash
# Development Settings
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email Verification (set to false for easier development)
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="false"

# HIPAA Compliance
NEXT_PUBLIC_ENABLE_HIPAA_AUDIT="true"
```

### Step 3: Validate Configuration
```bash
# Check if environment variables are loaded
npm run dev

# Look for any Firebase initialization errors in the console
```

---

## 🗄️ Database Setup

### Initial Database Structure

The application will automatically create collections as needed, but you can set up initial structure:

### Step 1: Initialize Collections

Run the database initialization script:
```bash
npm run db:seed
```

This will create:
- `users` collection with test users
- `institutions` collection with sample institutions
- `system_settings` with default configuration
- Required indexes for performance

### Step 2: Create Admin User (Manual)

If the seed script doesn't work, manually create an admin user:

1. Register a new user through the UI
2. Go to Firebase Console → Firestore
3. Find the user document in the `users` collection
4. Update the following fields:
```json
{
  "role": "ADMIN",
  "status": "ACTIVE",
  "isActive": true,
  "emailVerified": true,
  "permissions": {
    "canViewAllUsers": true,
    "canCreateUsers": true,
    "canEditUsers": true,
    "canDeleteUsers": true,
    "canManageSystem": true
  }
}
```

### Step 3: Verify Database Setup
```bash
# Check collections in Firebase Console
# Firestore Database → Data tab

# Required collections:
- users
- institutions
- hipaa_audit_logs
- audit_backup
- audit_emergency
```

---

## ▶️ Running the Application

### Development Mode
```bash
# Start with hot reload and Turbopack
npm run dev

# Start with HIPAA audit logging enabled
npm run dev:secure

# Access the application
# Open: http://localhost:3000
```

### Production Build
```bash
# Create optimized production build
npm run build

# Start production server
npm run start

# Or build and start
npm run build && npm run start
```

### Using Different Ports
```bash
# If port 3000 is in use
PORT=3001 npm run dev

# Kill processes on blocked ports
npm run kill
```

### Verify Setup
After starting the application:
1. Navigate to http://localhost:3000
2. You should see the EMMA login page
3. Try logging in with test credentials
4. Check browser console for any errors

---

## 🧪 Testing

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

### End-to-End Tests
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/auth.spec.ts
```

### Type Checking
```bash
# Check TypeScript types
npm run check:types

# Check types and run security audit
npm run security:audit
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Check code formatting
npm run format:check

# Auto-fix formatting issues
npm run format
```

### Testing with Firebase Emulators
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Start Firebase emulators
firebase emulators:start

# In another terminal, run the app with emulator config
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true npm run dev
```

---

## 🛠️ Troubleshooting

### Common Setup Issues

#### Issue: "Module not found" errors
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

#### Issue: "Firebase app not initialized"
**Cause:** Missing or incorrect Firebase configuration
**Solution:**
1. Verify all Firebase environment variables are set in `.env.local`
2. Check that Firebase project ID matches in both client and admin configs
3. Ensure private key formatting is preserved with `\n` characters

#### Issue: "Port 3000 is already in use"
**Solution:**
```bash
# Option 1: Kill the process
npm run kill

# Option 2: Use a different port
PORT=3001 npm run dev

# Option 3: Find and kill specific process
lsof -i:3000
kill -9 <PID>
```

#### Issue: "User profile not found in Firestore" during login
**Cause:** User document ID mismatch
**Solution:**
- Register a new user (existing users from before the fix won't work)
- Or manually update the document ID in Firestore to match Firebase Auth UID

#### Issue: "Account is inactive or suspended"
**Cause:** Email verification required but not completed
**Solution:**
```bash
# For development, disable email verification
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="false"

# Or verify email through Firebase Console
# Authentication → Users → Edit user → Mark as verified
```

#### Issue: TypeScript errors in IDE
**Solution:**
```bash
# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Or manually check types
npm run check:types
```

#### Issue: "Cannot find module '@/components/...'"
**Cause:** Path alias configuration issue
**Solution:**
1. Verify `tsconfig.json` has correct path mappings
2. Restart your IDE
3. Clear TypeScript cache

#### Issue: Build fails with memory errors
**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### Issue: Firebase Admin SDK authentication fails
**Cause:** Incorrect service account credentials
**Solution:**
1. Regenerate service account key from Firebase Console
2. Ensure `FIREBASE_PRIVATE_KEY` preserves all `\n` characters
3. Verify `FIREBASE_CLIENT_EMAIL` matches the service account

#### Issue: CORS errors when accessing Firebase
**Solution:**
1. Check `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is correct
2. Add your domain to Firebase Authentication authorized domains
3. Ensure Firebase project settings allow your localhost

### Performance Issues

#### Slow initial page load
- Enable Turbopack: `npm run dev` (already configured)
- Check for large bundle sizes: `npm run build` and review output
- Implement code splitting for large components

#### High memory usage during development
```bash
# Clear Next.js cache
rm -rf .next

# Limit concurrent builds
npm run dev -- --experimental-worker-threads=2
```

### Database Issues

#### Firestore permission denied
1. Check Firebase Authentication status
2. Review Firestore security rules
3. Ensure user role has required permissions
4. Use Firebase Admin SDK for server-side operations

#### Missing collections or data
```bash
# Run database seed script
npm run db:seed

# Or manually create collections in Firebase Console
```

### Getting Help

If you encounter issues not covered here:

1. Check the browser console for detailed error messages
2. Review server logs in the terminal
3. Search existing issues in the project repository
4. Check Firebase Console for service status
5. Review the `ARCHITECTURE-2025-08-09.md` file for system details

---

## 📁 Project Structure

Understanding the project structure helps you navigate and contribute effectively:

```
emma-admin-v2/
├── src/                          # Source code directory
│   ├── app/                      # Next.js App Router pages and API routes
│   │   ├── api/                  # Backend API endpoints
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   │   ├── [...nextauth]/ # NextAuth configuration
│   │   │   │   └── register/    # User registration
│   │   │   └── residents/       # Resident management APIs
│   │   ├── auth/                # Authentication pages
│   │   │   └── action/          # Email verification handler
│   │   ├── dashboard/           # Main dashboard page
│   │   ├── layout.tsx           # Root layout with providers
│   │   ├── page.tsx             # Home/login page
│   │   └── globals.css          # Global styles
│   │
│   ├── components/              # React components
│   │   ├── emma/               # EMMA design system components
│   │   │   ├── EMMAButton/     # Healthcare button component
│   │   │   ├── EMMACard/       # Medical data card
│   │   │   ├── EMMAInput/      # Healthcare form input
│   │   │   ├── EMMALoginForm/  # Login interface
│   │   │   └── EMMARegistrationForm/ # Registration flow
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── forms/              # Reusable form components
│   │   ├── layout/             # Layout components
│   │   └── modals/             # Modal dialogs
│   │
│   ├── lib/                    # Utility libraries and services
│   │   ├── firebase.ts         # Firebase client configuration
│   │   ├── firebase-admin.ts  # Firebase Admin SDK setup
│   │   ├── database.ts         # Database service layer
│   │   └── database-init.ts   # Database initialization
│   │
│   ├── providers/              # React context providers
│   │   ├── ThemeProvider.tsx  # Material UI theme provider
│   │   └── ReactQueryProvider.tsx # React Query setup
│   │
│   ├── theme/                  # Theme configuration
│   │   └── emma-healthcare-theme.ts # Healthcare-specific theme
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── emma.ts            # Component type definitions
│   │   ├── user.ts            # User and auth types
│   │   ├── database.ts        # Database schema types
│   │   └── next-auth.d.ts     # NextAuth type extensions
│   │
│   └── hooks/                  # Custom React hooks
│       └── (custom hooks)
│
├── public/                     # Static assets
│   ├── images/                # Image files
│   └── icons/                 # Icon files
│
├── scripts/                    # Utility scripts
│   ├── kill-servers.sh        # Port cleanup script
│   └── seed-database.js      # Database seeding script
│
├── tests/                      # Test files
│   ├── unit/                  # Unit tests
│   └── e2e/                   # End-to-end tests
│
├── Configuration Files
│   ├── .env.example           # Environment template
│   ├── .env.local             # Local environment (not in git)
│   ├── .eslintrc.json         # ESLint configuration
│   ├── .gitignore             # Git ignore rules
│   ├── .prettierrc            # Prettier configuration
│   ├── next.config.mjs        # Next.js configuration
│   ├── package.json           # Dependencies and scripts
│   ├── tsconfig.json          # TypeScript configuration
│   ├── vitest.config.ts       # Vitest test configuration
│   └── playwright.config.ts   # Playwright E2E configuration
│
└── Documentation
    ├── README.md              # This file
    ├── CLAUDE.md             # Development standards
    ├── CLAUDE.local.md       # Local dev instructions
    └── ARCHITECTURE-2025-08-09.md # System architecture

```

### Key Directories Explained

#### `/src/app`
Next.js App Router directory containing all pages and API routes. Each folder represents a route segment.

#### `/src/components/emma`
Healthcare-specific component library with Material UI integration. All components are TypeScript-first with proper prop filtering.

#### `/src/lib`
Core services and utilities:
- `firebase.ts`: Client-side Firebase SDK initialization
- `firebase-admin.ts`: Server-side Admin SDK with HIPAA logging
- `database.ts`: Database abstraction layer with UserService

#### `/src/types`
TypeScript definitions for type safety across the application:
- Healthcare-specific types (PGY levels, departments, roles)
- Component prop interfaces
- Database schema types

---

## 🔄 Development Workflow

### Starting a New Feature

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Review existing patterns**
- Check similar components in `/src/components`
- Review type definitions in `/src/types`
- Follow established Material UI patterns

3. **Implement with TypeScript**
```typescript
// Always use TypeScript for new files
// Example: src/components/YourComponent.tsx
import { FC } from 'react'
import { Box, Typography } from '@mui/material'

interface YourComponentProps {
  title: string
  // Add proper TypeScript interfaces
}

export const YourComponent: FC<YourComponentProps> = ({ title }) => {
  return (
    <Box>
      <Typography>{title}</Typography>
    </Box>
  )
}
```

4. **Test your changes**
```bash
# Type checking
npm run check:types

# Run tests
npm run test

# Check formatting
npm run format:check
```

5. **Commit with conventional commits**
```bash
git add .
git commit -m "feat: add new healthcare component"
# Use: feat, fix, docs, style, refactor, test, chore
```

### Adding a New API Endpoint

1. Create the route file in `/src/app/api/your-endpoint/route.ts`
2. Implement with proper error handling:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, logAdminAction } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    
    // Log for HIPAA compliance
    await logAdminAction('ACTION_NAME', userId, 'RESOURCE_TYPE', resourceId)
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Working with the Database

1. **Define types** in `/src/types/database.ts`
2. **Create service methods** in `/src/lib/database.ts`
3. **Use React Query** for data fetching:
```typescript
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['residents'],
  queryFn: fetchResidents,
})
```

### Style Guidelines

1. **Use Material UI components** - Don't add custom CSS unless necessary
2. **Follow the EMMA theme** - Use theme colors and spacing
3. **Maintain consistency** - Match existing component patterns
4. **Accessibility first** - Ensure WCAG AA compliance

### Pre-commit Checklist

Before committing your changes:

- [ ] TypeScript compiles without errors: `npm run check:types`
- [ ] ESLint passes: `npm run lint`
- [ ] Tests pass: `npm run test`
- [ ] Code is formatted: `npm run format`
- [ ] No sensitive data in code or logs
- [ ] HIPAA compliance maintained
- [ ] Documentation updated if needed

### Debugging Tips

1. **Enable debug mode**
```bash
DEBUG=* npm run dev
```

2. **Check React Query DevTools**
- DevTools are included in development
- Press the React Query logo in bottom corner

3. **Firebase Emulator for testing**
```bash
firebase emulators:start
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true npm run dev
```

4. **Browser DevTools**
- Check Network tab for API calls
- Console for errors and warnings
- React DevTools for component state

---

## 🚨 Latest Updates

### August 27, 2025: Complete Healthcare Dashboard Implementation ✅
- **Dashboard System**: Multi-section healthcare administration interface
- **Resident Management**: Full CRUD operations with advanced forms
- **Class Analytics**: Performance tracking and reporting
- **Schedule Matching**: Intelligent rotation scheduling
- **Real-time Data**: React Query integration with optimized caching

### August 8, 2025: Authentication System Complete ✅
- **Email Verification Toggle**: Configurable with `NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION`
- **Document ID Bug Fixed**: Resolved Firestore/Firebase Auth UID mismatch
- **Complete Auth Flow**: Registration → Login → Dashboard working end-to-end
- **Test Users Available**: Ready-to-use credentials for immediate testing

### July 21, 2025: TypeScript Migration Complete ✅
- **Full TypeScript Conversion**: All frontend components migrated
- **Type Safety**: Healthcare-specific interfaces and validation
- **Zero DOM Warnings**: Fixed prop leakage with `shouldForwardProp`
- **Development Safety**: Mock authentication for easier development


## 🛠️ Technology Stack

### Frontend
- **Next.js 15.4.1** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5+** - Type-safe development
- **Material UI 5.12.3** - Component library
- **Emotion 11** - CSS-in-JS styling
- **React Query 5.83.0** - Server state management
- **React Hook Form 7.60.0** - Form handling
- **Zod 4.0.5** - Schema validation

### Backend & Infrastructure
- **Firebase Authentication** - User authentication
- **Firestore** - NoSQL database
- **Firebase Admin SDK** - Server-side operations
- **NextAuth.js 4.24.11** - Authentication middleware
- **Firebase Storage** - File storage

### Development Tools
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **ESLint & Prettier** - Code quality
- **Husky & lint-staged** - Git hooks


### 🔧 EMMA Component Library

**Available Components:**
```typescript
import {
  EMMAButton,           // Healthcare-optimized buttons with PGY indicators (TypeScript)
  EMMAInput,            // Medical form inputs with validation (TypeScript)
  EMMACard,             // Healthcare data containers (TypeScript)
  EMMALoginForm,        // Complete authentication interface (TypeScript)
  EMMARegistrationForm  // Multi-step professional registration (TypeScript)
} from '@/components/emma'

// Dashboard Components
import {
  DashboardOverview,    // Real-time metrics and activity feed
  ManageResidents,      // Resident CRUD operations interface
  ClassAnalytics,       // Performance analytics dashboard
  ScheduleMatching      // Rotation scheduling system
} from '@/components/dashboard'

// Import types for full IntelliSense support
import type {
  EMMAButtonProps,
  EMMAInputProps, 
  EMMACardProps,
  EMMALoginFormProps,
  EMMARegistrationFormProps,
  PGYLevel,
  EvaluationStatus,
  UserRole,
  Department
} from '@/types/emma'
```

**Healthcare Features:**
- PGY level color coding (PGY-1 through PGY-7)
- Evaluation status indicators (pending, in-progress, completed, approved, cancelled)
- Medical input validation (medical IDs, phone numbers, institutional emails)
- WCAG AA accessibility compliance
- Multi-step registration with role-based validation
- Dashboard navigation with section-based routing

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

## 🏗️ Architecture Overview *(Updated August 27, 2025)*

```
src/
├── app/                              # Next.js App Router with TypeScript
│   ├── api/
│   │   ├── auth/[...nextauth]/      # HIPAA-compliant NextAuth with dev fallbacks
│   │   │   └── route.ts             # TypeScript authentication endpoint
│   │   ├── auth/register/           # Enhanced registration API
│   │   │   └── route.ts             # Multi-step registration endpoint
│   │   └── residents/               # 🆕 Resident management API
│   │       └── route.ts             # CRUD operations for residents
│   ├── auth/action/                 # 🆕 Email verification handler
│   │   └── page.tsx                 # Firebase email action processing
│   ├── dashboard/                   # 🆕 Complete dashboard interface
│   │   └── page.tsx                 # Multi-section dashboard with navigation
│   ├── layout.tsx                   # EMMA Theme Provider integration
│   ├── page.tsx                     # Healthcare login/registration page
│   └── globals.css                  # Healthcare-specific global styles
├── types/                           # TypeScript type definitions
│   ├── emma.ts                      # EMMA component interfaces
│   ├── user.ts                      # Healthcare user types
│   ├── database.ts                  # 🆕 Database schema types
│   └── next-auth.d.ts               # NextAuth type extensions
├── components/
│   ├── emma/                        # Healthcare component library (TypeScript)
│   │   ├── EMMAButton/
│   │   ├── EMMAInput/
│   │   ├── EMMACard/
│   │   ├── EMMALoginForm/
│   │   ├── EMMARegistrationForm/    # 🆕 Multi-step registration component
│   │   └── index.ts
│   ├── dashboard/                   # 🆕 Dashboard components
│   │   ├── DashboardOverview.tsx   # Metrics and activity feed
│   │   ├── ManageResidents.tsx     # Resident CRUD interface
│   │   ├── ClassAnalytics.tsx      # Performance analytics
│   │   ├── ScheduleMatching.tsx    # Rotation scheduling
│   │   └── index.ts
│   ├── forms/                       # 🆕 Healthcare forms
│   │   └── AddResidentForm.tsx     # Resident creation form
│   ├── layout/                      # 🆕 Layout components
│   │   ├── DashboardLayout.tsx     # Main dashboard wrapper
│   │   ├── DashboardSidebar.tsx    # Navigation sidebar
│   │   └── index.ts
│   └── modals/                      # 🆕 Modal components
│       └── AddResidentModal.tsx    # Resident addition modal
├── theme/
│   └── emma-healthcare-theme.ts     # Material UI healthcare theme with TypeScript
├── providers/
│   ├── ThemeProvider.tsx            # Theme provider wrapper
│   └── ReactQueryProvider.tsx       # 🆕 React Query configuration
├── hooks/                           # 🆕 Custom React hooks
│   └── (healthcare hooks)
└── lib/
    ├── firebase-admin.ts            # HIPAA-compliant audit logging
    ├── firebase.ts                  # Client Firebase config
    ├── database.ts                  # 🔄 Enhanced database service with TypeScript
    └── database-init.ts             # 🆕 Database initialization utilities
```

**Legend:**
- 🆕 New files added for dashboard implementation
- 🔄 Enhanced existing files with new functionality
- All components include TypeScript support and proper prop handling

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

**Data Management:**
- **React Query (TanStack Query)** - Healthcare-optimized data fetching and caching
- **Firestore** - Real-time NoSQL database for healthcare data
- **Firebase Storage** - Document and file management

**Authentication & Security:**
- **NextAuth.js** for healthcare authentication
- **Firebase Admin SDK** for HIPAA-compliant audit logging
- **Firebase Auth** for user authentication with email verification

**Development & Testing:**
- **Vitest** for unit testing
- **Playwright** for E2E testing
- **ESLint** + **Prettier** for code quality
- **Husky** + **lint-staged** for git hooks
- **React Query DevTools** - Data fetching debugging

**State & Forms:**
- **Zustand** for state management
- **React Hook Form** + **Zod** for forms and validation
- **Multi-step forms** for complex registration flows

## 🏥 Healthcare-Specific Features

### Authentication & Authorization
- **Role-based Access Control**: Admin, Coordinator, Faculty, Resident
- **PGY Level Management**: PGY-1 through PGY-7 tracking
- **Medical Department Support**: 12+ medical specialties
- **Session Management**: 8-hour timeout with activity tracking
- **Multi-step Registration**: Professional validation with role-specific requirements
- **Email Verification**: Configurable verification flow with action handler

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
- **Dashboard Widgets**: Real-time metrics, activity feeds, analytics charts
- **Resident Management**: Complete CRUD interface with modals and forms
- **Schedule Management**: Interactive rotation planning and matching

### API Endpoints
- **`/api/auth/register`**: Enhanced multi-step registration with professional validation
- **`/api/auth/[...nextauth]`**: NextAuth authentication with healthcare roles
- **`/api/residents`**: Full CRUD operations for resident management
  - GET: Fetch residents with filtering and pagination
  - POST: Create new resident with validation
  - PUT: Update resident information
  - DELETE: Soft delete with audit logging

### Data Management with React Query
```typescript
// Healthcare-optimized query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // 1 minute for fresh medical data
      gcTime: 300 * 1000,           // 5 minute cache
      refetchOnWindowFocus: true,   // Real-time updates
      retry: 2,                     // Retry for critical data
    },
  },
})

// Example: Fetching resident data
const { data: residents, isLoading, error } = useQuery({
  queryKey: ['residents', filters],
  queryFn: () => fetchResidents(filters),
})
```

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

---

## 🤝 Contributing

We welcome contributions to improve the EMMA Healthcare Admin Panel! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Follow existing patterns**: Use EMMA design system and TypeScript
4. **Write tests**: Add unit and E2E tests for new features
5. **Ensure HIPAA compliance**: No sensitive data in logs
6. **Run quality checks**: `npm run security:audit && npm run test`
7. **Submit a pull request** with detailed description

### Contribution Checklist
- [ ] Code follows TypeScript and Material UI patterns
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log() with sensitive data
- [ ] HIPAA compliance maintained
- [ ] ESLint and Prettier checks pass

---

## 📚 Additional Resources

- **Architecture Documentation**: See `ARCHITECTURE-2025-08-09.md` for detailed system design
- **Development Standards**: Review `CLAUDE.md` for coding guidelines
- **Firebase Documentation**: [Firebase Docs](https://firebase.google.com/docs)
- **Material UI Documentation**: [Material UI Docs](https://mui.com/)
- **Next.js Documentation**: [Next.js Docs](https://nextjs.org/docs)

---

## 🔒 Security

### Reporting Security Issues
Please report security vulnerabilities privately through the repository's security tab or contact the maintainers directly. Do not create public issues for security problems.

### Security Best Practices
- Never commit `.env.local` or any files with credentials
- Use Firebase Admin SDK only on server-side
- Always validate and sanitize user input
- Follow HIPAA guidelines for healthcare data
- Regular security audits with `npm audit`

---

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## 🏥 Medical Disclaimer

This software is designed for healthcare administration and medical education management. It includes HIPAA-compliant features but requires proper configuration and deployment practices to maintain regulatory compliance. Always consult with your institution's compliance team before handling protected health information (PHI).

---

## 👥 Support

For help and support:
- Check the [Troubleshooting](#-troubleshooting) section
- Review existing GitHub issues
- Create a new issue with detailed information
- Contact the development team

---

**Built with ❤️ for Healthcare Education**

*EMMA Healthcare Admin Panel V2 - Empowering Medical Education Management*
