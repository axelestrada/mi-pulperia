export type UnitType = 'unit' | 'lb' | 'liter'

export const UNIT_CONFIG: Record<
  UnitType,
  { label: string; unitPrecision: number }
> = {
  unit: {
    label: 'Unidad',
    unitPrecision: 1,
  },
  lb: {
    label: 'Libra',
    unitPrecision: 1000,
  },
  liter: {
    label: 'Litro',
    unitPrecision: 1000,
  },
}
