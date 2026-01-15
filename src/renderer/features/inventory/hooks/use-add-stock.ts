export const useAddStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: inventoryService.addStock,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.stock(variables.productId),
      })
    },
  })
}