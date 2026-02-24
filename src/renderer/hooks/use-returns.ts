import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface SaleReturnFilters {
  saleId?: number
  type?: 'refund' | 'exchange'
  dateFrom?: Date
  dateTo?: Date
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'balanceCents'
  sortOrder?: 'asc' | 'desc'
}

export interface SaleReturn {
  id: number
  returnNumber: string
  saleId: number
  cashSessionId?: number
  type: 'refund' | 'exchange'
  totalReturnedValue: number
  totalExchangeValue: number
  balanceCents: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  deleted: boolean
  saleNumber?: string
}

export interface ProcessReturnItem {
  saleItemId: number
  quantityReturned: number
  condition: 'good' | 'damaged'
  shrinkageReason?: string
}

export interface ProcessExchangeItem {
  presentationId: number
  batchId: number
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface ProcessReturnData {
  saleId: number
  returnItems: ProcessReturnItem[]
  type: 'refund' | 'exchange'
  exchangeItems?: ProcessExchangeItem[]
  notes?: string
  createdBy?: string
}

export const returnsKeys = {
  all: ['saleReturns'] as const,
  lists: () => [...returnsKeys.all, 'list'] as const,
  list: (filters: SaleReturnFilters) =>
    [...returnsKeys.lists(), filters] as const,
  details: () => [...returnsKeys.all, 'detail'] as const,
  detail: (id: number) => [...returnsKeys.details(), id] as const,
  bySale: (saleId: number) => [...returnsKeys.all, 'bySale', saleId] as const,
}

export function useReturns(filters: SaleReturnFilters = {}) {
  return useQuery({
    queryKey: returnsKeys.list(filters),
    queryFn: () => window.api.saleReturns.list(filters),
  })
}

export function useReturn(id: number) {
  return useQuery({
    queryKey: returnsKeys.detail(id),
    queryFn: () => window.api.saleReturns.getById(id),
    enabled: !!id,
  })
}

export function useReturnsBySaleId(saleId: number) {
  return useQuery({
    queryKey: returnsKeys.bySale(saleId),
    queryFn: () => window.api.saleReturns.getBySaleId(saleId),
    enabled: !!saleId,
  })
}

export function useProcessReturn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProcessReturnData) =>
      window.api.saleReturns.processReturn(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: returnsKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: returnsKeys.bySale(variables.saleId),
      })
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['cashSessions'] })
      queryClient.invalidateQueries({ queryKey: ['inventoryAdjustments'] })
    },
  })
}

export function useTotalRefunded(dateFrom?: Date, dateTo?: Date) {
  return useQuery({
    queryKey: [...returnsKeys.all, 'totalRefunded', dateFrom, dateTo],
    queryFn: () =>
      window.api.saleReturns.getTotalRefunded(dateFrom, dateTo),
    enabled: true,
  })
}
