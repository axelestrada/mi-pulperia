import { Product } from './product-types'

export const productToForm = (product: Product): ProductFormData => ({
  id: product.id,
  name: product.name,
})
