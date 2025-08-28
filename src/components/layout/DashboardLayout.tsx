/**
 * EMMA Healthcare Dashboard Layout
 * 
 * Main dashboard layout component that combines the sidebar navigation
 * with a dynamic content area. Built with Material UI and EMMA design system.
 */

'use client'

import React, { useState } from 'react'
import { Box, AppBar, Toolbar, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material'
import { Menu as MenuIcon, Notifications as NotificationsIcon } from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import DashboardSidebar from './DashboardSidebar'
import { styled } from '@mui/material/styles'

const SIDEBAR_WIDTH = 280

// Main content area with responsive spacing
const MainContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'sidebarOpen',
})<{ sidebarOpen?: boolean }>(({ theme, sidebarOpen }) => ({
  flexGrow: 1,
  marginLeft: sidebarOpen ? SIDEBAR_WIDTH : 0,
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  transition: theme.transitions.create(['margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
  },
}))

// Enhanced AppBar for mobile/tablet views
const DashboardAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'sidebarOpen',
})<{ sidebarOpen?: boolean }>(({ theme, sidebarOpen }) => ({
  backgroundColor: '#ffffff',
  color: theme.palette.primary.main,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  [theme.breakpoints.up('md')]: {
    display: 'none', // Hide AppBar on desktop since we have permanent sidebar
  },
}))

interface DashboardLayoutProps {
  children: React.ReactNode
  currentSection?: string
  onSectionChange?: (sectionId: string) => void
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentSection = 'dashboard',
  onSectionChange,
}) => {
  const { data: session } = useSession()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Handle navigation from sidebar
  const handleNavigation = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId)
    }
    // Close mobile menu when navigating
    if (isMobile) {
      setMobileMenuOpen(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile AppBar */}
      <DashboardAppBar position="fixed" sidebarOpen={!isMobile}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleMobileMenuToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            EMMA Healthcare Dashboard
          </Typography>
          
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
        </Toolbar>
      </DashboardAppBar>

      {/* Desktop Sidebar (Permanent) */}
      {!isMobile && (
        <DashboardSidebar onNavigate={handleNavigation} />
      )}

      {/* Mobile Sidebar (Temporary) */}
      {isMobile && (
        <Box>
          {/* Backdrop */}
          {mobileMenuOpen && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: theme.zIndex.drawer,
              }}
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
          
          {/* Mobile Drawer */}
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: mobileMenuOpen ? 0 : -SIDEBAR_WIDTH,
              width: SIDEBAR_WIDTH,
              height: '100vh',
              zIndex: theme.zIndex.drawer + 1,
              transition: theme.transitions.create(['left'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }}
          >
            <DashboardSidebar onNavigate={handleNavigation} />
          </Box>
        </Box>
      )}

      {/* Main Content Area */}
      <MainContent sidebarOpen={!isMobile}>
        {/* Mobile toolbar spacer */}
        {isMobile && <Toolbar />}
        
        {/* Content Container */}
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Content Header - Shows current section */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                mb: 1,
              }}
            >
              {getSectionTitle(currentSection)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {getSectionDescription(currentSection)}
            </Typography>
          </Box>

          {/* Dynamic Content Area */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: '0 2px 15px rgba(0, 0, 0, 0.08)',
              minHeight: 400,
              p: 0, // Let child components handle their own padding
            }}
          >
            {children}
          </Box>
        </Box>
      </MainContent>
    </Box>
  )
}

// Helper functions for section metadata
function getSectionTitle(sectionId: string): string {
  const titles = {
    dashboard: 'Dashboard Overview',
    'manage-residents': 'Manage Residents',
    'class-analytics': 'Class Analytics',
    'schedule-matching': 'Schedule Matching',
  }
  return titles[sectionId as keyof typeof titles] || 'Dashboard'
}

function getSectionDescription(sectionId: string): string {
  const descriptions = {
    dashboard: 'Overview of key metrics and recent activities',
    'manage-residents': 'Manage resident profiles, evaluations, and academic progress',
    'class-analytics': 'Analyze class performance, trends, and insights',
    'schedule-matching': 'Manage clinical rotation schedules and assignments',
  }
  return descriptions[sectionId as keyof typeof descriptions] || 'Healthcare administration dashboard'
}

export default DashboardLayout