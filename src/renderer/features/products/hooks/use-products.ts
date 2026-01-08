export const useProducts = () =>
  useQuery({
    queryKey: productKeys.all,
    queryFn: productService.list,
  })