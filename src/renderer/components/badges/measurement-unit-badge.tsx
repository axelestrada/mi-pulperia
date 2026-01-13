type Props = {
  unit: Product['baseUnit']
}

export const MeasurementUnitBadge = ({ unit }: Props) => {
  const labelMap: Record<typeof unit, string> = {
    unit: 'Unidad',
    lb: 'Libra',
    liter: 'Litro',
  }

  return <Badge variant="secondary">{labelMap[unit]}</Badge>
}
