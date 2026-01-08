export const productService = {
  async list() {
    const data = await productAdapter.list()

    return productSchema.array().parse(data)
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
