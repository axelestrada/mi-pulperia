export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: Product['id']) => productService.remove(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      })
    },
  })
}
