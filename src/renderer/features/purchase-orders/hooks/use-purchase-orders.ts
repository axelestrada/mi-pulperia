import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { purchaseOrderAdapter } from '../api/purchase-order-adapter'

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ['purchase-orders'],
    queryFn: purchaseOrderAdapter.list,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function usePurchaseOrder(id: number) {
  return useQuery({
    queryKey: ['purchase-orders', id],
    queryFn: () => purchaseOrderAdapter.getById(id),
    enabled: !!id,
  })
}

export function usePurchaseOrdersBySupplier(supplierId: number) {
  return useQuery({
    queryKey: ['purchase-orders', 'supplier', supplierId],
    queryFn: () => purchaseOrderAdapter.getBySupplier(supplierId),
    enabled: !!supplierId,
  })
}

export function useGenerateOrderNumber() {
  return useQuery({
    queryKey: ['purchase-orders', 'generate-number'],
    queryFn: purchaseOrderAdapter.generateOrderNumber,
    staleTime: 0,
    gcTime: 0,
  })
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: purchaseOrderAdapter.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      sileo.success({ title: 'Orden de compra creada exitosamente' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al crear orden de compra',
        description: error.message,
      })
    },
  })
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<PurchaseOrderFormData>
    }) => purchaseOrderAdapter.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] })
      sileo.success({ title: 'Orden de compra actualizada exitosamente' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al actualizar orden de compra',
        description: error.message,
      })
    },
  })
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: purchaseOrderAdapter.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      sileo.success({ title: 'Orden de compra eliminada exitosamente' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al eliminar orden de compra',
        description: error.message,
      })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number
      status: PurchaseOrder['status']
    }) => purchaseOrderAdapter.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] })
      sileo.success({ title: 'Estado de la orden actualizado exitosamente' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al actualizar estado',
        description: error.message,
      })
    },
  })
}

export function useSendOrderToSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: purchaseOrderAdapter.sendToSupplier,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] })
      sileo.success({ title: 'Orden enviada al proveedor exitosamente' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al enviar orden',
        description: error.message,
      })
    },
  })
}

export function useMarkOrderAsCompleted() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: purchaseOrderAdapter.markAsCompleted,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] })
      sileo.success({ title: 'Orden marcada como completada' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al completar orden',
        description: error.message,
      })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      purchaseOrderAdapter.cancel(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', id] })
      sileo.success({ title: 'Orden cancelada exitosamente' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al cancelar orden',
        description: error.message,
      })
    },
  })
}
