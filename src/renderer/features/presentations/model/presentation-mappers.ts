export const presentationToForm = (
  presentation: Presentation
): PresentationFormInput => ({
  id: presentation.id,
  name: presentation.name,
  image: presentation.image || '',
  barcode: presentation.barcode || '',
  sku: presentation.sku || '',
  description: presentation.description || '',
  unit: presentation.unit,
  salePrice: presentation.salePrice / 100,
  isActive: presentation.isActive,
  factor: presentation.factor || 1,
  factorType: presentation.factorType,
  productId: presentation.productId,
  unitPrecision: presentation.unitPrecision,
})
