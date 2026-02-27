import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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
      sileo.success({ title: 'Proveedor creado exitosamente' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al crear proveedor',
        description: error.message,
      })
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
      sileo.success({ title: 'Proveedor actualizado exitosamente' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al actualizar proveedor',
        description: error.message,
      })
    },
  })
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: supplierAdapter.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      sileo.success({ title: 'Proveedor eliminado exitosamente' })
    },
    onError: (error: Error) => {
      sileo.error({
        title: 'Error al eliminar proveedor',
        description: error.message,
      })
    },
  })
}
