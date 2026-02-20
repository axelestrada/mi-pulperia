export const Units = ['unit', 'lb', 'liter'] as const

export type UnitType = (typeof Units)[number]

export const UNIT_CONFIG: Record<
  UnitType,
  { label: string; unitPrecision: number }
> = {
  unit: {
    label: 'ud',
    unitPrecision: 1,
  },
  lb: {
    label: 'lb',
    unitPrecision: 10,
  },
  liter: {
    label: 'l',
    unitPrecision: 10,
  },
}
