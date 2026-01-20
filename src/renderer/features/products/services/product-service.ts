export const productService = {
  async list() {
    const result = await productAdapter.list()

    const { data, error } = productSchema.array().safeParse(result.data)

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

  async update(id: Product['id'], payload: Partial<ProductFormData>) {
    await productAdapter.update(id, payload)
  },

  async remove(id: Product['id']) {
    await productAdapter.remove(id)
  },
}
