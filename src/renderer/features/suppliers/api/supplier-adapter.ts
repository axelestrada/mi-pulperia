export const supplierAdapter = {
  list() {
    return window.api.suppliers.list()
  },

  create(payload: SupplierFormData) {
    return window.api.suppliers.create(payload)
  },

  update(id: Supplier['id'], payload: Partial<SupplierFormData>) {
    return window.api.suppliers.update(id, payload)
  },

  remove(id: Supplier['id']) {
    return window.api.suppliers.remove(id)
  },

  getById(id: Supplier['id']) {
    return window.api.suppliers.getById(id)
  },

  getActiveSuppliers() {
    return window.api.suppliers.getActiveSuppliers()
  },
}
