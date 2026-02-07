import { ProductDTO } from '~/src/main/domains/products/products-model'

export const productToForm = (product: ProductDTO): Partial<ProductFormInput> => {
  const basePresentation = product.presentations.find(
    (p) => p.isBase
  )

  return {
    id: product.id,
    name: product.name,
    image: product.image || '',
    barcode: basePresentation?.barcode || '',
    sku: basePresentation?.sku || '',
    description: product.description || '',
    categoryId: product.category.id || undefined,
    baseUnit: product.baseUnit,
    salePrice: fromCents(basePresentation?.salePrice || 0),
    minStock: product.minStock,
  }
}
