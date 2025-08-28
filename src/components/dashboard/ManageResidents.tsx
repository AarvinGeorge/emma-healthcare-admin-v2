/**
 * EMMA Healthcare Manage Residents
 * 
 * Resident management interface with real Firestore data integration,
 * filtering, search, and resident creation capabilities.
 */

'use client'

import React, { useState, useMemo } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import { EMMACard, EMMAButton } from '@/components/emma'
import AddResidentModal from '@/components/modals/AddResidentModal'
import { useResidents, useInvalidateResidents } from '@/hooks/useResidents'
import { ExtendedUser } from '@/types/database'
// import { Department, PGYLevel } from '@/types/user'

// Temporary type definitions
type Department =
  | 'EMERGENCY_MEDICINE'
  | 'INTERNAL_MEDICINE'
  | 'SURGERY'
  | 'PEDIATRICS'
  | 'FAMILY_MEDICINE'
  | 'PSYCHIATRY'
  | 'RADIOLOGY'
  | 'ANESTHESIOLOGY'
  | 'PATHOLOGY'
  | 'NEUROLOGY'
  | 'CARDIOLOGY'
  | 'OTHER'

type PGYLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7

// Department options for filtering
const departmentOptions = [
  { value: '', label: 'All Departments' },
  { value: 'EMERGENCY_MEDICINE', label: 'Emergency Medicine' },
  { value: 'INTERNAL_MEDICINE', label: 'Internal Medicine' },
  { value: 'SURGERY', label: 'Surgery' },
  { value: 'PEDIATRICS', label: 'Pediatrics' },
  { value: 'FAMILY_MEDICINE', label: 'Family Medicine' },
  { value: 'PSYCHIATRY', label: 'Psychiatry' },
  { value: 'RADIOLOGY', label: 'Radiology' },
  { value: 'ANESTHESIOLOGY', label: 'Anesthesiology' },
  { value: 'PATHOLOGY', label: 'Pathology' },
  { value: 'NEUROLOGY', label: 'Neurology' },
  { value: 'CARDIOLOGY', label: 'Cardiology' },
  { value: 'OTHER', label: 'Other' },
]

