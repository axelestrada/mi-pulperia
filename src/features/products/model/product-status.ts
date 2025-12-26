export const PRODUCT_STATUSES = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'low_stock', label: 'Stock bajo' },
  { value: 'expiring_soon', label: 'Próximos a vencer' },
] as const

export type ProductStatus = (typeof PRODUCT_STATUSES)[number]['value']
