import { PresentationDTO, PresentationRow } from './presentations-model'

export const toPresentationDTO = (row: PresentationRow): PresentationDTO => ({
  id: row.id,
  productId: row.productId,
  isBase: row.isBase,

  name: row.name,
  description: row.description,

  image: row.image,
  sku: row.sku,
  barcode: row.barcode,

  unit: row.unit,
  unitPrecision: row.unitPrecision,

  factorType: row.factorType,
  factor: row.factor,

  salePrice: row.salePrice,
  status: row.status,
  createdAt: row.createdAt,
})
