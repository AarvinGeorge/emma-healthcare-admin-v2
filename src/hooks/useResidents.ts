/**
 * EMMA Healthcare Residents Hooks
 * 
 * React Query hooks for managing resident physician data with
 * optimistic updates, caching, and error handling.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { ExtendedUser } from '@/types/database'
import { Department, PGYLevel } from '@/types/user'

interface ResidentsQueryParams {
  department?: Department
  pgyLevel?: PGYLevel
  search?: string
  institutionId?: string
}

interface CreateResidentData {
  firstName: string
  lastName: string
  middleName?: string
  preferredName?: string
  title?: string
  email: string
  phoneNumber?: string
  department: Department
  pgyLevel: PGYLevel
  medicalLicenseNumber?: string
  supervisingFacultyId?: string
  profile?: {
    title?: string
    middleName?: string
    preferredName?: string
  }
  education?: {
    medicalSchool: string
    graduationYear: number
    undergraduateInstitution?: string
  }
}

interface ResidentsResponse {
  success: boolean
  residents: ExtendedUser[]
  total: number
  error?: string
}

interface CreateResidentResponse {
  success: boolean
  message: string
  resident: ExtendedUser
  error?: string
}

/**
 * Fetch resident physicians from API
 */
const fetchResidents = async (params: ResidentsQueryParams = {}): Promise<ExtendedUser[]> => {
  const searchParams = new URLSearchParams()
  
  if (params.institutionId) searchParams.set('institutionId', params.institutionId)
  if (params.department) searchParams.set('department', params.department)
  if (params.pgyLevel) searchParams.set('pgyLevel', params.pgyLevel.toString())
  if (params.search) searchParams.set('search', params.search)

  const response = await fetch(`/api/residents?${searchParams.toString()}`)
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data: ResidentsResponse = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch residents')
  }

  return data.residents
}

/**
 * Create a new resident physician
 */
const createResident = async (residentData: CreateResidentData): Promise<ExtendedUser> => {
  const response = await fetch('/api/residents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(residentData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  const data: CreateResidentResponse = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to create resident')
  }

  return data.resident
}

/**
 * Hook to fetch resident physicians with filtering and caching
 */
export const useResidents = (params: ResidentsQueryParams = {}) => {
  const { data: session } = useSession()
  
  // Use session institutionId if not provided
  const queryParams = {
    ...params,
    institutionId: params.institutionId || session?.user?.institutionId
  }

  return useQuery({
    queryKey: ['residents', queryParams],
    queryFn: () => fetchResidents(queryParams),
    enabled: !!queryParams.institutionId && !!session, // Only run if authenticated and have institution
    staleTime: 30 * 1000, // 30 seconds for real-time updates
    gcTime: 300 * 1000, // 5 minutes cache
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

/**
 * Hook to create a new resident physician
 */
export const useCreateResident = () => {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  return useMutation({
    mutationFn: createResident,
    onMutate: async (newResident) => {
      // Cancel any outgoing refetches
      const institutionId = session?.user?.institutionId
      if (!institutionId) return

      await queryClient.cancelQueries({ queryKey: ['residents'] })

      // Snapshot the previous value
      const previousResidents = queryClient.getQueryData(['residents', { institutionId }])

      // Optimistically update to the new value
      if (previousResidents) {
        const optimisticResident: ExtendedUser = {
          id: `temp-${Date.now()}`,
          email: newResident.email,
          role: 'RESIDENT',
          firstName: newResident.firstName,
          lastName: newResident.lastName,
          department: newResident.department,
          pgyLevel: newResident.pgyLevel,
          status: 'PENDING_VERIFICATION',
          institutionId: institutionId,
          medicalLicenseNumber: newResident.medicalLicenseNumber,
          supervisingFacultyId: newResident.supervisingFacultyId,
          isActive: false,
          emailVerified: false,
          phoneNumber: newResident.phoneNumber,
          createdBy: session?.user?.id || 'unknown',
          lastModifiedBy: session?.user?.id || 'unknown',
          permissions: {
            canViewAllUsers: false,
            canCreateUsers: false,
            canEditUsers: false,
            canDeleteUsers: false,
            canViewAllResidents: false,
            canEditResidents: false,
            canViewAllSchedules: false,
            canCreateSchedules: false,
            canEditSchedules: false,
            canDeleteSchedules: false,
            canViewAllEvaluations: false,
            canCreateEvaluations: false,
            canEditEvaluations: false,
            canAccessReports: false,
            canExportData: false,
            canViewAuditLogs: false,
            canManageSystem: false,
          },
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
          profile: {
            title: newResident.profile?.title || newResident.title || 'Dr.',
            middleName: newResident.profile?.middleName || newResident.middleName,
            preferredName: newResident.profile?.preferredName || newResident.preferredName || newResident.firstName,
            bio: '',
          },
          credentials: {
            boardCertifications: []
          },
          education: newResident.education,
          employment: [{
            startDate: new Date() as any,
            position: 'Resident Physician',
            department: newResident.department,
            supervisor: newResident.supervisingFacultyId,
            employmentType: 'FULL_TIME'
          }]
        }

        queryClient.setQueryData(
          ['residents', { institutionId }],
          [...(previousResidents as ExtendedUser[]), optimisticResident]
        )
      }

      // Return a context object with the snapshotted value
      return { previousResidents }
    },
    onError: (err, newResident, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousResidents) {
        const institutionId = session?.user?.institutionId
        if (institutionId) {
          queryClient.setQueryData(['residents', { institutionId }], context.previousResidents)
        }
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      const institutionId = session?.user?.institutionId
      if (institutionId) {
        queryClient.invalidateQueries({ queryKey: ['residents'] })
      }
    },
  })
}

/**
 * Hook to invalidate residents cache (useful for manual refresh)
 */
export const useInvalidateResidents = () => {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['residents'] })
  }
}