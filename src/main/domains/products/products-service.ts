import { SelectProduct } from 'main/db/schema/products'
import { ProductsRepository } from './products-repository'
import { NewProductDTO, ProductDTO, productDTOSchema } from './products-model'
import { PresentationsRepository } from '../presentations/presentations-repository'
import { UNIT_CONFIG } from './products-units'
import { ProductsListFilters } from './products-list-filters'
import { PaginatedResult } from 'shared/types/pagination'

export const ProductsService = {
  async list(
    filters: ProductsListFilters = {}
  ): Promise<PaginatedResult<ProductDTO>> {
    const { page = 1, pageSize = 20 } = filters

    const rows = await ProductsRepository.findAll({
      ...filters,
      page,
      pageSize,
    })

    const total = rows[0]?.total ?? 0

    return {
      data: productDTOSchema.array().parse(rows),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  },

  async create(input: NewProductDTO) {
    if (!input.name.trim()) {
      throw new Error('El nombre del producto es obligatorio')
    }

    if (!input.salePrice || input.salePrice <= 0) {
      throw new Error('El precio de venta es obligatorio')
    }

    const unitConfig = UNIT_CONFIG[input.baseUnit]

    if (!unitConfig) {
      throw new Error('Unidad base inválida')
    }

    const [product] = await ProductsRepository.create({
      name: input.name,
      description: input.description,
      categoryId: input.categoryId,
      baseUnit: input.baseUnit,
      unitPrecision: unitConfig.unitPrecision,
      minStock: input.minStock,
    })

    await PresentationsRepository.create({
      productId: product.id,
      isBase: true,
      name: unitConfig.label,
      description: product.description,
      image: input.image,
      sku: input.sku,
      barcode: input.barcode,
      unit: product.baseUnit,
      unitPrecision: product.unitPrecision,
      factorType: 'fixed',
      factor: 1,
      salePrice: input.salePrice,
    })
  },

  async update(id: SelectProduct['id'], input: Partial<SelectProduct>) {
    if (!Number.isInteger(id)) {
      throw new Error('ID inválido para el producto')
    }

    if (input.name?.trim() === '') {
      throw new Error('El nombre del producto es obligatorio')
    }

    return ProductsRepository.update(id, input)
  },

  async remove(id: SelectProduct['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('ID inválido para el producto')
    }

    return ProductsRepository.delete(id)
  },
}
