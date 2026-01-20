import { PresentationsTableRow } from './presentations-table-row'

type Props = {
  product: Product
  presentations: Presentation[]
  isLoading?: boolean
}

export function PresentationsTable({
  presentations,
  product,
  isLoading,
}: Props) {
  if (isLoading) {
    return <Skeleton className="h-40 w-full" />
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Código de barras</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead>Factor</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {presentations.map(p => (
            <PresentationsTableRow presentation={p} product={product} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
