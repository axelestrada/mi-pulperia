import { InsertCategory, SelectCategory } from '../db/schema/categories'
import { CategoriesRepository } from '../repositories/categories-repository'

export const CategoriesService = {
  async list() {
    return CategoriesRepository.findAll()
  },

  async create(input: InsertCategory) {
    if (!input.name.trim()) {
      throw new Error('Category name is required')
    }

    return CategoriesRepository.create(input)
  },

  async update(id: SelectCategory['id'], input: Partial<SelectCategory>) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid category id')
    }

    if (input.name?.trim() === '') {
      throw new Error('Category name is required')
    }

    return CategoriesRepository.update(id, input)
  },

  async remove(id: SelectCategory['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid category id')
    }

    return CategoriesRepository.delete(id)
  },
}
