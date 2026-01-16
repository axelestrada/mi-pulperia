export const inventoryService = {
  async addStock(payload: AddStockPayload) {
    await inventoryAdapter.addStock(payload)
  },

  async consume(payload: ConsumeInventoryPayload) {
    const result = await inventoryAdapter.consume(payload)
    return result
  },

  async adjustStock(payload: AdjustStockPayload) {
    await inventoryAdapter.adjustStock(payload)
  },

  async getAvailableStock(productId: number) {
    const data = await inventoryAdapter.getAvailableStock(productId)
    return data
  },

  async listBatches(filters: InventoryBatchFilters) {
    const data = await inventoryAdapter.listBatches(filters)
    return batchSchema.array().parse(data)
  },

  async listMovements(filters: InventoryMovementFilters) {
    const data = await inventoryAdapter.listMovements(filters)
    return movementSchema.array().parse(data)
  },
}
