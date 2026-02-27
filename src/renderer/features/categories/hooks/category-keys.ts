import type { CategoriesListFilters } from 'shared/types/categories'

export const categoryKeys = {
  all: ['categories'] as const,
  list: (filters?: CategoriesListFilters) =>
    [...categoryKeys.all, 'list', filters] as const,
  detail: (id: Category['id']) => ['categories', id] as const,
}
