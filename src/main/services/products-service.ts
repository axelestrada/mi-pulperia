import { InsertProduct, SelectProduct } from '../db/schema/products'
import { ProductsRepository } from '../repositories/products-repository'

export const ProductsService = {
  async list() {
    return ProductsRepository.findAll()
  },

  async create(input: InsertProduct) {
    if (!input.name.trim()) {
      throw new Error('Product name is required')
    }

    return ProductsRepository.create(input)
  },

  async update(id: SelectProduct['id'], input: Partial<SelectProduct>) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid product id')
    }

    if (input.name?.trim() === '') {
      throw new Error('Product name is required')
    }

    return ProductsRepository.update(id, input)
  },

  async remove(id: SelectProduct['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid product id')
    }

    return ProductsRepository.delete(id)
  },
}
