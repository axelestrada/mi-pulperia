export const productToForm = (product: Product): ProductFormInput => ({
  id: product.id,
  name: product.name,
  image: product.image || '',
  barcode: product.barcode || '',
  sku: product.sku || '',
  description: product.description || '',
  categoryId: product.categoryId,
  baseUnit: product.baseUnit,
  salePrice: product.salePrice / 100,
  minStock: product.minStock,
  isActive: product.isActive,
})
