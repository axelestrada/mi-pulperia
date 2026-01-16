import { formatDate } from 'date-fns'
import { es } from 'date-fns/locale'

type Props = {
  batch: InventoryBatch
}

export const InventoryBatchesTableRow = ({ batch }: Props) => {
  return (
    <TableRow>
      <TableCell>{batch.batchCode ?? '#' + batch.id}</TableCell>
      <TableCell className="whitespace-normal">{batch.productName}</TableCell>
      <TableCell className="whitespace-normal">
        {batch.supplierId ?? '—'}
      </TableCell>
      <TableCell>
        {batch.quantityAvailable}{' '}
        <span className="text-muted-foreground">/ {batch.quantityInitial}</span>
      </TableCell>
      <TableCell>{formatLempira(batch.unitCost / 100)}</TableCell>
      <TableCell>
        <ExpirationStatusCell expirationDate={batch.expirationDate} />
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(batch.createdAt, 'dd MMM yyyy', { locale: es })}
      </TableCell>
    </TableRow>
  )
}
