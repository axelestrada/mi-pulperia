type Props = {
  active: boolean
}

export const StatusBadge = ({ active }: Props) => {
  return (
    <Badge
      variant={active ? 'default' : 'destructive'}
      className={active ? 'bg-green-600' : ''}
    >
      {active ? 'Activo' : 'Inactivo'}
    </Badge>
  )
}
