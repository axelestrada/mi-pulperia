type UpdateProductInput = {
  id: Product['id']
  data: Partial<ProductFormData>
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: UpdateProductInput) =>
      productService.update(id, data),

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: productKeys.detail(id),
      })
    },
  })
}