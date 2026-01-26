export const adjustmentAdapter = {
  list() {
    return window.api.inventoryAdjustments.list()
  },

  create(payload: InventoryAdjustmentFormData) {
    return window.api.inventoryAdjustments.create(payload)
  },

  update(id: InventoryAdjustment['id'], payload: Partial<InventoryAdjustmentFormData>) {
    return window.api.inventoryAdjustments.update(id, payload)
  },

  remove(id: InventoryAdjustment['id']) {
    return window.api.inventoryAdjustments.remove(id)
  },

  getById(id: InventoryAdjustment['id']) {
    return window.api.inventoryAdjustments.getById(id)
  },

  approve(id: InventoryAdjustment['id']) {
    return window.api.inventoryAdjustments.approve(id)
  },

  cancel(id: InventoryAdjustment['id']) {
    return window.api.inventoryAdjustments.cancel(id)
  },

  generateAdjustmentNumber() {
    return window.api.inventoryAdjustments.generateAdjustmentNumber()
  },

  getAvailableBatches(productId?: number) {
    return window.api.inventoryAdjustments.getAvailableBatches(productId)
  },

  getBatchInfo(batchId: number) {
    return window.api.inventoryAdjustments.getBatchInfo(batchId)
  },
}
