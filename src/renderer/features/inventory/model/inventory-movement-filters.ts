export type InventoryMovementFilters = {
  productId?: number
  type?: 'IN' | 'OUT' | 'ADJUST'
  dateFrom?: string
  dateTo?: string
}