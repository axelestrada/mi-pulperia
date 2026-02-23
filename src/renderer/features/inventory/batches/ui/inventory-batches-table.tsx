import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CopyableField } from '@/components/copyable-field'
import { useTablePagination } from '@/hooks/use-table-pagination'
import type { InventoryBatch } from '../model/inventory-batch-schema'

type Props = {
  filters: InventoryBatchFilters
}

export const InventoryBatchesTable = ({ filters }: Props) => {
  const { data = [], isFetching } = useInventoryBatches(filters)

  const { page, setPage, total } = useTablePagination(data, 5)

  const renderCell = useCallback(
    (item: InventoryBatch, columnKey: InventoryBatchColumnKey) => {
      switch (columnKey) {
        case 'id':
          return <CopyableField value={String(item.id)} />
        case 'productName':
          return <p>{item.productName}</p>
        case 'quantityAvailable':
          return (
            <Chip variant="shadow" color="primary">
              {fromUnitPrecision(item.quantityAvailable, item.unitPrecision)}
            </Chip>
          )
        case 'quantityInitial':
          return (
            <Chip variant="flat">
              {fromUnitPrecision(item.quantityInitial, item.unitPrecision)}
            </Chip>
          )
        case 'unitCost':
          return <p>{formatCurrency(fromCents(item.unitCost))}</p>
        case 'createdAt':
          return (
            <div className={'flex gap-2 whitespace-nowrap'}>
              <IconSolarCalendarMinimalisticLinear className="size-4 text-default-300" />
              <span>
                {capitalize(
                  format(item.createdAt, 'MMMM dd, yyyy', {
                    locale: es,
                  })
                )}
              </span>
            </div>
          )
        case 'expirationDate':
          return <ExpirationStatusCell expirationDate={item.expirationDate} />
        default:
          return item[columnKey]
      }
    },
    []
  )

  return (
    <Table
      isHeaderSticky
      bottomContent={
        <TablePagination total={total} page={page} onChange={setPage} />
      }
      bottomContentPlacement="outside"
      classNames={{
        wrapper: 'max-h-[382px]',
      }}
      selectionMode="none"
      topContentPlacement="outside"
    >
      <TableHeader columns={INVENTORY_BATCH_COLUMNS}>
        {column => <TableColumn key={column.uid}>{column.name}</TableColumn>}
      </TableHeader>

      <TableBody
        loadingContent={<Spinner />}
        loadingState={isFetching ? 'loading' : 'idle'}
        emptyContent={'No hay lotes'}
        items={data}
      >
        {item => (
          <TableRow className="hover:bg-default-100" key={item.id}>
            {columnKey => (
              <TableCell>
                {renderCell(item, columnKey as InventoryBatchColumnKey)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
