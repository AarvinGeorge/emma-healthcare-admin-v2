/**
 * EMMA Healthcare Dashboard Sidebar
 * 
 * Enhanced navigation sidebar built on Material Dashboard React components
 * with healthcare-specific navigation items and EMMA design system integration.
 */

'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  Chip,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Schedule as ScheduleIcon,
  LocalHospital as HospitalIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material'
import { useSession, signOut } from 'next-auth/react'
import { styled } from '@mui/material/styles'

const SIDEBAR_WIDTH = 280

// Enhanced sidebar with EMMA healthcare styling
const EMMADrawer = styled(Drawer)(({ theme }) => ({
  width: SIDEBAR_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: SIDEBAR_WIDTH,
    boxSizing: 'border-box',
    background: `linear-gradient(195deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: '#ffffff',
    borderRadius: 0,
    border: 'none',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
  },
}))

// Healthcare navigation items
const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard Overview',
    icon: <DashboardIcon />,
    href: '/dashboard',
    description: 'Main dashboard with key metrics',
  },
  {
    id: 'manage-residents',
    label: 'Manage Residents',
    icon: <PeopleIcon />,
    href: '/dashboard/residents',
    description: 'Resident profiles and management',
  },
  {
    id: 'class-analytics',
    label: 'Class Analytics',
    icon: <AnalyticsIcon />,
    href: '/dashboard/analytics',
    description: 'Performance analytics and insights',
  },
  {
    id: 'schedule-matching',
    label: 'Schedule Matching',
    icon: <ScheduleIcon />,
    href: '/dashboard/schedules',
    description: 'Clinical rotation scheduling',
  },
]

interface DashboardSidebarProps {
  onNavigate?: (sectionId: string) => void
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ onNavigate }) => {
  const { data: session } = useSession()
  const pathname = usePathname()

  const handleNavigation = (itemId: string, href: string) => {
    if (onNavigate) {
      onNavigate(itemId)
    }
    // For now, we'll use the callback. Later we can implement routing.
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Get user's PGY level for badge display
  const pgyLevel = session?.user?.pgyLevel
  const userRole = session?.user?.role
  const userName = session?.user?.displayName || `${session?.user?.firstName} ${session?.user?.lastName}`

  return (
    <EMMADrawer variant="permanent" anchor="left">
      {/* Header Section */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <HospitalIcon sx={{ fontSize: 32, mr: 1, color: '#ffffff' }} />
          <Typography variant="h6" component="div" fontWeight="bold" color="#ffffff">
            EMMA Healthcare
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
          Medical Education Admin
        </Typography>
      </Box>

      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', mx: 2 }} />

      {/* User Profile Section */}
      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              mr: 2,
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}
          >
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight="medium" noWrap sx={{ color: '#ffffff' }}>
              {userName}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
              <Chip
                label={userRole}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
              {pgyLevel && (
                <Chip
                  label={`PGY-${pgyLevel}`}
                  size="small"
                  sx={{
                    bgcolor: `var(--emma-pgy-${pgyLevel})`,
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', mx: 2, mb: 2 }} />

      {/* Navigation Section */}
      <Box sx={{ px: 2, flexGrow: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            px: 2,
            py: 1,
            display: 'block',
          }}
        >
          Navigation
        </Typography>

        <List sx={{ pt: 0 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.id, item.href)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateX(4px)',
                    transition: 'all 0.3s ease',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  },
                }}
                selected={pathname === item.href}
              >
                <ListItemIcon
                  sx={{
                    color: '#ffffff',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.description}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    color: '#ffffff',
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    mt: 0.5,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer Section */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
        
        <List>
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                borderRadius: 2,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#ffffff', minWidth: 40 }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  color: '#ffffff',
                }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleSignOut}
              sx={{
                borderRadius: 2,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.2)', // Slight red tint for logout
                },
              }}
            >
              <ListItemIcon sx={{ color: '#ffffff', minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Sign Out"
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  color: '#ffffff',
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>

        {/* EMMA Branding */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Powered by EMMA
          </Typography>
        </Box>
      </Box>
    </EMMADrawer>
  )
}

export default DashboardSidebar