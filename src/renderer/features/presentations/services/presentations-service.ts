import { PresentationsListFilters } from "shared/types/presentations"

export const presentationsService = {
  async list(filters: PresentationsListFilters) {
    const result = await presentationsAdapter.list(filters)

    const { data, error } = presentationSchema.array().safeParse(result.data)

    if (error) {
      console.error('Error al obtener los productos', error)
      throw new Error('Error al obtener los productos')
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

  async listByProduct(productId: number) {
    const result = await presentationsAdapter.listByProduct(productId)

    const { data, error } = presentationSchema.array().safeParse(result)

    if (error) {
      console.error('Error al obtener las presentaciones', error)
      throw new Error('Error al obtener las presentaciones')
    }

    return data
  },

  async create(payload: PresentationFormData) {
    await presentationsAdapter.create(payload)
  },

  async update(id: number, payload: Partial<PresentationFormData>) {
    await presentationsAdapter.update(id, payload)
  },

  async toggleActive(id: number, isActive: boolean) {
    await presentationsAdapter.toggleActive(id, isActive)
  },
}
