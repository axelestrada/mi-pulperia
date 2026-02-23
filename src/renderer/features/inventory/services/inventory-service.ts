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
    const result = await inventoryAdapter.listBatches(filters)
    return {
      ...result,
      data: batchSchema.array().parse(result.data),
    }
  },

  async listMovements(filters: InventoryMovementFilters) {
    const result = await inventoryAdapter.listMovements(filters)
    return {
      ...result,
      data: movementSchema.array().parse(result.data),
    }
  },
}
