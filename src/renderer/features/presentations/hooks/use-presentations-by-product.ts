export function usePresentationsByProduct(productId: number) {
  return useQuery({
    queryKey: presentationKeys.byProduct(productId),
    queryFn: () => presentationsService.listByProduct(productId),
  })
}
