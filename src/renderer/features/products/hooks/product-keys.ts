import { ProductsListFilters } from '~/src/main/domains/products/products-list-filters'
import { ProductDTO } from '~/src/main/domains/products/products-model'

export const productKeys = {
  all: ['products'] as const,
  list: (filters?: ProductsListFilters) =>
    [...productKeys.all, 'list', filters] as const,
  detail: (id: ProductDTO['id']) => ['products', id] as const,
}
