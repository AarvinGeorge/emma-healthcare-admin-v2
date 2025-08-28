/**
 * EMMA Healthcare Schedule Matching
 * 
 * Clinical rotation scheduling and matching system
 * with calendar views and assignment management.
 */

'use client'

import React, { useState } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  SwapHoriz as SwapIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { EMMACard, EMMAButton } from '@/components/emma'

// Mock schedule data
const mockRotations = [
  {
    id: 1,
    name: 'Emergency Medicine',
    capacity: 6,
    assigned: 5,
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    status: 'active',
  },
  {
    id: 2,
    name: 'Internal Medicine',
    capacity: 8,
    assigned: 8,
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    status: 'full',
  },
  {
    id: 3,
    name: 'Surgery',
    capacity: 4,
    assigned: 3,
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    status: 'upcoming',
  },
  {
    id: 4,
    name: 'Pediatrics',
    capacity: 6,
    assigned: 2,
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    status: 'needs-residents',
  },
]

const mockAssignments = [
  {
    id: 1,
    residentName: 'John Smith',
    pgyLevel: 2,
    rotation: 'Emergency Medicine',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    status: 'confirmed',
  },
  {
    id: 2,
    residentName: 'Sarah Johnson',
    pgyLevel: 1,
    rotation: 'Internal Medicine',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    status: 'confirmed',
  },
  {
    id: 3,
    residentName: 'Michael Chen',
    pgyLevel: 3,
    rotation: 'Surgery',
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    status: 'pending',
  },
  {
    id: 4,
    residentName: 'Emily Davis',
    pgyLevel: 2,
    rotation: 'Pediatrics',
    startDate: '2024-04-01',
    endDate: '2024-04-30',
    status: 'pending',
  },
]

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

const ScheduleMatching: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current')
  const [selectedTab, setSelectedTab] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'confirmed':
        return 'success'
      case 'full':
        return 'info'
      case 'needs-residents':
      case 'pending':
        return 'warning'
      case 'upcoming':
        return 'primary'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon />
      case 'pending':
        return <WarningIcon />
      case 'needs-residents':
        return <WarningIcon />
      default:
        return null
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header and Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Schedule Matching
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Clinical rotation scheduling and resident assignments
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <FormControl variant="outlined" sx={{ minWidth: 150 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as string)}
              label="Period"
            >
              <MenuItem value="current">Current</MenuItem>
              <MenuItem value="next">Next Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
            </Select>
          </FormControl>
          <EMMAButton
            emmaVariant="medical-primary"
            startIcon={<AddIcon />}
          >
            New Rotation
          </EMMAButton>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <EMMACard emmaVariant="dashboard-metric" elevation={2}>
            <Box textAlign="center">
              <CalendarIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h3" fontWeight="bold" color="primary.main">
                {mockRotations.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Rotations
              </Typography>
            </Box>
          </EMMACard>
        </Grid>

        <Grid item xs={12} md={3}>
          <EMMACard emmaVariant="dashboard-metric" elevation={2}>
            <Box textAlign="center">
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {mockAssignments.filter(a => a.status === 'confirmed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Confirmed Assignments
              </Typography>
              <Chip
                label="85% filled"
                color="success"
                size="small"
              />
            </Box>
          </EMMACard>
        </Grid>

        <Grid item xs={12} md={3}>
          <EMMACard emmaVariant="warning-card" elevation={2}>
            <Box textAlign="center">
              <Typography variant="h3" fontWeight="bold" color="warning.dark">
                {mockAssignments.filter(a => a.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Pending Assignments
              </Typography>
              <Chip
                label="Needs review"
                color="warning"
                size="small"
              />
            </Box>
          </EMMACard>
        </Grid>

        <Grid item xs={12} md={3}>
          <EMMACard emmaVariant="dashboard-metric" elevation={2}>
            <Box textAlign="center">
              <Typography variant="h3" fontWeight="bold" color="info.main">
                24
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Capacity
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Across all rotations
              </Typography>
            </Box>
          </EMMACard>
        </Grid>
      </Grid>

      {/* Content Tabs */}
      <EMMACard elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Rotation Overview" />
            <Tab label="Current Assignments" />
            <Tab label="Schedule Conflicts" />
            <Tab label="Calendar View" />
          </Tabs>
        </Box>

        {/* Rotation Overview */}
        <TabPanel value={selectedTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Rotations
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Overview of all clinical rotations and their current status
            </Typography>

            <Grid container spacing={3}>
              {mockRotations.map((rotation) => (
                <Grid item xs={12} md={6} key={rotation.id}>
                  <Card
                    sx={{
                      borderLeft: `4px solid ${
                        rotation.status === 'full' ? '#f59e0b' :
                        rotation.status === 'needs-residents' ? '#ef4444' :
                        rotation.status === 'active' ? '#10b981' : '#3b82f6'
                      }`,
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" fontWeight="medium">
                          {rotation.name}
                        </Typography>
                        <Chip
                          label={rotation.status.replace('-', ' ')}
                          color={getStatusColor(rotation.status) as any}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          {rotation.startDate} - {rotation.endDate}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {rotation.assigned} / {rotation.capacity} residents
                        </Typography>
                      </Box>

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography
                          variant="body2"
                          color={
                            rotation.assigned === rotation.capacity ? 'success.main' :
                            rotation.assigned < rotation.capacity / 2 ? 'error.main' :
                            'warning.main'
                          }
                        >
                          {Math.round((rotation.assigned / rotation.capacity) * 100)}% filled
                        </Typography>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Edit Rotation">
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Manage Assignments">
                            <IconButton size="small">
                              <SwapIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Current Assignments */}
        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Assignments
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Resident rotation assignments and their current status
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Resident</TableCell>
                    <TableCell>PGY Level</TableCell>
                    <TableCell>Rotation</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockAssignments.map((assignment) => (
                    <TableRow key={assignment.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {assignment.residentName.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight="medium">
                            {assignment.residentName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`PGY-${assignment.pgyLevel}`}
                          size="small"
                          sx={{
                            bgcolor: `var(--emma-pgy-${assignment.pgyLevel})`,
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {assignment.rotation}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {assignment.startDate} - {assignment.endDate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(assignment.status)}
                          label={assignment.status}
                          color={getStatusColor(assignment.status) as any}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <Tooltip title="Edit Assignment">
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Swap Rotation">
                            <IconButton size="small">
                              <SwapIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Schedule Conflicts */}
        <TabPanel value={selectedTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Schedule Conflicts
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Identify and resolve scheduling conflicts and issues
            </Typography>
            
            <Box display="flex" justifyContent="center" alignItems="center" py={6}>
              <Box textAlign="center">
                <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" color="success.main" gutterBottom>
                  No Conflicts Detected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All current assignments are conflict-free
                </Typography>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        {/* Calendar View */}
        <TabPanel value={selectedTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Calendar View
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Visual calendar representation of rotation schedules
            </Typography>
            
            <Typography variant="body1" color="text.secondary" textAlign="center" py={6}>
              Interactive calendar view coming soon...
            </Typography>
          </Box>
        </TabPanel>
      </EMMACard>
    </Box>
  )
}

export default ScheduleMatching