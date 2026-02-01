import { Chip } from '@heroui/react'
import { ProductDTO } from '~/src/main/domains/products/products-model'

type Props = {
  unit: ProductDTO['baseUnit']
}

export const MeasurementUnitBadge = ({ unit }: Props) => {
  const labelMap: Record<typeof unit, string> = {
    unit: 'Unidad',
    lb: 'Libra',
    liter: 'Litro',
  }

  return (
    <Chip className="capitalize" size="sm" variant="light">
      {labelMap[unit]}
    </Chip>
  )
}
