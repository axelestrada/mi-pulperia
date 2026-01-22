import { InsertPresentation } from '../../db/schema/presentations'

export type UnitType = 'unit' | 'lb' | 'liter'
export type FactorType = 'fixed' | 'variable'

export type PresentationRow = {
  id: number
  productId: number
  isBase: boolean

  name: string
  description: string | null

  image: string | null
  sku: string | null
  barcode: string | null

  unit: UnitType
  unitPrecision: number

  factorType: FactorType
  factor: number | null

  salePrice: number
  isActive: boolean
  createdAt: Date
}

export type PresentationDTO = {
  id: number
  productId: number
  isBase: boolean

  name: string
  description: string | null

  image: string | null
  sku: string | null
  barcode: string | null

  unit: UnitType
  unitPrecision: number

  factorType: FactorType
  factor: number | null

  salePrice: number
  isActive: boolean
  createdAt: Date
}

export type NewPresentationDTO = Omit<InsertPresentation, 'unitPrecision'>

export type UpdatePresentationDTO = Partial<NewPresentationDTO>