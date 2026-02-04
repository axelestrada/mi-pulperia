export const Units = ['unit', 'lb', 'liter'] as const

export type UnitType = (typeof Units)[number]

export const UNIT_CONFIG: Record<UnitType, { label: string }> = {
  unit: {
    label: 'uds',
  },
  lb: {
    label: 'lb',
  },
  liter: {
    label: 'l',
  },
}
