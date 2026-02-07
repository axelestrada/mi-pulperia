import { ProductsListFilters } from "~/src/main/domains/products/products-list-filters"
import { ProductDTO } from "~/src/main/domains/products/products-model"

export const productAdapter = {
  list(filters?: ProductsListFilters) {
    return window.api.products.list(filters)
  },

  create(payload: ProductFormData) {
    return window.api.products.create(payload)
  },

  update(id: ProductDTO['id'], payload: Partial<ProductFormData>) {
    return window.api.products.update(id, payload)
  },

  remove(id: ProductDTO['id']) {
    return window.api.products.remove(id)
  },
}
