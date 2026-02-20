import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Sale {
  id: number
  saleNumber: string
  customerId?: number
  cashSessionId: number
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  status: 'completed' | 'cancelled' | 'refunded'
  notes?: string
  createdAt: Date
  updatedAt: Date
  deleted: boolean
  customerName?: string
  customerDocument?: string
  cashRegisterName?: string
  customer?: {
    id: number
    name: string
    document?: string
  }
  cashSession?: {
    id: number
    cashRegisterId: number
    cashRegisterName: string
  }
  items?: Array<{
    id: number
    presentationId: number
    presentationName: string
    presentationUnit: 'unit' | 'lb' | 'liter'
    presentationFactor: number | null
    productName: string
    productBaseUnit: 'unit' | 'lb' | 'liter'
    productBaseUnitPrecision: number
    batchId: number
    quantity: number
    unitPrice: number
    totalPrice: number
    discount: number
    discountType?: 'fixed' | 'percentage'
    notes?: string
  }>
  payments?: Array<{
    id: number
    method: string
    amount: number
    receivedAmount?: number
    changeAmount?: number
    referenceNumber?: string
    authorizationCode?: string
    details?: string
    notes?: string
  }>
}

export interface SalesFilters {
  search?: string
  customerId?: number
  cashSessionId?: number
  status?: 'completed' | 'cancelled' | 'refunded'
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'total' | 'saleNumber'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: Date
  dateTo?: Date
  minAmount?: number
  maxAmount?: number
}

export interface CreateSaleData {
  sale: {
    saleNumber?: string
    customerId?: number
    cashSessionId?: number
    subtotal: number
    taxAmount?: number
    discountAmount?: number
    total: number
    status?: 'completed' | 'cancelled' | 'refunded'
    notes?: string
  }
  items: Array<{
    presentationId: number
    batchId: number
    quantity: number
    unitPrice: number
    totalPrice: number
    discount?: number
    discountType?: 'fixed' | 'percentage'
    notes?: string
  }>
  payments: Array<{
    method: 'cash' | 'credit' | 'debit' | 'transfer' | 'check'
    amount: number
    receivedAmount?: number
    changeAmount?: number
    referenceNumber?: string
    authorizationCode?: string
    details?: string
    notes?: string
  }>
}

export interface SalesSummary {
  totalSales: number
  totalRevenue: number
  averageSaleAmount: number
  salesByStatus: Record<string, number>
}

export interface DailySales {
  totalSales: number
  totalAmount: number
  avgSaleAmount: number
}

export interface TopSellingProduct {
  productId: number
  productName: string
  presentationId: number
  presentationName: string
  totalQuantity: number
  totalRevenue: number
  salesCount: number
}

export interface SessionSalesData {
  summary: {
    totalSales: number
    totalAmount: number
    totalItems: number
  }
  paymentBreakdown: Array<{
    method: string
    totalAmount: number
  }>
}

// Query keys
export const salesKeys = {
  all: ['sales'] as const,
  lists: () => [...salesKeys.all, 'list'] as const,
  list: (filters: SalesFilters) => [...salesKeys.lists(), filters] as const,
  details: () => [...salesKeys.all, 'detail'] as const,
  detail: (id: number) => [...salesKeys.details(), id] as const,
  forSession: (sessionId: number) => [...salesKeys.all, 'forSession', sessionId] as const,
  dailySales: (date: Date) => [...salesKeys.all, 'dailySales', date] as const,
  topProducts: (limit?: number, dateFrom?: Date, dateTo?: Date) =>
    [...salesKeys.all, 'topProducts', limit, dateFrom, dateTo] as const,
  summary: (filters: { dateFrom?: Date; dateTo?: Date }) =>
    [...salesKeys.all, 'summary', filters] as const,
  recent: (limit?: number) => [...salesKeys.all, 'recent', limit] as const,
}

// Queries
export const useSales = (filters: SalesFilters = {}) => {
  return useQuery({
    queryKey: salesKeys.list(filters),
    queryFn: () => window.electron.ipcRenderer.invoke('sales:list', filters),
  })
}

export const useSale = (id: number) => {
  return useQuery({
    queryKey: salesKeys.detail(id),
    queryFn: (): Promise<Sale> => window.electron.ipcRenderer.invoke('sales:getById', id),
    enabled: !!id,
  })
}

export const useSalesForSession = (sessionId: number) => {
  return useQuery({
    queryKey: salesKeys.forSession(sessionId),
    queryFn: (): Promise<SessionSalesData> =>
      window.electron.ipcRenderer.invoke('sales:getSalesForSession', sessionId),
    enabled: !!sessionId,
  })
}

