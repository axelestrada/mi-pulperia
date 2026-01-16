export const useAddStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: inventoryService.addStock,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.stock(variables.productId),
      })

      queryClient.invalidateQueries({
        queryKey: inventoryKeys.batches.all(),
      })

      queryClient.invalidateQueries({
        queryKey: inventoryKeys.movements.all(),
      })
    },
  })
}
