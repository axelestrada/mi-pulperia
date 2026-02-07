import { PresentationsListFilters } from 'shared/types/presentations'
import { toPresentationDTO } from './presentations-mappers'
import {
  NewPresentationDTO,
  PresentationDTO,
  UpdatePresentationDTO,
} from './presentations-model'
import { PresentationsRepository } from './presentations-repository'
import { PaginatedResult } from 'shared/types/pagination'

import { UNIT_CONFIG } from 'main/domains/products/products-units'

export const PresentationsService = {
  async list(
    filters: PresentationsListFilters = {}
  ): Promise<PaginatedResult<PresentationDTO>> {
    const { page = 1, pageSize = 20 } = filters

    const result = await PresentationsRepository.findAll({
      ...filters,
      page,
      pageSize,
    })

    return result
  },

  async listByProduct(productId: number) {
    const rows = await PresentationsRepository.findByProductId(productId)

    return rows.map(toPresentationDTO)
  },

  async create(input: NewPresentationDTO) {
    if (!input.name.trim()) {
      throw new Error('El nombre del producto es obligatorio')
    }

    if (!input.salePrice || input.salePrice <= 0) {
      throw new Error('El precio de venta es obligatorio')
    }

    const unitConfig = UNIT_CONFIG[input.unit]

    if (!unitConfig) {
      throw new Error('Unidad inválida')
    }

    const row = await PresentationsRepository.create({
      ...input,
      factor: input.factorType === 'fixed' ? input.factor : null,
      unitPrecision: unitConfig.unitPrecision,
    })

    return toPresentationDTO(row)
  },

  async update(id: number, input: UpdatePresentationDTO) {
    const row = await PresentationsRepository.update(id, input)

    return toPresentationDTO(row)
  },

  async toggleActive(id: number) {
    await PresentationsRepository.toggleActive(id)
  },

  async delete(id: number) {
    await PresentationsRepository.delete(id)
  },
}