export const useDailySales = (date: Date) => {
  return useQuery({
    queryKey: salesKeys.dailySales(date),
    queryFn: (): Promise<DailySales> =>
      window.electron.ipcRenderer.invoke('sales:getDailySales', date),
    enabled: !!date,
  })
}

export const useTopSellingProducts = (limit?: number, dateFrom?: Date, dateTo?: Date) => {
  return useQuery({
    queryKey: salesKeys.topProducts(limit, dateFrom, dateTo),
    queryFn: (): Promise<TopSellingProduct[]> =>
      window.electron.ipcRenderer.invoke('sales:getTopSellingProducts', limit, dateFrom, dateTo),
  })
}

export const useSalesSummary = (filters: { dateFrom?: Date; dateTo?: Date } = {}) => {
  return useQuery({
    queryKey: salesKeys.summary(filters),
    queryFn: (): Promise<SalesSummary> =>
      window.electron.ipcRenderer.invoke('sales:getSalesSummary', filters),
  })
}

export const useRecentSales = (limit?: number) => {
  return useQuery({
    queryKey: salesKeys.recent(limit),
    queryFn: () => window.electron.ipcRenderer.invoke('sales:getRecentSales', limit),
  })
}

// Mutations
export const useCreateSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSaleData) =>
      window.electron.ipcRenderer.invoke('sales:create', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: salesKeys.recent() })
      queryClient.invalidateQueries({ queryKey: ['cashSessions'] })
      queryClient.invalidateQueries({ queryKey: ['pos'] })
    },
  })
}

export const useUpdateSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Sale> }) =>
      window.electron.ipcRenderer.invoke('sales:update', id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: salesKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: salesKeys.recent() })
    },
  })
}

export const useCancelSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      window.electron.ipcRenderer.invoke('sales:cancel', id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: salesKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: salesKeys.recent() })
      queryClient.invalidateQueries({ queryKey: ['pos'] })
    },
  })
}

export const useRefundSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      window.electron.ipcRenderer.invoke('sales:refund', id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: salesKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: salesKeys.recent() })
      queryClient.invalidateQueries({ queryKey: ['pos'] })
    },
  })
}

export const useDeleteSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      window.electron.ipcRenderer.invoke('sales:delete', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: salesKeys.recent() })
    },
  })
}

// Helper mutations for calculations
export const useCalculateSaleTotals = () => {
  return useMutation({
    mutationFn: ({ items, taxRate }: { items: any[]; taxRate?: number }) =>
      window.electron.ipcRenderer.invoke('sales:calculateSaleTotals', items, taxRate),
  })
}

export const useCalculateChange = () => {
  return useMutation({
    mutationFn: (payments: any[]) =>
      window.electron.ipcRenderer.invoke('sales:calculateChange', payments),
  })
}

// Custom hooks for sales workflow
export const useSalesCalculations = () => {
  const calculateTotals = useCalculateSaleTotals()
  const calculateChange = useCalculateChange()

  return {
    calculateTotals,
    calculateChange,
  }
}

// Sales dashboard data
export const useSalesDashboard = (dateFrom?: Date, dateTo?: Date) => {
  const summary = useSalesSummary({ dateFrom, dateTo })
  const recentSales = useRecentSales(10)
  const topProducts = useTopSellingProducts(5, dateFrom, dateTo)

  return {
    summary,
    recentSales,
    topProducts,
  }
}

// Sales analytics
export const useSalesAnalytics = (dateFrom?: Date, dateTo?: Date) => {
  const summary = useSalesSummary({ dateFrom, dateTo })
  const topProducts = useTopSellingProducts(10, dateFrom, dateTo)

  const dailySales = useQuery({
    queryKey: [...salesKeys.all, 'analytics', 'daily', dateFrom, dateTo],
    queryFn: async () => {
      if (!dateFrom || !dateTo) return []

      const sales = []
      const currentDate = new Date(dateFrom)

      while (currentDate <= dateTo) {
        const dailyData = await window.electron.ipcRenderer.invoke('sales:getDailySales', new Date(currentDate))
        sales.push({
          date: new Date(currentDate),
          ...dailyData,
        })
        currentDate.setDate(currentDate.getDate() + 1)
      }

      return sales
    },
    enabled: !!dateFrom && !!dateTo,
  })

  return {
    summary,
    topProducts,
    dailySales,
  }
}
