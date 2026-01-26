export const purchaseOrderAdapter = {
  list() {
    return window.api.purchaseOrders.list()
  },

  create(payload: PurchaseOrderFormData) {
    return window.api.purchaseOrders.create(payload)
  },

  update(id: PurchaseOrder['id'], payload: Partial<PurchaseOrderFormData>) {
    return window.api.purchaseOrders.update(id, payload)
  },

  remove(id: PurchaseOrder['id']) {
    return window.api.purchaseOrders.remove(id)
  },

  getById(id: PurchaseOrder['id']) {
    return window.api.purchaseOrders.getById(id)
  },

  getBySupplier(supplierId: number) {
    return window.api.purchaseOrders.getBySupplier(supplierId)
  },

  updateStatus(id: PurchaseOrder['id'], status: PurchaseOrder['status']) {
    return window.api.purchaseOrders.updateStatus(id, status)
  },

  generateOrderNumber() {
    return window.api.purchaseOrders.generateOrderNumber()
  },

  sendToSupplier(id: PurchaseOrder['id']) {
    return window.api.purchaseOrders.sendToSupplier(id)
  },

  markAsCompleted(id: PurchaseOrder['id']) {
    return window.api.purchaseOrders.markAsCompleted(id)
  },

  cancel(id: PurchaseOrder['id'], reason?: string) {
    return window.api.purchaseOrders.cancel(id, reason)
  },
}
