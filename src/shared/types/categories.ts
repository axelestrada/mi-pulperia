export type CategoriesListFilters = {
  search?: string
  status?: Array<'active' | 'inactive'>
  page?: number
  pageSize?: number
}
