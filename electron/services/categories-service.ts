import { CategoriesRepository } from '../main/repositories/categories-repository'

type CreateCategoryInput = {
  name: string
}

export const CategoriesService = {
  async list() {
    return CategoriesRepository.findAll()
  },

  async getById(id: number) {
    if (!Number.isInteger(id)) {
      throw new Error('Invalid category id')
    }

    const category = await CategoriesRepository.findById(id)

    if (!category) {
      throw new Error('Category not found')
    }

    return category
  },

  async create(input: CreateCategoryInput) {
    if (!input.name.trim()) {
      throw new Error('Category name is required')
    }

    return CategoriesRepository.create({
      name: input.name.trim(),
    })
  },
}
