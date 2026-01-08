export const categoryAdapter = {
  list() {
    return window.api.categories.list()
  },

  create(payload: CategoryFormData) {
    return window.api.categories.create(payload)
  },

  update(id: Category['id'], payload: Partial<Category>) {
    return window.api.categories.update(id, payload)
  },

  remove(id: Category['id']) {
    return window.api.categories.remove(id)
  },
}
