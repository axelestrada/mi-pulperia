import { keepPreviousData } from '@tanstack/react-query'
import type { ProductsListFilters } from '~/src/main/domains/products/products-list-filters'

export const useProducts = (filters?: ProductsListFilters) =>
  useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productService.list(filters),
    placeholderData: keepPreviousData,
  })
