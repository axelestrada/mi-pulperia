export const categoryService = {
  async list() {
    const data = await categoryAdapter.list()

    return categorySchema.array().parse(data)
  },

  async create(payload: CategoryFormData) {
   await categoryAdapter.create(payload)
  },

  async update(id: Category['id'], payload: Partial<Category>) {
    await categoryAdapter.update(id, payload)
  },

  async remove(id: Category['id']) {
    await categoryAdapter.remove(id)
  },
}
