export type ProductsListFilters = {
  categories?: number[]
  status?: Array<'active' | 'inactive'>
  lowStock?: boolean
  expired?: boolean
  expiringSoon?: boolean
  search?: string
  page?: number
  pageSize?: number
}
