/**
 * EMMA Healthcare Class Analytics
 * 
 * Analytics dashboard for class performance, trends, and insights
 * with charts and metrics visualization.
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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
} from '@mui/icons-material'
import { EMMACard } from '@/components/emma'

// Mock analytics data
const mockAnalytics = {
  classPerformance: {
    averageScore: 87.3,
    trend: '+2.1%',
    totalEvaluations: 234,
    completionRate: 89.2,
  },
  departmentStats: [
    { department: 'Emergency Medicine', avgScore: 88.1, residents: 23, color: '#ef4444' },
    { department: 'Internal Medicine', avgScore: 86.7, residents: 31, color: '#f59e0b' },
    { department: 'Surgery', avgScore: 89.4, residents: 18, color: '#10b981' },
    { department: 'Pediatrics', avgScore: 85.9, residents: 22, color: '#3b82f6' },
    { department: 'Psychiatry', avgScore: 87.2, residents: 15, color: '#8b5cf6' },
  ],
  pgyLevelStats: [
    { level: 1, avgScore: 82.1, count: 45, improvement: '+1.2%' },
    { level: 2, avgScore: 86.3, count: 38, improvement: '+2.7%' },
    { level: 3, avgScore: 89.7, count: 31, improvement: '+0.8%' },
    { level: 4, avgScore: 91.2, count: 15, improvement: '+1.9%' },
  ],
}

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

const ClassAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('current-quarter')
  const [selectedTab, setSelectedTab] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header and Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Class Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Performance insights and trends analysis
          </Typography>
        </Box>
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as string)}
            label="Time Range"
          >
            <MenuItem value="current-quarter">Current Quarter</MenuItem>
            <MenuItem value="last-quarter">Last Quarter</MenuItem>
            <MenuItem value="academic-year">Academic Year</MenuItem>
            <MenuItem value="custom">Custom Range</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <EMMACard emmaVariant="dashboard-metric" elevation={2}>
            <Box textAlign="center">
              <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h3" fontWeight="bold" color="primary.main">
                {mockAnalytics.classPerformance.averageScore}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Average Score
              </Typography>
              <Chip
                icon={<TrendingUpIcon />}
                label={mockAnalytics.classPerformance.trend}
                color="success"
                size="small"
              />
            </Box>
          </EMMACard>
        </Grid>

        <Grid item xs={12} md={3}>
          <EMMACard emmaVariant="dashboard-metric" elevation={2}>
            <Box textAlign="center">
              <SchoolIcon sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {mockAnalytics.classPerformance.totalEvaluations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Evaluations
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                This quarter
              </Typography>
            </Box>
          </EMMACard>
        </Grid>

        <Grid item xs={12} md={3}>
          <EMMACard emmaVariant="dashboard-metric" elevation={2}>
            <Box textAlign="center">
              <Typography variant="h3" fontWeight="bold" color="info.main" sx={{ mb: 1 }}>
                {mockAnalytics.classPerformance.completionRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Completion Rate
              </Typography>
              <LinearProgress
                variant="determinate"
                value={mockAnalytics.classPerformance.completionRate}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: 'info.main',
                  },
                }}
              />
            </Box>
          </EMMACard>
        </Grid>

        <Grid item xs={12} md={3}>
          <EMMACard emmaVariant="dashboard-metric" elevation={2}>
            <Box textAlign="center">
              <Typography variant="h3" fontWeight="bold" color="warning.main" sx={{ mb: 1 }}>
                15
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Areas for Improvement
              </Typography>
              <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                Requires attention
              </Typography>
            </Box>
          </EMMACard>
        </Grid>
      </Grid>

      {/* Content Tabs */}
      <EMMACard elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Department Performance" />
            <Tab label="PGY Level Analysis" />
            <Tab label="Trending Topics" />
            <Tab label="Detailed Reports" />
          </Tabs>
        </Box>

        {/* Department Performance */}
        <TabPanel value={selectedTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance by Department
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Compare average scores and resident counts across departments
            </Typography>

            <Grid container spacing={3}>
              {mockAnalytics.departmentStats.map((dept, index) => (
                <Grid item xs={12} md={6} lg={4} key={dept.department}>
                  <Card
                    sx={{
                      borderLeft: `4px solid ${dept.color}`,
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" fontWeight="medium" gutterBottom>
                        {dept.department}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: dept.color }}>
                          {dept.avgScore}
                        </Typography>
                        <Chip
                          label={`${dept.residents} residents`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={dept.avgScore}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            backgroundColor: dept.color,
                          },
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Average evaluation score
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>

        {/* PGY Level Analysis */}
        <TabPanel value={selectedTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance by PGY Level
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Track progression and improvement across residency years
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>PGY Level</TableCell>
                    <TableCell align="center">Resident Count</TableCell>
                    <TableCell align="center">Average Score</TableCell>
                    <TableCell align="center">Improvement</TableCell>
                    <TableCell>Performance Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockAnalytics.pgyLevelStats.map((pgy) => (
                    <TableRow key={pgy.level} hover>
                      <TableCell>
                        <Chip
                          label={`PGY-${pgy.level}`}
                          sx={{
                            bgcolor: `var(--emma-pgy-${pgy.level})`,
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight="medium">
                          {pgy.count}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body1" fontWeight="bold">
                          {pgy.avgScore}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<TrendingUpIcon />}
                          label={pgy.improvement}
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <LinearProgress
                          variant="determinate"
                          value={pgy.avgScore}
                          sx={{
                            width: 100,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              backgroundColor: `var(--emma-pgy-${pgy.level})`,
                            },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Trending Topics */}
        <TabPanel value={selectedTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Trending Topics & Skills
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Areas showing significant improvement or requiring attention
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom color="success.main">
                      📈 Improving Areas
                    </Typography>
                    <Box>
                      {['Clinical Decision Making', 'Patient Communication', 'Procedure Skills'].map((skill) => (
                        <Box key={skill} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                          <Typography variant="body2">{skill}</Typography>
                          <Chip
                            icon={<TrendingUpIcon />}
                            label="+3.2%"
                            color="success"
                            size="small"
                          />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom color="warning.main">
                      📉 Needs Attention
                    </Typography>
                    <Box>
                      {['Time Management', 'Documentation', 'Team Collaboration'].map((skill) => (
                        <Box key={skill} display="flex" justifyContent="space-between" alignItems="center" py={1}>
                          <Typography variant="body2">{skill}</Typography>
                          <Chip
                            icon={<TrendingDownIcon />}
                            label="-1.1%"
                            color="warning"
                            size="small"
                          />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Detailed Reports */}
        <TabPanel value={selectedTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Detailed Analytics Reports
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Comprehensive reports and data exports
            </Typography>
            
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              Advanced reporting features coming soon...
            </Typography>
          </Box>
        </TabPanel>
      </EMMACard>
    </Box>
  )
}

export default ClassAnalytics