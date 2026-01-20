export type UnitType = 'unit' | 'lb' | 'liter'

export const UNIT_CONFIG: Record<
  UnitType,
  { label: string; }
> = {
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
