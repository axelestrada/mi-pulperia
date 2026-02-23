import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { supplierAdapter } from '../api/supplier-adapter'

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: supplierAdapter.list,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useActiveSuppliers() {
  return useQuery({
    queryKey: ['suppliers', 'active'],
    queryFn: supplierAdapter.getActiveSuppliers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useSupplier(id: number) {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => supplierAdapter.getById(id),
    enabled: !!id,
  })
}

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: supplierAdapter.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Proveedor creado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al crear proveedor: ${error.message}`)
    },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<SupplierFormData>
    }) => supplierAdapter.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      queryClient.invalidateQueries({ queryKey: ['suppliers', id] })
      toast.success('Proveedor actualizado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar proveedor: ${error.message}`)
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: supplierAdapter.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Proveedor eliminado exitosamente')
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar proveedor: ${error.message}`)
    },
  })
}
