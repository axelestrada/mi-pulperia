export const useToggleProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => productService.toggle(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      })

      queryClient.invalidateQueries({
        queryKey: productKeys.detail(id),
      })
    },
  })
}
