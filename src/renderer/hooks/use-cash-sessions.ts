import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface CashSession {
  id: number
  cashRegisterId: number
  openedBy: string
  closedBy?: string
  openingAmount: number
  closingAmount?: number
  expectedAmount?: number
  actualAmount?: number
  difference?: number
  status: 'open' | 'closed'
  notes?: string
  openedAt: Date
  closedAt?: Date
  createdAt: Date
  updatedAt: Date
  cashRegisterName?: string
  cashRegisterLocation?: string
}

export interface CashSessionsFilters {
  search?: string
  cashRegisterId?: number
  status?: 'open' | 'closed'
  openedBy?: string
  page?: number
  limit?: number
  sortBy?: 'openedAt' | 'closedAt' | 'expectedAmount'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: Date
  dateTo?: Date
}

export interface OpenSessionInput {
  cashRegisterId: number
  openedBy: string
  openingAmount: number
  notes?: string
}

export interface CloseSessionInput {
  closedBy: string
  actualAmount: number
  notes?: string
}

export interface CashSessionSummary {
  session: CashSession
  salesSummary: {
    totalSales: number
    totalAmount: number
    totalItems: number
  }
  paymentBreakdown: Array<{
    method: string
    totalAmount: number
  }>
}

export interface SessionStats {
  totalSessions: number
  averageSessionDuration: number
  totalDifference: number
  averageDifference: number
  sessionsWithShortages: number
  sessionsWithOverages: number
}

// Query keys
export const cashSessionsKeys = {
  all: ['cashSessions'] as const,
  lists: () => [...cashSessionsKeys.all, 'list'] as const,
  list: (filters: CashSessionsFilters) =>
    [...cashSessionsKeys.lists(), filters] as const,
  details: () => [...cashSessionsKeys.all, 'detail'] as const,
  detail: (id: number) => [...cashSessionsKeys.details(), id] as const,
  currentOpen: () => [...cashSessionsKeys.all, 'currentOpen'] as const,
  openForRegister: (cashRegisterId: number) =>
    [...cashSessionsKeys.all, 'openForRegister', cashRegisterId] as const,
  summary: (id: number) =>
    [...cashSessionsKeys.details(), id, 'summary'] as const,
  needingClosure: () => [...cashSessionsKeys.all, 'needingClosure'] as const,
  stats: (filters: { dateFrom?: Date; dateTo?: Date }) =>
    [...cashSessionsKeys.all, 'stats', filters] as const,
}

// Queries
export const useCashSessions = (filters: CashSessionsFilters = {}) => {
  return useQuery({
    queryKey: cashSessionsKeys.list(filters),
    queryFn: () =>
      window.electron.ipcRenderer.invoke('cash-sessions:list', filters),
  })
}

export const useCashSession = (id: number) => {
  return useQuery({
    queryKey: cashSessionsKeys.detail(id),
    queryFn: () =>
      window.electron.ipcRenderer.invoke('cash-sessions:getById', id),
    enabled: !!id,
  })
}

export const useCurrentOpenSession = () => {
  return useQuery({
    queryKey: cashSessionsKeys.currentOpen(),
    queryFn: async () => {
      const result = await window.electron.ipcRenderer.invoke(
        'cash-sessions:getCurrentOpenSession'
      )
      return result || null
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

export const useOpenSessionForRegister = (cashRegisterId: number) => {
  return useQuery({
    queryKey: cashSessionsKeys.openForRegister(cashRegisterId),
    queryFn: () =>
      window.electron.ipcRenderer.invoke(
        'cash-sessions:getOpenSessionForRegister',
        cashRegisterId
      ),
    enabled: !!cashRegisterId,
  })
}

export const useCashSessionSummary = (id: number) => {
  return useQuery({
    queryKey: cashSessionsKeys.summary(id),
    queryFn: (): Promise<CashSessionSummary> =>
      window.electron.ipcRenderer.invoke('cash-sessions:getSessionSummary', id),
    enabled: !!id,
  })
}

export const useSessionsNeedingClosure = () => {
  return useQuery({
    queryKey: cashSessionsKeys.needingClosure(),
    queryFn: () =>
      window.electron.ipcRenderer.invoke(
        'cash-sessions:getSessionsNeedingClosure'
      ),
  })
}

export const useSessionStats = (
  filters: { dateFrom?: Date; dateTo?: Date } = {}
) => {
  return useQuery({
    queryKey: cashSessionsKeys.stats(filters),
    queryFn: (): Promise<SessionStats> =>
      window.electron.ipcRenderer.invoke(
        'cash-sessions:getSessionStats',
        filters
      ),
  })
}

export const useValidateCanMakeSale = () => {
  return useQuery({
    queryKey: [...cashSessionsKeys.all, 'validateCanMakeSale'],
    queryFn: () =>
      window.electron.ipcRenderer.invoke('cash-sessions:validateCanMakeSale'),
  })
}

// Mutations
export const useOpenCashSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: OpenSessionInput) =>
      window.electron.ipcRenderer.invoke('cash-sessions:openSession', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashSessionsKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: cashSessionsKeys.currentOpen(),
      })
      queryClient.invalidateQueries({
        queryKey: [...cashSessionsKeys.all, 'validateCanMakeSale'],
      })
    },
  })
}

export const useCloseCashSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CloseSessionInput }) =>
      window.electron.ipcRenderer.invoke(
        'cash-sessions:closeSession',
        id,
        input
      ),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: cashSessionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: cashSessionsKeys.detail(id) })
      queryClient.invalidateQueries({
        queryKey: cashSessionsKeys.currentOpen(),
      })
      queryClient.invalidateQueries({
        queryKey: cashSessionsKeys.needingClosure(),
      })
      queryClient.invalidateQueries({
        queryKey: [...cashSessionsKeys.all, 'validateCanMakeSale'],
      })
    },
  })
}

export const useUpdateSessionNotes = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      window.electron.ipcRenderer.invoke(
        'cash-sessions:updateSessionNotes',
        id,
        notes
      ),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: cashSessionsKeys.lists() })
      queryClient.invalidateQueries({ queryKey: cashSessionsKeys.detail(id) })
    },
  })
}
