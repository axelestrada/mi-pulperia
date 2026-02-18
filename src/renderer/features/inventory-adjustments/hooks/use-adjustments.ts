import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { adjustmentAdapter } from '../api/adjustment-adapter'

export function useInventoryAdjustments() {
  return useQuery({
    queryKey: ['inventory-adjustments'],
    queryFn: adjustmentAdapter.list,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useInventoryAdjustment(id: number) {
  return useQuery({
    queryKey: ['inventory-adjustments', id],
    queryFn: () => adjustmentAdapter.getById(id),
    enabled: !!id,
  })
}

export function useGenerateAdjustmentNumber() {
  return useQuery({
    queryKey: ['inventory-adjustments', 'generate-number'],
    queryFn: adjustmentAdapter.generateAdjustmentNumber,
    staleTime: 0,
    gcTime: 0,
  })
}

export function useAvailableBatches(productId?: number) {
  return useQuery({
    queryKey: ['inventory-batches', 'available', productId],
    queryFn: () => adjustmentAdapter.getAvailableBatches(productId),
    enabled: !!productId,
  })
}

export function useBatchInfo(batchId: number) {
  return useQuery({
    queryKey: ['inventory-batches', batchId],
    queryFn: () => adjustmentAdapter.getBatchInfo(batchId),
    enabled: !!batchId,
  })
}

export function useCreateInventoryAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adjustmentAdapter.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-adjustments'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Ajuste de inventario creado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al crear ajuste: ${error.message}`)
    },
  })
}

export function useUpdateInventoryAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<InventoryAdjustmentFormData>
    }) => adjustmentAdapter.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-adjustments'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-adjustments', id] })
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Ajuste actualizado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar ajuste: ${error.message}`)
    },
  })
}

export function useDeleteInventoryAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adjustmentAdapter.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-adjustments'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Ajuste eliminado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar ajuste: ${error.message}`)
    },
  })
}

export function useApproveAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adjustmentAdapter.approve,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-adjustments'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-adjustments', id] })
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      toast.success('Ajuste aprobado y aplicado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al aprobar ajuste: ${error.message}`)
    },
  })
}

export function useCancelAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: adjustmentAdapter.cancel,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-adjustments'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-adjustments', id] })
      toast.success('Ajuste cancelado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al cancelar ajuste: ${error.message}`)
    },
  })
}
