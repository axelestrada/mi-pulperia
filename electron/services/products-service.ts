import { ProductsRepository } from '../main/repositories/products-repository'

type CreateProductInput = {
  name: string
}

export const ProductsService = {
  async list() {
    console.log('ProductsService.list called')
    return await ProductsRepository.findAll()
  },

  async getById(id: number) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid product id')
    }

    const product = await ProductsRepository.findById(id)

    if (!product) {
      throw new Error('Product not found')
    }

    return product
  },

  async create(input: CreateProductInput) {
    if (!input.name.trim()) {
      throw new Error('Product name is required')
    }

    return ProductsRepository.create({
      name: input.name.trim(),
    })
  },
}
