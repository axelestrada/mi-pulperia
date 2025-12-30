export const fetchCategories = () => {
  return window.api.categories.list()
}

export const createCategory = (category: CategoryFormData) => {
  return window.api.categories.create(category)
}
