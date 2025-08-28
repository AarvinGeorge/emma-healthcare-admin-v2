/**
 * EMMA Healthcare Dashboard
 * 
 * Enhanced dashboard page with navigation sidebar and dynamic content areas
 * for comprehensive healthcare administration and resident management.
 */

'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Box, Typography, Alert, CircularProgress } from '@mui/material'
import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import ManageResidents from '@/components/dashboard/ManageResidents'
import ClassAnalytics from '@/components/dashboard/ClassAnalytics'
import ScheduleMatching from '@/components/dashboard/ScheduleMatching'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [currentSection, setCurrentSection] = useState('dashboard')

  if (status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={40} />
        <Typography sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </Box>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Alert severity="error">
          Please sign in to access the dashboard.
        </Alert>
      </Box>
    )
  }

  // Handle section navigation
  const handleSectionChange = (sectionId: string) => {
    setCurrentSection(sectionId)
  }

  // Render the appropriate component based on current section
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <DashboardOverview />
      case 'manage-residents':
        return <ManageResidents />
      case 'class-analytics':
        return <ClassAnalytics />
      case 'schedule-matching':
        return <ScheduleMatching />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <DashboardLayout 
      currentSection={currentSection}
      onSectionChange={handleSectionChange}
    >
      {renderCurrentSection()}
    </DashboardLayout>
  )
}