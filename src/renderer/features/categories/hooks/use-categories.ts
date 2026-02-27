import { keepPreviousData } from '@tanstack/react-query'
import type { CategoriesListFilters } from 'shared/types/categories'

export const useCategories = (filters?: CategoriesListFilters) =>
  useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: () => categoryService.list(filters),
    placeholderData: keepPreviousData,
  })
