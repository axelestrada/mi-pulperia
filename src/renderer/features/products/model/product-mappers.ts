export const productToForm = (product: Product): ProductFormData => ({
  id: product.id,
  name: product.name,
  description: product.description ?? '',
  categoryId: product.categoryId ?? undefined,
  baseUnit: product.baseUnit,
  salePrice: product.salePrice / 100,
  minStock: product.minStock,
  isActive: product.isActive,
})
