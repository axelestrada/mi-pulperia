import { InsertProduct, SelectProduct } from 'main/db/schema/products'
import { ProductsRepository } from './products-repository'
import { toProductDTO } from './products-mappers'

export const ProductsService = {
  async list() {
    const products = await ProductsRepository.findAll()
    return products.map(toProductDTO)
  },

  async create(input: InsertProduct) {
    if (!input.name.trim()) {
      throw new Error('El nombre del producto es obligatorio')
    }

    return ProductsRepository.create(input)
  },

  async update(id: SelectProduct['id'], input: Partial<SelectProduct>) {
    if (!Number.isInteger(id)) {
      throw new Error('ID inválido para el producto')
    }

    if (input.name?.trim() === '') {
      throw new Error('El nombre del producto es obligatorio')
    }

    return ProductsRepository.update(id, input)
  },

  async remove(id: SelectProduct['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('ID inválido para el producto')
    }

    return ProductsRepository.delete(id)
  },
}
