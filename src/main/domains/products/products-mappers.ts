import { EnrichedProduct, ProductDTO } from './products-model'

export const toProductDTO = (product: EnrichedProduct): ProductDTO => ({
  id: product.id,
  name: product.name,
  barcode: product.barcode,
  salePrice: product.salePrice,
  baseUnit: product.baseUnit,
  category: {
    id: product.categoryId,
    name: product.categoryName || 'Sin categoría',
  },
  stock: product.stock,
  createdAt: product.createdAt,
  deleted: product.deleted,
  updatedAt: product.updatedAt,
  description: product.description,
  image: product.image,
  isActive: product.isActive,
  minStock: product.minStock,
  sku: product.sku,
})
