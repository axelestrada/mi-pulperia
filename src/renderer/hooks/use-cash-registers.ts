import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface CashRegister {
  id: number
  name: string
  location?: string
  status: 'active' | 'inactive'
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CashRegistersFilters {
  search?: string
  status?: 'active' | 'inactive'
  page?: number
  limit?: number
}

export interface CreateCashRegisterInput {
  name: string
  location?: string
  isDefault?: boolean
}

export interface UpdateCashRegisterInput {
  name?: string
  location?: string
  isDefault?: boolean
  status?: 'active' | 'inactive'
}

// Query keys
export const cashRegistersKeys = {
  all: ['cashRegisters'] as const,
  lists: () => [...cashRegistersKeys.all, 'list'] as const,
  list: (filters: CashRegistersFilters) =>
    [...cashRegistersKeys.lists(), filters] as const,
  details: () => [...cashRegistersKeys.all, 'detail'] as const,
  detail: (id: number) => [...cashRegistersKeys.details(), id] as const,
  activeForSelection: () =>
    [...cashRegistersKeys.all, 'activeForSelection'] as const,
}

// Queries
export const useCashRegisters = (filters: CashRegistersFilters = {}) => {
  return useQuery({
    queryKey: cashRegistersKeys.list(filters),
    queryFn: () =>
      window.electron.ipcRenderer.invoke('cash-registers:list', filters),
  })
}

export const useCashRegister = (id: number) => {
  return useQuery({
    queryKey: cashRegistersKeys.detail(id),
    queryFn: () =>
      window.electron.ipcRenderer.invoke('cash-registers:getById', id),
    enabled: !!id,
  })
}

export const useActiveCashRegisters = () => {
  return useQuery({
    queryKey: cashRegistersKeys.activeForSelection(),
    queryFn: (): Promise<CashRegister[]> =>
      window.electron.ipcRenderer.invoke(
        'cash-registers:getActiveForSelection'
      ),
  })
}

// Mutations
export const useCreateCashRegister = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCashRegisterInput) =>
      window.electron.ipcRenderer.invoke('cash-registers:create', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashRegistersKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: cashRegistersKeys.activeForSelection(),
      })
    },
  })
}

export const useUpdateCashRegister = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number
      input: UpdateCashRegisterInput
    }) =>
      window.electron.ipcRenderer.invoke('cash-registers:update', id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: cashRegistersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: cashRegistersKeys.detail(id) })
      queryClient.invalidateQueries({
        queryKey: cashRegistersKeys.activeForSelection(),
      })
    },
  })
}

export const useDeactivateCashRegister = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      window.electron.ipcRenderer.invoke('cash-registers:deactivate', id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: cashRegistersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: cashRegistersKeys.detail(id) })
      queryClient.invalidateQueries({
        queryKey: cashRegistersKeys.activeForSelection(),
      })
    },
  })
}

export const useActivateCashRegister = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) =>
      window.electron.ipcRenderer.invoke('cash-registers:activate', id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: cashRegistersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: cashRegistersKeys.detail(id) })
      queryClient.invalidateQueries({
        queryKey: cashRegistersKeys.activeForSelection(),
      })
    },
  })
}
