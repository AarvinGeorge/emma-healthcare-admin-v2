/**
 * EMMA Healthcare Dashboard Overview
 * 
 * Main dashboard overview component with key metrics, recent activities,
 * and healthcare-specific widgets using Material Dashboard React components.
 */

'use client'

import React from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material'
import { EMMACard } from '@/components/emma'

// Mock data for demonstration
const mockMetrics = {
  totalResidents: 127,
  activeRotations: 23,
  pendingEvaluations: 15,
  completionRate: 87,
}

const mockRecentActivities = [
  {
    id: 1,
    type: 'evaluation',
    title: 'New evaluation submitted',
    description: 'Dr. Sarah Johnson completed evaluation for John Smith (PGY-2)',
    timestamp: '2 minutes ago',
    pgyLevel: 2,
  },
  {
    id: 2,
    type: 'schedule',
    title: 'Schedule update',
    description: 'Emergency Medicine rotation schedule updated for next month',
    timestamp: '15 minutes ago',
  },
  {
    id: 3,
    type: 'resident',
    title: 'New resident registered',
    description: 'Michael Chen (PGY-1) has been added to the system',
    timestamp: '1 hour ago',
    pgyLevel: 1,
  },
]

const DashboardOverview: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Metrics Cards Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Residents */}
        <Grid item xs={12} sm={6} md={3}>
          <EMMACard emmaVariant="dashboard-metric" elevation={2}>
            <Box textAlign="center">
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <PeopleIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                {mockMetrics.totalResidents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Residents
              </Typography>
              <Chip
                label="+5 this month"
                size="small"
                color="success"
                sx={{ mt: 1, fontSize: '0.7rem' }}
              />
            </Box>
          </EMMACard>
        </Grid>

        {/* Active Rotations */}
        <Grid item xs={12} sm={6} md={3}>
          <EMMACard emmaVariant="dashboard-metric" elevation={2}>
            <Box textAlign="center">
              <Avatar
                sx={{
                  bgcolor: 'success.main',
                  width: 56,
                  height: 56,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <ScheduleIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="success.main" gutterBottom>
                {mockMetrics.activeRotations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Rotations
              </Typography>
              <Chip
                label="Current cycle"
                size="small"
                color="success"
                variant="outlined"
                sx={{ mt: 1, fontSize: '0.7rem' }}
              />
            </Box>
          </EMMACard>
        </Grid>

        {/* Pending Evaluations */}
        <Grid item xs={12} sm={6} md={3}>
          <EMMACard emmaVariant="warning-card" elevation={2}>
            <Box textAlign="center">
              <Avatar
                sx={{
                  bgcolor: 'warning.main',
                  color: 'common.black',
                  width: 56,
                  height: 56,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <AssignmentIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="warning.dark" gutterBottom>
                {mockMetrics.pendingEvaluations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Evaluations
              </Typography>
              <Chip
                label="Needs attention"
                size="small"
                color="warning"
                sx={{ mt: 1, fontSize: '0.7rem' }}
              />
            </Box>
          </EMMACard>
        </Grid>

        {/* Completion Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <EMMACard emmaVariant="dashboard-metric" elevation={2}>
            <Box textAlign="center">
              <Avatar
                sx={{
                  bgcolor: 'info.main',
                  width: 56,
                  height: 56,
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="info.main" gutterBottom>
                {mockMetrics.completionRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Completion Rate
              </Typography>
              <LinearProgress
                variant="determinate"
                value={mockMetrics.completionRate}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    backgroundColor: 'info.main',
                  },
                }}
              />
            </Box>
          </EMMACard>
        </Grid>
      </Grid>

      {/* Content Row */}
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <EMMACard 
            title="Recent Activities" 
            subtitle="Latest updates and notifications"
            elevation={2}
          >
            <List sx={{ pt: 0 }}>
              {mockRecentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: activity.type === 'evaluation' 
                            ? 'success.main' 
                            : activity.type === 'schedule'
                            ? 'info.main'
                            : 'primary.main',
                          width: 40,
                          height: 40,
                        }}
                      >
                        {activity.type === 'evaluation' && <AssignmentIcon />}
                        {activity.type === 'schedule' && <ScheduleIcon />}
                        {activity.type === 'resident' && <PeopleIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {activity.title}
                          </Typography>
                          {activity.pgyLevel && (
                            <Chip
                              label={`PGY-${activity.pgyLevel}`}
                              size="small"
                              sx={{
                                bgcolor: `var(--emma-pgy-${activity.pgyLevel})`,
                                color: 'white',
                                fontSize: '0.7rem',
                                height: 20,
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }} component="div">
                            {activity.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" component="div">
                            {activity.timestamp}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < mockRecentActivities.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          </EMMACard>
        </Grid>

        {/* Quick Actions & Notifications */}
        <Grid item xs={12} md={4}>
          <EMMACard
            title="Quick Actions"
            subtitle="Common tasks and shortcuts"
            elevation={2}
            sx={{ mb: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    borderRadius: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'primary.50',
                    },
                  }}
                >
                  <PeopleIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="body2" fontWeight="medium" color="primary.main">
                    Add Resident
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    border: '2px dashed',
                    borderColor: 'success.main',
                    borderRadius: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'success.dark',
                      backgroundColor: 'success.50',
                    },
                  }}
                >
                  <ScheduleIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="body2" fontWeight="medium" color="success.main">
                    Create Schedule
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </EMMACard>

          {/* System Status */}
          <EMMACard
            title="System Status"
            subtitle="Platform health and updates"
            elevation={2}
          >
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="body2">Database Connection</Typography>
                <Chip label="Healthy" size="small" color="success" />
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="body2">Firebase Services</Typography>
                <Chip label="Online" size="small" color="success" />
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="body2">Last Backup</Typography>
                <Typography variant="caption" color="text.secondary">
                  2 hours ago
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2">System Load</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <LinearProgress
                    variant="determinate"
                    value={34}
                    sx={{ width: 60, height: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    34%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </EMMACard>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardOverview