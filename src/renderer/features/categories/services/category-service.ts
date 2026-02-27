import type { CategoriesListFilters } from 'shared/types/categories'

export const categoryService = {
  async list(filters?: CategoriesListFilters) {
    const result = await categoryAdapter.list(filters)

    const { data, error } = categorySchema.array().safeParse(result.data)

    if (error) {
      console.error('Error al obtener las categorias', error)
      throw new Error('Error al obtener las categorias')
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
