import { fromUnitPrecision } from '../../../../shared/utils/quantity'

export const presentationToForm = (
  presentation: Presentation
): PresentationFormInput => {
  const factorValue =
    presentation.factorType === 'fixed'
      ? fromUnitPrecision(
          presentation.factor ?? presentation.unitPrecision,
          presentation.unitPrecision
        )
      : undefined

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
      status: presentation.status,
      factorType: 'fixed',
      factor: factorValue ?? 1,
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
    status: presentation.status,
    factorType: 'variable',
    factor: 'n',
  }
}
