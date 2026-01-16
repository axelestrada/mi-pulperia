export type InventoryBatchFilters = {
  productId?: number
  supplierId?: number
  batchId?: number
  batchCode?: string

  hasStock?: boolean
  expired?: boolean
  expiresBefore?: Date
  expiresAfter?: Date

  searchTerm?: string

  page?: number
  pageSize?: number
}