import { Category } from './category-types'

export const categoryToForm = (category: Category): CategoryFormData => ({
  id: category.id,
  name: category.name,
  description: category.description || '',
  isActive: category.isActive,
})
