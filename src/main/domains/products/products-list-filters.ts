export type ProductsListFilters = {
  search?: string
  categories?: number[]
  status?: string[]
  lowStock?: boolean
  page?: number
  pageSize?: number
}
