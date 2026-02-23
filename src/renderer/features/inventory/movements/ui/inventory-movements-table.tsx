import type { Selection } from '@heroui/react'
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react'
import { useCallback, useMemo, useState } from 'react'
import { CopyableField } from '@/components/copyable-field'
import type { InventoryMovementFilters } from '@/features/inventory/model/inventory-movement-filters'
import type { InventoryMovement } from '@/features/inventory/model/inventory-movement-schema'
import {
  INVENTORY_MOVEMENT_COLUMNS,
  type InventoryMovementColumnKey,
} from '../model/movement-columns'

const MOVEMENT_TYPE_CONFIG: Record<
  InventoryMovement['type'],
  {
    label: string
    icon: React.ReactNode
  }
> = {
  IN: {
    label: 'Entrada',
    icon: (
      <IconSolarRoundArrowDownLinear className="size-4 text-success-500 mr-1" />
    ),
  },
  OUT: {
    label: 'Salida',
    icon: (
      <IconSolarRoundArrowUpLinear className="size-4 text-danger-500 mr-1" />
    ),
  },
  ADJUST: {
    label: 'Ajuste',
    icon: (
      <IconSolarRoundSortVerticalLinear className="size-4 text-info-500 mr-1" />
    ),
  },
} as const

const MOVEMENT_REASON_CONFIG: Record<
  InventoryMovement['reason'],
  {
    label: string
    icon: React.ReactNode
  }
> = {
  stock_in: {
    label: 'Entrada',
    icon: (
      <IconSolarRoundArrowDownLinear className="size-4 text-success-600 mr-1" />
    ),
  },
  Sale: {
    label: 'Venta',
    icon: (
      <IconSolarRoundArrowUpLinear className="size-4 text-emerald-500 mr-1" />
    ),
  },
  Ajuste: {
    label: 'Ajuste',
    icon: (
      <IconSolarRoundSortVerticalLinear className="size-4 text-info-500 mr-1" />
    ),
  },
} as const

const INITIAL_VISIBLE_COLUMNS: InventoryMovementColumnKey[] = [
  'productName',
  'quantity',
  'unitCost',
  'reason',
  'createdAt',
]

type Props = {
  filters?: Omit<InventoryMovementFilters, 'page' | 'pageSize'>
}

export const InventoryMovementsTable = ({
  filters: baseFilters = {},
}: Props) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [typeFilter, setTypeFilter] = useState<
    InventoryMovement['type'] | 'all'
  >('all')
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  )

  const filters = useMemo(
    () => ({
      ...baseFilters,
      page: currentPage,
      pageSize,
      ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
    }),
    [baseFilters, currentPage, pageSize, typeFilter]
  )

  const { data: movementsResult, isFetching } = useInventoryMovements(filters)

  const items = movementsResult?.data ?? []
  const totalItems = movementsResult?.total ?? 0

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return INVENTORY_MOVEMENT_COLUMNS
    return INVENTORY_MOVEMENT_COLUMNS.filter(column =>
      Array.from(visibleColumns).includes(column.uid)
    )
  }, [visibleColumns])

  const renderCell = useCallback(
    (item: InventoryMovement, columnKey: InventoryMovementColumnKey) => {
      switch (columnKey) {
        case 'id':
          return <CopyableField value={String(item.id)} />
        case 'productName':
          return <p>{item.productName}</p>
        case 'batchCode':
          return <p className="text-default-500">{item.batchCode ?? null}</p>
        case 'type': {
          const config = MOVEMENT_TYPE_CONFIG[item.type]

          return (
            <Chip
              className="capitalize border-none rounded-lg"
              variant="dot"
              startContent={config.icon}
            >
              {config.label}
            </Chip>
          )
        }
        case 'reason': {
          const config = MOVEMENT_REASON_CONFIG[item.reason]

          return (
            <Chip
              className="capitalize border-none rounded-lg"
              variant="dot"
              startContent={config?.icon}
            >
              {config?.label}
            </Chip>
          )
        }
        case 'quantity':
          return <Chip variant="flat">{Math.abs(item.quantity)}</Chip>
        case 'unitCost':
          return <p>{formatCurrency(fromCents(item.unitCost))}</p>
        case 'createdAt':
          return (
            <p className="text-default-500 text-small whitespace-nowrap">
              {new Date(item.createdAt).toLocaleDateString('es-HN', {
                dateStyle: 'medium',
              })}
            </p>
          )
        default:
          return (item as Record<string, unknown>)[columnKey] != null
            ? String((item as Record<string, unknown>)[columnKey])
            : '—'
      }
    },
    []
  )

  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-center">
          <Select
            label="Tipo"
            labelPlacement="outside-left"
            className="sm:max-w-40"
            selectedKeys={[typeFilter]}
            onSelectionChange={keys => {
              const key = Array.from(keys)[0]
              setTypeFilter((key as 'all' | InventoryMovement['type']) ?? 'all')
              setCurrentPage(1)
            }}
            classNames={{ label: 'text-default-400' }}
          >
            <SelectItem key="all">Todos</SelectItem>
            <SelectItem key="IN">Entrada</SelectItem>
            <SelectItem key="OUT">Salida</SelectItem>
            <SelectItem key="ADJUST">Ajuste</SelectItem>
          </Select>
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
              {INVENTORY_MOVEMENT_COLUMNS.map(column => (
                <DropdownItem key={column.uid} className="capitalize">
                  {capitalize(column.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            {`Total ${totalItems} movimiento${totalItems === 1 ? '' : 's'}`}
          </span>
          <Select
            label="Elementos por página"
            labelPlacement="outside-left"
            className="sm:max-w-56"
            selectedKeys={[String(pageSize)]}
            classNames={{ label: 'text-default-400' }}
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
        </div>
      </div>
    ),
    [visibleColumns, totalItems, pageSize, typeFilter]
  )

  return (
    <Table
      isHeaderSticky
      bottomContent={
        <TablePagination
          total={totalItems}
          page={currentPage}
          onChange={setCurrentPage}
        />
      }
      bottomContentPlacement="outside"
      classNames={{ wrapper: 'max-h-[382px]' }}
      selectionMode="none"
      topContent={topContent}
      topContentPlacement="outside"
    >
      <TableHeader columns={headerColumns}>
        {column => (
          <TableColumn key={column.uid} align={column.align ?? 'start'}>
            {column.name}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody
        loadingContent={<Spinner />}
        loadingState={isFetching ? 'loading' : 'idle'}
        emptyContent="No hay movimientos"
        items={items}
      >
        {item => (
          <TableRow className="hover:bg-default-100" key={item.id}>
            {columnKey => (
              <TableCell>
                {renderCell(item, columnKey as InventoryMovementColumnKey)}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

