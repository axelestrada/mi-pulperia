import { cn } from '@/lib/utils'
import {
  Input,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  Chip,
  DropdownTrigger,
  Button,
  Table,
  TableHeader,
  TableColumn,
  Select,
  SelectItem,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Tooltip,
  DropdownSection,
} from '@heroui/react'

import type { Selection } from '@heroui/react'
import { ProductDTO } from 'domains/products/products-model'

type Props = {
  products: ProductDTO[]
  onEdit: (product: Product) => void
}

const INITIAL_VISIBLE_COLUMNS = [
  'image',
  'name',
  'sku',
  'barcode',
  'category',
  'salePrice',
  'stock',
  'status',
  'actions',
]

const columns = [
  { name: 'ID', uid: 'id' },
  { name: 'IMAGEN', uid: 'image' },
  { name: 'NOMBRE', uid: 'name' },
  { name: 'DESCRIPCION', uid: 'description' },
  { name: 'SKU', uid: 'sku' },
  { name: 'CODIGO DE BARRAS', uid: 'barcode' },
  { name: 'CATEGORIA', uid: 'category' },
  { name: 'UNIDAD', uid: 'baseUnit' },
  { name: 'PRECIO', uid: 'salePrice' },
  { name: 'STOCK', uid: 'stock' },
  { name: 'ESTADO', uid: 'status' },
  { name: 'ACCIONES', uid: 'actions' },
]

const statusConfig: Record<
  ProductDTO['status'],
  { label: string; color: 'success' | 'danger' }
> = {
  active: { label: 'Activo', color: 'success' },
  inactive: { label: 'Inactivo', color: 'danger' },
}

export const ProductsTableContent = ({ products }: Props) => {
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  )

  const statusOptions = useMemo(
    () => [
      { name: 'Activo', uid: 'active' },
      { name: 'Inactivo', uid: 'inactive' },
    ],
    []
  )

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return columns

    return columns.filter(column =>
      Array.from(visibleColumns).includes(column.uid)
    )
  }, [visibleColumns])

  const renderCell = useCallback(
    (product: ProductDTO, columnKey: React.Key): string | React.ReactNode => {
      const cellValue = product[columnKey as keyof ProductDTO]

      const iconClasses =
        'text-xl text-default-500 pointer-events-none shrink-0'

      switch (columnKey) {
        case 'id':
          return (
            <div className="flex items-center gap-2 text-default-500">
              <span>{product.id}</span>
              <Button
                size="sm"
                variant="light"
                isIconOnly
                className="text-default-500"
                onPress={() => {
                  navigator.clipboard.writeText(String(product.id))
                }}
              >
                <IconSolarCopyLinear />
              </Button>
            </div>
          )
        case 'image':
          return <ProductImage src={product.image} alt={product.name} />
        case 'name':
          return <p>{product.name}</p>
        case 'category':
          return (
            <Chip className="capitalize" size="sm" variant="flat">
              {product.category.name}
            </Chip>
          )
        case 'baseUnit':
          return <MeasurementUnitBadge unit={product.baseUnit} />
        case 'salePrice':
          return <p>{formatLempira(fromCents(product.salePrice ?? 0))}</p>
        case 'status':
          return (
            <Chip
              className="capitalize border-none"
              size="sm"
              variant="dot"
              color={statusConfig[product.status].color}
            >
              {statusConfig[product.status].label}
            </Chip>
          )
        case 'stock':
          return (
            <div className="flex items-center gap-2">
              <Tooltip
                content={
                  product.outOfStock
                    ? 'Sin stock'
                    : product.lowStock
                      ? 'Stock bajo'
                      : undefined
                }
                color={product.outOfStock ? 'danger' : 'warning'}
                hidden={!(product.lowStock || product.outOfStock)}
                className="text-white"
              >
                <Chip
                  color={
                    product.outOfStock
                      ? 'danger'
                      : product.lowStock
                        ? 'warning'
                        : 'success'
                  }
                  variant="flat"
                >
                  {product.stock}
                </Chip>
              </Tooltip>

              {product.hasExpiredBatches || product.hasExpiringBatches ? (
                <Tooltip
                  className="text-white"
                  content={
                    product.hasExpiredBatches
                      ? `${product.expiredBatchesCount} lote(s) vencido(s)`
                      : `${product.expiringBatchesCount} lote(s) por vencer`
                  }
                  color={product.hasExpiredBatches ? 'danger' : 'warning'}
                >
                  <IconSolarSirenRoundedLineDuotone
                    className={cn('size-5', {
                      'text-warning-500':
                        product.hasExpiringBatches &&
                        !product.hasExpiredBatches,
                      'text-danger-500': product.hasExpiredBatches,
                    })}
                  />
                </Tooltip>
              ) : null}
            </div>
          )
        case 'actions':
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <IconSolarMenuDotsLinear className="text-default-500 size-5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownSection showDivider title="Acciones">
                  <DropdownItem
                    key="view"
                    startContent={
                      <IconSolarWidget2BoldDuotone className={iconClasses} />
                    }
                  >
                    Ver presentaciones
                  </DropdownItem>
                  <DropdownItem
                    key="edit"
                    startContent={
                      <IconSolarPenNewSquareBoldDuotone
                        className={iconClasses}
                      />
                    }
                  >
                    Actualizar
                  </DropdownItem>
                  <DropdownItem
                    key="toggle"
                    startContent={
                      product.status === 'active' ? (
                        <IconSolarCloseCircleBoldDuotone
                          className={iconClasses}
                        />
                      ) : (
                        <IconSolarCheckCircleBoldDuotone
                          className={iconClasses}
                        />
                      )
                    }
                  >
                    {product.status === 'active' ? 'Desactivar' : 'Activar'}
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection title="Zona de Peligro">
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    description="Esto no se puede deshacer"
                    startContent={
                      <IconSolarTrashBinMinimalisticBoldDuotone
                        className={cn(iconClasses, 'text-current')}
                      />
                    }
                  >
                    Eliminar
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          )
        default:
          return cellValue?.toString()
      }
    },
    []
  )

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-center">
          <Input
            isClearable
            className="w-full sm:max-w-72"
            placeholder="Buscar..."
            startContent={<IconSolarMagniferOutline />}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<IconLucideChevronDown className="text-small" />}
                  variant="flat"
                >
                  Estado
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectionMode="multiple"
              >
                {statusOptions.map(status => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {status.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<IconLucideChevronDown className="text-small" />}
                  variant="flat"
                >
                  Columnas
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map(column => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total 100 productos
          </span>
          <Select
            label="Productos por página"
            labelPlacement="outside-left"
            className="sm:max-w-56"
            defaultSelectedKeys={['5']}
            classNames={{
              label: 'text-default-400',
            }}
          >
            <SelectItem key="5">5</SelectItem>
            <SelectItem key="10">10</SelectItem>
            <SelectItem key="15">15</SelectItem>
          </Select>
        </div>
      </div>
    )
  }, [statusOptions, visibleColumns])

  const bottomContent = useMemo(() => {
    return (
      <div className="p-2 flex justify-end items-center">
        <Pagination
          total={10}
          page={1}
          isCompact
          showControls
          showShadow
          color="primary"
        />
      </div>
    )
  }, [])

  return (
    <Table
      isHeaderSticky
      bottomContent={bottomContent}
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
          <TableColumn
            key={column.uid}
            align={column.uid === 'actions' ? 'center' : 'start'}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={'No hay productos'} items={products}>
        {item => (
          <TableRow key={item.id}>
            {columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
