import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useCustomers(filters?: any) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => window.api.customers.list(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCustomer(id: number) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => window.api.customers.getById(id),
    enabled: !!id,
  })
}

export function useCustomerByDocument(document: string) {
  return useQuery({
    queryKey: ['customers', 'document', document],
    queryFn: () => window.api.customers.getByDocument(document),
    enabled: !!document,
  })
}

export function useActiveCustomers() {
  return useQuery({
    queryKey: ['customers', 'active'],
    queryFn: () => window.api.customers.getActiveForSelection(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCustomersWithBalance() {
  return useQuery({
    queryKey: ['customers', 'with-balance'],
    queryFn: () => window.api.customers.getWithOutstandingBalance(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (customerData: any) =>
      window.api.customers.create(customerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Cliente creado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al crear cliente: ${error.message}`)
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      window.api.customers.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customers', id] })
      toast.success('Cliente actualizado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar cliente: ${error.message}`)
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => window.api.customers.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Cliente eliminado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar cliente: ${error.message}`)
    },
  })
}

export function useUpdateCustomerBalance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newBalance }: { id: number; newBalance: number }) =>
      window.api.customers.updateBalance(id, newBalance),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customers', id] })
      toast.success('Saldo actualizado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar saldo: ${error.message}`)
    },
  })
}

export function useAddToCustomerBalance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      window.api.customers.addToBalance(id, amount),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customers', id] })
      toast.success('Monto agregado al saldo')
    },
    onError: (error: Error) => {
      toast.error(`Error al agregar al saldo: ${error.message}`)
    },
  })
}

export function useSubtractFromCustomerBalance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      window.api.customers.subtractFromBalance(id, amount),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customers', id] })
      toast.success('Monto descontado del saldo')
    },
    onError: (error: Error) => {
      toast.error(`Error al descontar del saldo: ${error.message}`)
    },
  })
}

export function useCanExtendCredit() {
  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      window.api.customers.canExtendCredit(id, amount),
    onError: (error: Error) => {
      toast.error(`Error al verificar crédito: ${error.message}`)
    },
  })
}
