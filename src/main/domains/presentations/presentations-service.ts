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
import { toUnitPrecision } from '../../../shared/utils/quantity'

const parseUniqueField = (message: string): 'barcode' | 'sku' | null => {
  if (message.includes('presentations.barcode')) return 'barcode'
  if (message.includes('presentations.sku')) return 'sku'
  return null
}

const toDomainError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return new Error('Error al guardar la presentación')
  }

  const field = parseUniqueField(error.message)
  if (field === 'barcode') {
    return new Error('El código de barras ya existe en otra presentación')
  }
  if (field === 'sku') {
    return new Error('El SKU ya existe en otra presentación')
  }

  return error
}

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

    try {
      const row = await PresentationsRepository.create({
        ...input,
        factor:
          input.isBase
            ? unitConfig.unitPrecision
            : input.factorType === 'fixed'
            ? Math.max(
                1,
                Number.isInteger(input.factor || 0)
                  ? (input.factor as number)
                  : toUnitPrecision(input.factor || 0, unitConfig.unitPrecision)
              )
            : null,
        factorType: input.isBase ? 'fixed' : input.factorType,
        unitPrecision: unitConfig.unitPrecision,
      })

      return toPresentationDTO(row)
    } catch (error) {
      throw toDomainError(error)
    }
  },

  async update(id: number, input: UpdatePresentationDTO) {
    const current = await PresentationsRepository.findById(id)
    if (!current) {
      throw new Error('PresentaciÃ³n no encontrada')
    }

    const nextUnit = input.unit ?? current.unit
    const unitConfig = UNIT_CONFIG[nextUnit]

    if (!unitConfig) {
      throw new Error('Unidad invÃ¡lida')
    }

    const nextFactorType = input.factorType ?? current.factorType
    const normalizedFactor =
      nextFactorType === 'fixed'
        ? current.isBase
          ? unitConfig.unitPrecision
          : Math.max(
              1,
              Number.isInteger(input.factor ?? current.factor ?? 0)
                ? Number(input.factor ?? current.factor)
                : toUnitPrecision(
                    Number(input.factor ?? current.factor),
                    unitConfig.unitPrecision
                  )
            )
        : null

    try {
      const row = await PresentationsRepository.update(id, {
        ...input,
        unit: nextUnit,
        unitPrecision: unitConfig.unitPrecision,
        factorType: current.isBase ? 'fixed' : nextFactorType,
        factor: normalizedFactor,
      })

      return toPresentationDTO(row)
    } catch (error) {
      throw toDomainError(error)
    }
  },

  async toggleActive(id: number) {
    await PresentationsRepository.toggleActive(id)
  },

  async delete(id: number) {
    await PresentationsRepository.delete(id)
  },
}
