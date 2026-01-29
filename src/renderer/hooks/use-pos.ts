import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface POSPresentation {
  id: number
  name: string
  description: string | null
  image: string | null
  barcode: string | null
  sku: string | null
  salePrice: number
  isBase: boolean
  unit: string
  unitPrecision: number
  factorType: 'fixed' | 'variable'
  factor: number | null
  productId: number
  productName: string
  categoryId: number
  categoryName: string
  availableQuantity: number
  batches: Array<{
    batchId: number
    batchCode: string | null
    expirationDate: Date | null
    availableQuantity: number
    unitCost: number
  }>
}

export interface POSFilters {
  search?: string
  categoryId?: number
  isActive?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'salePrice' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface POSCategory {
  id: number
  name: string
}

export interface POSSaleItem {
  presentationId: number
  quantity: number
  unitPrice: number
  discount?: number
  discountType?: 'fixed' | 'percentage'
  notes?: string
}

export interface POSPayment {
  method: 'cash' | 'credit' | 'debit' | 'transfer' | 'check'
  amount: number
  receivedAmount?: number
  changeAmount?: number
  referenceNumber?: string
  authorizationCode?: string
  details?: string
  notes?: string
}

export interface CreatePOSSaleInput {
  customerId?: number
  items: POSSaleItem[]
  payments: POSPayment[]
  subtotal: number
  taxAmount?: number
  discountAmount?: number
  total: number
  notes?: string
}

export interface SaleTotals {
  subtotal: number
  taxAmount: number
  total: number
  totalItems: number
}

export interface QuickSearchResult {
  id: number
  name: string
  productName: string
  barcode?: string
  sku?: string
  salePrice: number
  availableQuantity: number
}

export interface LowStockPresentation extends POSPresentation {
  // Inherited from POSPresentation
}

export interface ExpiringPresentation extends POSPresentation {
  expiringBatches: Array<{
    batchId: number
    batchCode?: string
    expirationDate?: Date
    availableQuantity: number
    unitCost: number
  }>
  totalExpiringQuantity: number
}

// Query keys
export const posKeys = {
  all: ['pos'] as const,
  presentations: () => [...posKeys.all, 'presentations'] as const,
  presentationsList: (filters: POSFilters) =>
    [...posKeys.presentations(), 'list', filters] as const,
  presentationDetail: (id: number) =>
    [...posKeys.presentations(), 'detail', id] as const,
  searchByCode: (code: string) =>
    [...posKeys.all, 'searchByCode', code] as const,
  categories: () => [...posKeys.all, 'categories'] as const,
  recentSales: (limit?: number) =>
    [...posKeys.all, 'recentSales', limit] as const,
  lowStock: (threshold?: number) =>
    [...posKeys.all, 'lowStock', threshold] as const,
  expiring: (daysFromNow?: number) =>
    [...posKeys.all, 'expiring', daysFromNow] as const,
  quickSearch: (query: string, limit?: number) =>
    [...posKeys.all, 'quickSearch', query, limit] as const,
}

// Queries
export const useAvailablePresentations = (filters: POSFilters = {}) => {
  return useQuery({
    queryKey: posKeys.presentationsList(filters),
    queryFn: () => window.api.pos.getAvailablePresentations(filters),
  })
}

export const usePresentationWithBatches = (presentationId: number) => {
  return useQuery({
    queryKey: posKeys.presentationDetail(presentationId),
    queryFn: (): Promise<POSPresentation> =>
      window.electron.ipcRenderer.invoke(
        'pos:getPresentationWithBatches',
        presentationId
      ),
    enabled: !!presentationId,
  })
}

export const useSearchByCode = (code: string) => {
  return useQuery({
    queryKey: posKeys.searchByCode(code),
    queryFn: (): Promise<POSPresentation | undefined> =>
      window.electron.ipcRenderer.invoke('pos:searchByCode', code),
    enabled: !!code && code.length >= 3,
  })
}

export const usePOSCategories = () => {
  return useQuery({
    queryKey: posKeys.categories(),
    queryFn: (): Promise<POSCategory[]> =>
      window.electron.ipcRenderer.invoke('pos:getCategories'),
  })
}

export const useRecentSales = (limit?: number) => {
  return useQuery({
    queryKey: posKeys.recentSales(limit),
    queryFn: () =>
      window.electron.ipcRenderer.invoke('pos:getRecentSales', limit),
  })
}

export const useLowStockPresentations = (threshold?: number) => {
  return useQuery({
    queryKey: posKeys.lowStock(threshold),
    queryFn: (): Promise<LowStockPresentation[]> =>
      window.electron.ipcRenderer.invoke(
        'pos:getLowStockPresentations',
        threshold
      ),
  })
}

export const useExpiringPresentations = (daysFromNow?: number) => {
  return useQuery({
    queryKey: posKeys.expiring(daysFromNow),
    queryFn: (): Promise<ExpiringPresentation[]> =>
      window.electron.ipcRenderer.invoke(
        'pos:getExpiringPresentations',
        daysFromNow
      ),
  })
}

export const useQuickSearch = (query: string, limit?: number) => {
  return useQuery({
    queryKey: posKeys.quickSearch(query, limit),
    queryFn: (): Promise<QuickSearchResult[]> =>
      window.electron.ipcRenderer.invoke('pos:quickSearch', query, limit),
    enabled: !!query && query.length >= 2,
  })
}

export const useValidateBarcode = (barcode: string) => {
  return useQuery({
    queryKey: [...posKeys.all, 'validateBarcode', barcode],
    queryFn: (): Promise<boolean> =>
      window.electron.ipcRenderer.invoke('pos:validateBarcode', barcode),
    enabled: !!barcode,
  })
}

// Mutations
export const useCreatePOSSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreatePOSSaleInput) =>
      window.electron.ipcRenderer.invoke('pos:createSale', input),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: posKeys.presentations() })
      queryClient.invalidateQueries({ queryKey: posKeys.recentSales() })
      queryClient.invalidateQueries({ queryKey: posKeys.lowStock() })
      queryClient.invalidateQueries({ queryKey: ['cashSessions'] })
      queryClient.invalidateQueries({ queryKey: ['sales'] })
    },
  })
}

// Helper mutations for calculations
export const useCalculateTotals = () => {
  return useMutation({
    mutationFn: ({
      items,
      taxRate,
    }: {
      items: POSSaleItem[]
      taxRate?: number
    }): Promise<SaleTotals> =>
      window.electron.ipcRenderer.invoke('pos:calculateTotals', items, taxRate),
  })
}

export const useCalculateChange = () => {
  return useMutation({
    mutationFn: (payments: POSPayment[]): Promise<number> =>
      window.electron.ipcRenderer.invoke('pos:calculateChange', payments),
  })
}

// Custom hooks for POS workflow
export const usePOSSearch = () => {
  const searchByCode = useSearchByCode
  const quickSearch = useQuickSearch

  return {
    searchByCode,
    quickSearch,
  }
}

export const usePOSValidation = () => {
  const validateBarcode = useValidateBarcode

  return {
    validateBarcode,
  }
}

export const usePOSCalculations = () => {
  const calculateTotals = useCalculateTotals()
  const calculateChange = useCalculateChange()

  return {
    calculateTotals,
    calculateChange,
  }
}

// POS dashboard data
export const usePOSDashboard = () => {
  const recentSales = useRecentSales(5)
  const lowStock = useLowStockPresentations(5)
  const expiring = useExpiringPresentations(7)

  return {
    recentSales,
    lowStock,
    expiring,
  }
}
