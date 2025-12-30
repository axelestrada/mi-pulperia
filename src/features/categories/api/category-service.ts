export const categoryService = {
  async list() {
    const data = await categoryAdapter.list()

    return categorySchema.array().parse(data)
  },

  async create(payload: CategoryFormData) {
    const data = await categoryAdapter.create(payload)
    return categorySchema.parse(data)
  },

  async update(id: Category['id'], payload: Partial<CategoryFormData>) {
    const data = await categoryAdapter.update(id, payload)
    return categorySchema.parse(data)
  },

  async remove(id: Category['id']) {
    await categoryAdapter.remove(id)
  },
}
