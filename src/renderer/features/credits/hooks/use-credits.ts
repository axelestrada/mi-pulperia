import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useCredits(filters?: any) {
  return useQuery({
    queryKey: ['credits', filters],
    queryFn: () => window.api.credits.list(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCredit(id: number) {
  return useQuery({
    queryKey: ['credits', id],
    queryFn: () => window.api.credits.getById(id),
    enabled: !!id,
  })
}

export function useOverdueCredits() {
  return useQuery({
    queryKey: ['credits', 'overdue'],
    queryFn: () => window.api.credits.getOverdueCredits(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useActiveCredits() {
  return useQuery({
    queryKey: ['credits', 'active'],
    queryFn: () => window.api.credits.getActiveCredits(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function usePartialCredits() {
  return useQuery({
    queryKey: ['credits', 'partial'],
    queryFn: () => window.api.credits.getPartialCredits(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCustomerCredits(customerId: number) {
  return useQuery({
    queryKey: ['credits', 'customer', customerId],
    queryFn: () => window.api.credits.getByCustomer(customerId),
    enabled: !!customerId,
  })
}

export function useCreateCredit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (creditData: any) => window.api.credits.create(creditData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      sileo.success({
        title: 'Crédito creado exitosamente',
      })
    },
    onError: error => {
      sileo.error({
        title: 'Error al crear crédito',
        description: parseError(error),
      })
    },
  })
}

export function useUpdateCredit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      window.api.credits.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['credits'] })
      queryClient.invalidateQueries({ queryKey: ['credits', id] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      sileo.success({
        title: 'Crédito actualizado exitosamente',
      })
    },
    onError: error => {
      sileo.error({
        title: 'Error al actualizar crédito',
        description: parseError(error),
      })
    },
  })
}

export function useDeleteCredit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => window.api.credits.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      sileo.success({
        title: 'Crédito eliminado exitosamente',
      })
    },
    onError: error => {
      sileo.error({
        title: 'Error al eliminar crédito',
        description: parseError(error),
      })
    },
  })
}

export function useAddCreditPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      creditId,
      paymentData,
    }: {
      creditId: number
      paymentData: any
    }) => window.api.credits.addPayment(creditId, paymentData),
    onSuccess: (_, { creditId }) => {
      queryClient.invalidateQueries({ queryKey: ['credits'] })
      queryClient.invalidateQueries({ queryKey: ['credits', creditId] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      sileo.success({
        title: 'Pago registrado exitosamente',
      })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al registrar pago',
        description: parseError(error),
      })
    },
  })
}

export function useCancelCredit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => window.api.credits.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['credits'] })
      queryClient.invalidateQueries({ queryKey: ['credits', id] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      sileo.success({
        title: 'Crédito cancelado exitosamente',
      })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al cancelar crédito',
        description: parseError(error),
      })
    },
  })
}

export function useGenerateCreditNumber() {
  return useQuery({
    queryKey: ['credits', 'generate-number'],
    queryFn: () => window.api.credits.generateCreditNumber(),
    staleTime: 0,
    gcTime: 0,
  })
}

export function useGeneratePaymentNumber() {
  return useQuery({
    queryKey: ['credits', 'generate-payment-number'],
    queryFn: () => window.api.credits.generatePaymentNumber(),
    staleTime: 0,
    gcTime: 0,
  })
}

export function useCreditsStats(dateFrom?: Date, dateTo?: Date) {
  return useQuery({
    queryKey: ['credits', 'stats', dateFrom, dateTo],
    queryFn: () => window.api.credits.getCreditsStats(dateFrom, dateTo),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useCalculateLateFees(creditId: number) {
  return useQuery({
    queryKey: ['credits', creditId, 'late-fees'],
    queryFn: () => window.api.credits.calculateLateFees(creditId),
    enabled: !!creditId,
  })
}
