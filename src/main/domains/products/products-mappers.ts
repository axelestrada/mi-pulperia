import { ProductRow, ProductDTO } from './products-model'

export function toProductDTO(row: ProductRow): ProductDTO {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    baseUnit: row.baseUnit,
    minStock: row.minStock,
    isActive: !!row.isActive,
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
    presentationsCount: row.presentationsCount,
  }
}
