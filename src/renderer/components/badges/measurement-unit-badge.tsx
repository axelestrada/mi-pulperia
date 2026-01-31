import { Chip } from '@heroui/react'

type Props = {
  unit: Product['baseUnit']
}

export const MeasurementUnitBadge = ({ unit }: Props) => {
  const labelMap: Record<typeof unit, string> = {
    unit: 'Unidad',
    lb: 'Libra',
    liter: 'Litro',
  }

  return (
    <Chip className="capitalize" size="sm" variant="flat">
      {labelMap[unit]}
    </Chip>
  )
}
