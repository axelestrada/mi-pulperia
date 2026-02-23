import type { Selection } from '@heroui/react'
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from '@heroui/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useCallback, useMemo, useState } from 'react'
import { CopyableField } from '@/components/copyable-field'
import type { InventoryBatch } from '../model/inventory-batch-schema'
import {
  INVENTORY_BATCH_COLUMNS,
  type InventoryBatchColumnKey,
} from '../model/inventory-batches-columns'
import { ExpirationStatusCell } from './expiration-status-cell'

const INITIAL_VISIBLE_COLUMNS: InventoryBatchColumnKey[] = [
  'id',
  'productName',
  'quantityAvailable',
  'quantityInitial',
  'unitCost',
  'expirationDate',
  'createdAt',
]

type Props = {
  filters?: Omit<InventoryBatchFilters, 'page' | 'pageSize'>
}

export const InventoryBatchesTable = ({ filters: baseFilters = {} }: Props) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [searchTerm, setSearchTerm] = useState('')
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  )

  const filters = useMemo(
    () => ({
      ...baseFilters,
      page: currentPage,
      pageSize,
      ...(searchTerm ? { searchTerm } : {}),
    }),
    [baseFilters, currentPage, pageSize, searchTerm]
  )

  const { data: batchesResult, isFetching } = useInventoryBatches(filters)

  const items = batchesResult?.data ?? []
  const totalItems = batchesResult?.total ?? 0
  const totalPages = batchesResult?.totalPages ?? 0

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return INVENTORY_BATCH_COLUMNS
    return INVENTORY_BATCH_COLUMNS.filter(column =>
      Array.from(visibleColumns).includes(column.uid)
    )
  }, [visibleColumns])

  const renderCell = useCallback(
    (item: InventoryBatch, columnKey: InventoryBatchColumnKey) => {
      switch (columnKey) {
        case 'id':
          return <CopyableField value={String(item.id)} />
        case 'productName':
          return <p>{item.productName}</p>
        case 'supplierId':
          return (
            <p className="text-default-500">
              {item.supplierId != null ? String(item.supplierId) : null}
            </p>
          )
        case 'quantityAvailable':
          return (
            <Chip variant="shadow" color="primary" size="sm">
              {fromUnitPrecision(item.quantityAvailable, item.unitPrecision)}
            </Chip>
          )
        case 'quantityInitial':
          return (
            <Chip variant="flat" size="sm">
              {fromUnitPrecision(item.quantityInitial, item.unitPrecision)}
            </Chip>
          )
        case 'unitCost':
          return <p>{formatCurrency(fromCents(item.unitCost))}</p>
        case 'createdAt':
          return (
            <div className="flex gap-2 whitespace-nowrap">
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
          return (item as Record<string, unknown>)[columnKey] != null
            ? String((item as Record<string, unknown>)[columnKey])
            : null
      }
    },
    []
  )

  const topContent = useMemo(
    () => (
      <div className="flex gap-3 items-center">
        <Input
          isClearable
          className="w-full sm:max-w-72"
          placeholder="Buscar por producto o código..."
          startContent={
            <IconSolarMagniferOutline className="text-default-400" />
          }
          value={searchTerm}
          onValueChange={value => {
            setSearchTerm(value)
            setCurrentPage(1)
          }}
        />
        <Dropdown>
          <DropdownTrigger className="hidden sm:flex">
            <Button
              startContent={
                <IconSolarSortHorizontalLinear className="text-default-400" />
              }
              variant="flat"
            >
              Columnas
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="Columnas de la tabla"
            closeOnSelect={false}
            selectedKeys={visibleColumns}
            selectionMode="multiple"
            onSelectionChange={setVisibleColumns}
          >
            {INVENTORY_BATCH_COLUMNS.map(column => (
              <DropdownItem key={column.uid} className="capitalize">
                {capitalize(column.name)}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    ),
    [visibleColumns, searchTerm]
  )

  return (
    <Table
      isHeaderSticky
      bottomContent={
        <div className="flex justify-between items-center">
          <p className="text-default-400 text-small whitespace-nowrap">
            {`Total ${totalItems} lote${totalItems === 1 ? '' : 's'}`}
          </p>

          <div className="flex items-center gap-2 w-full justify-end">
            <Select
              label="Elementos por página"
              labelPlacement="outside-left"
              className="sm:max-w-56"
              selectedKeys={[String(pageSize)]}
              classNames={{
                label: 'text-default-400',
              }}
              onSelectionChange={keys => {
                const key = Array.from(keys)[0]
                if (key) {
                  setPageSize(Number(key))
                  setCurrentPage(1)
                }
              }}
            >
              <SelectItem key="5">5</SelectItem>
              <SelectItem key="10">10</SelectItem>
              <SelectItem key="15">15</SelectItem>
              <SelectItem key="20">20</SelectItem>
            </Select>
            <TablePagination
              total={totalPages}
              page={currentPage}
              onChange={setCurrentPage}
            />
          </div>
        </div>
      }
      bottomContentPlacement="outside"
      classNames={{
        wrapper: 'max-h-[382px]',
      }}
      selectionMode="none"
      topContent={topContent}
      topContentPlacement="outside"
    >
      <TableHeader columns={headerColumns}>
        {column => (
          <TableColumn key={column.uid} align={column.align ?? 'start'}>
            <div className="flex items-center gap-2">
              {column.name}
              {column.tooltip && (
                <Tooltip content={column.tooltip} color="foreground">
                  <IconSolarInfoCircleLinear className="text-default-400" />
                </Tooltip>
              )}
            </div>
          </TableColumn>
        )}
      </TableHeader>

      <TableBody
        loadingContent={<Spinner />}
        loadingState={isFetching ? 'loading' : 'idle'}
        emptyContent="No hay lotes"
        items={items}
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
