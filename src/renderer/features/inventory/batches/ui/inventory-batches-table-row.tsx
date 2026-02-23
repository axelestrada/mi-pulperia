import { formatDate } from 'date-fns'
import { es } from 'date-fns/locale'

import type { InventoryBatch } from '../model/inventory-batch-schema'

type Props = {
  batch: InventoryBatch
}

export const InventoryBatchesTableRow = ({ batch }: Props) => {
  console.log(batch)
  return (
    <TableRow>
      <TableCell>{'#' + batch.id}</TableCell>
      <TableCell className="whitespace-normal">{batch.productName}</TableCell>
      <TableCell className="whitespace-normal">
        {batch.supplierId ?? '—'}
      </TableCell>
      <TableCell>
        {fromUnitPrecision(batch.quantityAvailable, batch.unitPrecision)}{' '}
        <span className="text-muted-foreground">
          / {fromUnitPrecision(batch.quantityInitial, batch.unitPrecision)}
        </span>
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
