import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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
      sileo.success({ title: 'Cliente creado exitosamente' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al crear cliente',
        description: error.message,
      })
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
      sileo.success({ title: 'Cliente actualizado exitosamente' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al actualizar cliente',
        description: error.message,
      })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => window.api.customers.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      sileo.success({ title: 'Cliente eliminado exitosamente' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al eliminar cliente',
        description: error.message,
      })
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
      sileo.success({ title: 'Saldo actualizado exitosamente' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al actualizar saldo',
        description: error.message,
      })
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
      sileo.success({ title: 'Monto agregado al saldo' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al agregar al saldo',
        description: error.message,
      })
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
      sileo.success({ title: 'Monto descontado del saldo' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al descontar del saldo',
        description: error.message,
      })
    },
  })
}

export function useCanExtendCredit() {
  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      window.api.customers.canExtendCredit(id, amount),
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al verificar crédito',
        description: error.message,
      })
    },
  })
}