// PGY level options for filtering  
const pgyLevelOptions = [
  { value: '', label: 'All PGY Levels' },
  { value: 1, label: 'PGY-1' },
  { value: 2, label: 'PGY-2' },
  { value: 3, label: 'PGY-3' },
  { value: 4, label: 'PGY-4' },
  { value: 5, label: 'PGY-5' },
  { value: 6, label: 'PGY-6' },
  { value: 7, label: 'PGY-7' },
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

const ManageResidents: React.FC = () => {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedResident, setSelectedResident] = useState<string | null>(null)
  const [addResidentModalOpen, setAddResidentModalOpen] = useState(false)
  const [departmentFilter, setDepartmentFilter] = useState<Department | ''>('')
  const [pgyLevelFilter, setPgyLevelFilter] = useState<PGYLevel | ''>('')

  const invalidateResidents = useInvalidateResidents()

  // Fetch residents with current filters
  const { 
    data: residents = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useResidents({
    department: departmentFilter || undefined,
    pgyLevel: pgyLevelFilter || undefined,
    search: searchTerm || undefined,
  })

  // Filter residents client-side for search (API also supports search but this provides instant feedback)
  const filteredResidents = useMemo(() => {
    if (!residents) return []
    
    if (!searchTerm) return residents
    
    const searchLower = searchTerm.toLowerCase()
    return residents.filter(resident =>
      resident.firstName.toLowerCase().includes(searchLower) ||
      resident.lastName.toLowerCase().includes(searchLower) ||
      resident.email.toLowerCase().includes(searchLower) ||
      resident.department?.toLowerCase().includes(searchLower) ||
      resident.medicalLicenseNumber?.toLowerCase().includes(searchLower)
    )
  }, [residents, searchTerm])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, residentId: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedResident(residentId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedResident(null)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }

  const handleDepartmentFilterChange = (event: SelectChangeEvent<string>) => {
    setDepartmentFilter(event.target.value as Department | '')
  }

  const handlePgyLevelFilterChange = (event: SelectChangeEvent<string>) => {
    setPgyLevelFilter(event.target.value === '' ? '' : Number(event.target.value) as PGYLevel)
  }

  const handleAddResidentSuccess = (newResident: ExtendedUser) => {
    // Invalidate and refetch residents to include the new one
    invalidateResidents()
    setAddResidentModalOpen(false)
  }

  const handleRefresh = () => {
    refetch()
  }

  const formatDepartmentName = (department?: Department): string => {
    if (!department) return 'Not specified'
    return department.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const getResidentInitials = (resident: ExtendedUser): string => {
    return `${resident.firstName.charAt(0)}${resident.lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusColor = (isActive: boolean, emailVerified: boolean) => {
    if (isActive && emailVerified) return 'success'
    if (!emailVerified) return 'warning'
    return 'default'
  }

  const getStatusLabel = (isActive: boolean, emailVerified: boolean) => {
    if (isActive && emailVerified) return 'Active'
    if (!emailVerified) return 'Pending Verification'
    if (!isActive) return 'Inactive'
    return 'Unknown'
  }

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={40} />
          <Typography sx={{ ml: 2 }}>Loading resident physicians...</Typography>
        </Box>
      </Box>
    )
  }

  // Show error state
  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          <Typography variant="body2">
            Failed to load resident physicians: {error instanceof Error ? error.message : 'Unknown error'}
          </Typography>
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Resident Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {residents.length} resident physicians found
            {(departmentFilter || pgyLevelFilter) && ' (filtered)'}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <IconButton
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh residents data"
            sx={{
              bgcolor: 'grey.100',
              '&:hover': { bgcolor: 'grey.200' }
            }}
          >
            <RefreshIcon />
          </IconButton>
          <EMMAButton
            emmaVariant="medical-primary"
            startIcon={<AddIcon />}
            emmaSize="medium"
            onClick={() => setAddResidentModalOpen(true)}
          >
            Add New Resident
          </EMMAButton>
        </Box>
      </Box>

      {/* Search and Filters */}
      <EMMACard elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search residents by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ backgroundColor: 'background.default', borderRadius: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={departmentFilter}
                  onChange={handleDepartmentFilterChange}
                  label="Department"
                >
                  {departmentOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>PGY Level</InputLabel>
                <Select
                  value={pgyLevelFilter.toString()}
                  onChange={handlePgyLevelFilterChange}
                  label="PGY Level"
                >
                  {pgyLevelOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </EMMACard>

      {/* Content Tabs */}
      <EMMACard elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="All Residents" />
            <Tab label="Performance Overview" />
            <Tab label="Rotation Status" />
          </Tabs>
        </Box>

        {/* Residents Table */}
        <TabPanel value={selectedTab} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Resident</TableCell>
                  <TableCell>PGY Level</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Current Rotation</TableCell>
                  <TableCell align="center">Evaluations</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredResidents.map((resident) => (
                  <TableRow key={resident.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                          {resident.firstName.charAt(0) + resident.lastName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {resident.firstName} {resident.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {resident.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`PGY-${resident.pgyLevel}`}
                        size="small"
                        sx={{
                          bgcolor: `var(--emma-pgy-${resident.pgyLevel})`,
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatDepartmentName(resident.department)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="text.secondary">
                        Current rotation data coming soon
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        Evaluation data coming soon
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(resident.isActive, resident.emailVerified)}
                        color={getStatusColor(resident.isActive, resident.emailVerified)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, resident.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Performance Overview */}
        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {filteredResidents.map((resident) => (
                <Grid item xs={12} md={6} lg={4} key={resident.id}>
                  <EMMACard
                    title={`${resident.firstName} ${resident.lastName}`}
                    subtitle={`PGY-${resident.pgyLevel} • ${formatDepartmentName(resident.department)}`}
                    emmaVariant="resident-card"
                    pgyLevel={resident.pgyLevel as 1 | 2 | 3 | 4 | 5 | 6 | 7}
                  >
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="body2" color="text.secondary">
                          Profile Status
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {getStatusLabel(resident.isActive, resident.emailVerified)}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" gap={2} mb={2}>
                        <Chip
                          label={resident.emailVerified ? 'Verified' : 'Pending'}
                          color={resident.emailVerified ? 'success' : 'warning'}
                          size="small"
                        />
                        <Chip
                          label={resident.isActive ? 'Active' : 'Inactive'}
                          color={resident.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Email: <strong>{resident.email}</strong>
                      </Typography>
                      {resident.medicalLicenseNumber && (
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          License: <strong>{resident.medicalLicenseNumber}</strong>
                        </Typography>
                      )}
                      
                      <EMMAButton
                        fullWidth
                        emmaVariant="medical-primary"
                        emmaSize="small"
                        startIcon={<ViewIcon />}
                      >
                        View Details
                      </EMMAButton>
                    </Box>
                  </EMMACard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* Rotation Status */}
        <TabPanel value={selectedTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Rotation Assignments
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Overview of residents' current clinical rotations
            </Typography>
            
            {/* Rotation-based grouping would go here */}
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              Rotation status view coming soon...
            </Typography>
          </Box>
        </TabPanel>
      </EMMACard>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ViewIcon sx={{ mr: 1 }} />
          View Profile
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Resident
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <AssessmentIcon sx={{ mr: 1 }} />
          View Evaluations
        </MenuItem>
      </Menu>

      {/* Add Resident Modal */}
      <AddResidentModal
        open={addResidentModalOpen}
        onClose={() => setAddResidentModalOpen(false)}
        onSuccess={handleAddResidentSuccess}
      />
    </Box>
  )
}

export default ManageResidents