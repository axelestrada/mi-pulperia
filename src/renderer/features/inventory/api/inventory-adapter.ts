export type AddStockPayload = {
  productId: number
  supplierId?: number | null
  batchCode: string | null
  expirationDate?: Date | null
  quantity: number
  unitCost: number
  referenceType?: string
  referenceId?: number
}

export type ConsumeInventoryPayload = {
  productId: number
  quantity: number
  reason: string
  referenceType?: string
  referenceId?: number
}

export type AdjustStockPayload = {
  batchId: number
  productId: number
  quantityDelta: number
  reason: string
  referenceType?: string
  referenceId?: number
}

export const inventoryAdapter = {
  addStock(payload: AddStockPayload) {
    return window.api.inventory.addStock(payload)
  },

  consume(payload: ConsumeInventoryPayload) {
    return window.api.inventory.consume(payload)
  },

  adjustStock(payload: AdjustStockPayload) {
    return window.api.inventory.adjustStock(payload)
  },

  getAvailableStock(productId: number) {
    return window.api.inventory.getAvailableStock(productId)
  },
}