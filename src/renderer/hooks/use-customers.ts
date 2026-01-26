import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Customer {
  id: number
  name: string
  email?: string
  phone?: string
  document?: string
  documentType?: 'cedula' | 'passport' | 'ruc'
  address?: string
  city?: string
  creditLimit: number
  currentBalance: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  deleted: boolean
}

export interface CustomersFilters {
  search?: string
  isActive?: boolean
  documentType?: 'cedula' | 'passport' | 'ruc'
  page?: number
  limit?: number
  sortBy?: 'name' | 'createdAt' | 'currentBalance'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateCustomerInput {
  name: string
  email?: string
  phone?: string
  document?: string
  documentType?: 'cedula' | 'passport' | 'ruc'
  address?: string
  city?: string
  creditLimit?: number
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  isActive?: boolean
}

// Query keys
export const customersKeys = {
  all: ['customers'] as const,
  lists: () => [...customersKeys.all, 'list'] as const,
  list: (filters: CustomersFilters) => [...customersKeys.lists(), filters] as const,
  details: () => [...customersKeys.all, 'detail'] as const,
  detail: (id: number) => [...customersKeys.details(), id] as const,
  activeForSelection: () => [...customersKeys.all, 'activeForSelection'] as const,
  withOutstandingBalance: () => [...customersKeys.all, 'withOutstandingBalance'] as const,
}

// Queries
export const useCustomers = (filters: CustomersFilters = {}) => {
  return useQuery({
    queryKey: customersKeys.list(filters),
    queryFn: () => window.electron.ipcRenderer.invoke('customers:list', filters),
  })
}

export const useCustomer = (id: number) => {
  return useQuery({
    queryKey: customersKeys.detail(id),
    queryFn: () => window.electron.ipcRenderer.invoke('customers:getById', id),
    enabled: !!id,
  })
}

export const useCustomerByDocument = (document: string) => {
  return useQuery({
    queryKey: [...customersKeys.all, 'byDocument', document],
    queryFn: () => window.electron.ipcRenderer.invoke('customers:getByDocument', document),
    enabled: !!document,
  })
}

export const useActiveCustomersForSelection = () => {
  return useQuery({
    queryKey: customersKeys.activeForSelection(),
    queryFn: () => window.electron.ipcRenderer.invoke('customers:getActiveForSelection'),
  })
}

export const useCustomersWithOutstandingBalance = () => {
  return useQuery({
    queryKey: customersKeys.withOutstandingBalance(),
    queryFn: () => window.electron.ipcRenderer.invoke('customers:getWithOutstandingBalance'),
  })
}

export const useCanExtendCredit = (id: number, amount: number) => {
  return useQuery({
    queryKey: [...customersKeys.all, 'canExtendCredit', id, amount],
    queryFn: () => window.electron.ipcRenderer.invoke('customers:canExtendCredit', id, amount),
    enabled: !!id && amount > 0,
  })
}

// Mutations
export const useCreateCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCustomerInput) =>
      window.electron.ipcRenderer.invoke('customers:create', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: customersKeys.activeForSelection() })
    },
  })
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateCustomerInput }) =>
      window.electron.ipcRenderer.invoke('customers:update', id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: customersKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: customersKeys.activeForSelection() })
      queryClient.invalidateQueries({ queryKey: customersKeys.withOutstandingBalance() })
    },
  })
}

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      window.electron.ipcRenderer.invoke('customers:remove', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: customersKeys.activeForSelection() })
      queryClient.invalidateQueries({ queryKey: customersKeys.withOutstandingBalance() })
    },
  })
}

export const useUpdateCustomerBalance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newBalance }: { id: number; newBalance: number }) =>
      window.electron.ipcRenderer.invoke('customers:updateBalance', id, newBalance),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: customersKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: customersKeys.withOutstandingBalance() })
    },
  })
}

export const useAddToCustomerBalance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      window.electron.ipcRenderer.invoke('customers:addToBalance', id, amount),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: customersKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: customersKeys.withOutstandingBalance() })
    },
  })
}

export const useSubtractFromCustomerBalance = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      window.electron.ipcRenderer.invoke('customers:subtractFromBalance', id, amount),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: customersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: customersKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: customersKeys.withOutstandingBalance() })
    },
  })
}
