import { ProductRow, ProductDTO } from './products-model'

export function toProductDTO(row: ProductRow): ProductDTO {
  console.log('row', row)

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    baseUnit: row.baseUnit,
    minStock: row.minStock,
    status: row.isActive ? 'active' : 'inactive',
    createdAt: row.createdAt,

    category: {
      id: row.categoryId,
      name: row.categoryName,
    },

    salePrice: row.salePrice,
    sku: row.sku,
    barcode: row.barcode,
    image: row.image,

    stock: row.stock,
    lowStock: row.stock <= row.minStock,
    outOfStock: row.stock <= 0,
    presentationsCount: row.presentationsCount,

    hasExpiredBatches: Boolean(row.hasExpiredBatches),
    hasExpiringBatches: Boolean(row.hasExpiringBatches),
    expiredBatchesCount: row.expiredBatchesCount,
    expiringBatchesCount: row.expiringBatchesCount,
  }
}
