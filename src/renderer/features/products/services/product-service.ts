import type { ProductsListFilters } from '~/src/main/domains/products/products-list-filters'
import {
  type ProductDTO,
  productDTOSchema,
} from '~/src/main/domains/products/products-model'

export const productService = {
  async list(filters?: ProductsListFilters) {
    const result = await productAdapter.list(filters)

    const { data, error } = productDTOSchema.array().safeParse(result.data)

    if (error) {
      console.error('Error al obtener los productos', error)
      throw new Error('Error al obtener los productos')
    }

    return {
      data,
      pagination: {
        totalItems: result.total,
        currentPage: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    }
  },

  async create(payload: ProductFormData) {
    await productAdapter.create(payload)
  },

  async update(id: ProductDTO['id'], payload: ProductFormData) {
    await productAdapter.update(id, payload)
  },

  async remove(id: ProductDTO['id']) {
    await productAdapter.remove(id)
  },

  async toggle(id: ProductDTO['id']) {
    await productAdapter.toggle(id)
  },
}
