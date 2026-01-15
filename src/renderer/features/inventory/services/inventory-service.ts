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
}
