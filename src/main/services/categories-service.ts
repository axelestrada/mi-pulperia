import { InsertCategory, SelectCategory } from '../db/schema/categories'
import { CategoriesRepository } from '../repositories/categories-repository'
import { PaginatedResult } from 'shared/types/pagination'
import { CategoriesListFilters } from 'shared/types/categories'

export const CategoriesService = {
  async list(
    filters: CategoriesListFilters = {}
  ): Promise<PaginatedResult<SelectCategory>> {
    const { page = 1, pageSize = 10 } = filters

    const rows = await CategoriesRepository.findAll({
      ...filters,
      page,
      pageSize,
    })

    const total = rows[0]?.total ?? 0
    const data = rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deleted: row.deleted,
    }))

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
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
