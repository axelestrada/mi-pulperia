export type ProductRow = {
  id: number
  name: string
  description: string | null
  baseUnit: 'unit' | 'lb' | 'liter'
  minStock: number
  isActive: boolean | number
  createdAt: Date
  categoryId: number | null
  categoryName: string | null
  salePrice: number | null
  sku: string | null
  barcode: string | null
  image: string | null
  stock: number
  presentationsCount: number
  hasExpiredBatches: number
  hasExpiringBatches: number
  expiredBatchesCount: number
  expiringBatchesCount: number
}

export type ProductDTO = {
  id: number
  name: string
  barcode: string | null
  salePrice: number | null
  baseUnit: 'unit' | 'lb' | 'liter'
  category: {
    id: number | null
    name: string | null
  }
  stock: number
  createdAt: Date
  description: string | null
  image: string | null
  status: 'active' | 'inactive'
  minStock: number
  lowStock: boolean
  outOfStock: boolean
  sku: string | null
  presentationsCount: number

  hasExpiredBatches: boolean
  hasExpiringBatches: boolean
  expiredBatchesCount: number
  expiringBatchesCount: number
}

export type NewProductDTO = {
  name: string
  description: string | null
  categoryId: number
  baseUnit: 'unit' | 'lb' | 'liter'
  minStock: number
  salePrice: number
  sku: string | null
  barcode: string | null
  image: string | null
}
