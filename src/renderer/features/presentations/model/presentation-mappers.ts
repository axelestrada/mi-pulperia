export const presentationToForm = (
  presentation: Presentation
): PresentationFormInput => {
  if (presentation.factorType === 'fixed') {
    return {
      id: presentation.id,
      productId: presentation.productId,
      name: presentation.name,
      description: presentation.description || '',
      image: presentation.image || '',
      barcode: presentation.barcode || '',
      sku: presentation.sku || '',
      unit: presentation.unit,
      salePrice: presentation.salePrice / 100,
      isActive: presentation.isActive,
      factorType: 'fixed',
      factor: presentation.factor ?? 1,
    }
  }

  return {
    id: presentation.id,
    productId: presentation.productId,
    name: presentation.name,
    description: presentation.description || '',
    image: presentation.image || '',
    barcode: presentation.barcode || '',
    sku: presentation.sku || '',
    unit: presentation.unit,
    salePrice: presentation.salePrice / 100,
    isActive: presentation.isActive,
    factorType: 'variable',
    factor: 'n',
  }
}
