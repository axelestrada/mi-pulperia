import { productsTable, SelectProduct } from 'main/db/schema/products'
import { ProductsRepository } from './products-repository'
import {
  NewProductDTO,
  ProductDTO,
  productDTOSchema,
  UpdateProductDTO,
} from './products-model'
import { UNIT_CONFIG } from './products-units'
import { ProductsListFilters } from './products-list-filters'
import { PaginatedResult } from 'shared/types/pagination'
import { db } from 'main/db'
import { presentationsTable } from 'main/db/schema/presentations'
import { and, eq } from 'drizzle-orm'

const parseUniqueField = (message: string): 'barcode' | 'sku' | null => {
  if (message.includes('presentations.barcode')) return 'barcode'
  if (message.includes('presentations.sku')) return 'sku'
  return null
}

const toDomainError = (error: unknown) => {
  if (!(error instanceof Error))
    return new Error('Error al guardar el producto')

  const field = parseUniqueField(error.message)
  if (field === 'barcode') {
    return new Error('El código de barras ya existe en otra presentación')
  }
  if (field === 'sku') {
    return new Error('El SKU ya existe en otra presentación')
  }

  return error
}

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

    try {
      await db.transaction(async tx => {
        const [product] = await tx
          .insert(productsTable)
          .values({
            name: input.name,
            description: input.description,
            categoryId: input.categoryId,
            baseUnit: input.baseUnit,
            unitPrecision: unitConfig.unitPrecision,
            minStock: input.minStock,
          })
          .returning()

        await tx.insert(presentationsTable).values({
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
          factor: product.unitPrecision,
          salePrice: input.salePrice,
        })
      })
    } catch (error) {
      throw toDomainError(error)
    }
  },

  async update(id: SelectProduct['id'], input: UpdateProductDTO) {
    if (!Number.isInteger(id)) {
      throw new Error('ID inválido para el producto')
    }

    if (input.name?.trim() === '') {
      throw new Error('El nombre del producto es obligatorio')
    }

    const unitConfig = UNIT_CONFIG[input.baseUnit]
    if (!unitConfig) {
      throw new Error('Unidad base invÃ¡lida')
    }

    try {
      await db.transaction(async tx => {
        await tx
          .update(productsTable)
          .set({
            name: input.name,
            description: input.description,
            categoryId: input.categoryId,
            baseUnit: input.baseUnit,
            unitPrecision: unitConfig.unitPrecision,
            minStock: input.minStock,
            updatedAt: new Date(),
          })
          .where(eq(productsTable.id, id))

        await tx
          .update(presentationsTable)
          .set({
            image: input.image,
            sku: input.sku,
            barcode: input.barcode,
            unit: input.baseUnit,
            unitPrecision: unitConfig.unitPrecision,
            factor: unitConfig.unitPrecision,
            salePrice: input.salePrice,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(presentationsTable.productId, id),
              eq(presentationsTable.isBase, true),
              eq(presentationsTable.deleted, false)
            )
          )
      })
    } catch (error) {
      throw toDomainError(error)
    }
  },

  async toggle(id: SelectProduct['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('ID inválido para el producto')
    }

    return ProductsRepository.toggle(id)
  },

  async remove(id: SelectProduct['id']) {
    if (!Number.isInteger(id)) {
      throw new Error('ID inválido para el producto')
    }

    return ProductsRepository.delete(id)
  },
}
