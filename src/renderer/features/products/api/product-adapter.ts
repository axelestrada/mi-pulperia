export const productAdapter = {
  list() {
    return window.api.products.list()
  },

  create(payload: ProductFormData) {
    return window.api.products.create(payload)
  },

  update(id: Product['id'], payload: Partial<ProductFormData>) {
    return window.api.products.update(id, payload)
  },

  remove(id: Product['id']) {
    return window.api.products.remove(id)
  },
}
