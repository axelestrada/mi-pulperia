export const useCategories = () =>
  useQuery({
    queryKey: categoryKeys.all,
    queryFn: categoryService.list,
  })