import type { Selection } from '@heroui/react'
import {
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Input,
  Pagination,
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
  useDisclosure,
} from '@heroui/react'
import type { ProductDTO } from 'domains/products/products-model'
import { cn } from '@/lib/utils'

type Props = {
  onEdit: (product: ProductDTO) => void
}

const INITIAL_VISIBLE_COLUMNS = [
  'image',
  'name',
  'category',
  'presentations',
  'stock',
  'status',
  'actions',
]

const columns = [
  { name: 'ID', uid: 'id' },
  { name: 'IMAGEN', uid: 'image' },
  { name: 'NOMBRE', uid: 'name' },
  { name: 'DESCRIPCION', uid: 'description' },
  { name: 'CATEGORIA', uid: 'category' },
  { name: 'UNIDAD', uid: 'baseUnit' },
  { name: 'PRESENTACIONES', uid: 'presentations' },
  {
    name: 'STOCK',
    uid: 'stock',
    tooltip: 'Stock total calculado en la unidad base',
  },
  { name: 'ESTADO', uid: 'status' },
  { name: 'ACCIONES', uid: 'actions' },
]

const statusConfig: Record<
  ProductDTO['status'],
  { label: string; color: 'success' | 'danger' | 'warning' }
> = {
  active: { label: 'Activo', color: 'success' },
  inactive: { label: 'Inactivo', color: 'danger' },
  deleted: { label: 'Eliminado', color: 'warning' },
}

export const ProductsTableContent = ({ onEdit }: Props) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(5)

  const {
    isOpen: isPresentationsDialogOpen,
    onOpenChange: setIsPresentationsDialogOpen,
    onOpen,
  } = useDisclosure()

  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(
    null
  )

  const showPresentations = useCallback(
    (product: ProductDTO) => {
      setSelectedProduct(product)
      onOpen()
    },
    [onOpen]
  )

  const { data: products, isFetching } = useProducts({
    search,
    page: currentPage,
    pageSize,
  })

  const { mutateAsync: deleteProduct } = useDeleteProduct()
  const { mutateAsync: toggleProduct } = useToggleProduct()

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

  const totalItems = products?.pagination.totalItems || 0

  const pages = useMemo(() => {
    return Math.ceil(totalItems / pageSize)
  }, [totalItems, pageSize])

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
        case 'description':
          return <p>{product.description}</p>
        case 'category':
          return (
            <Chip className="capitalize" size="sm" variant="flat">
              {product.category.name}
            </Chip>
          )
        case 'baseUnit':
          return <MeasurementUnitBadge unit={product.baseUnit} />
        case 'presentations':
          return (
            <div className="flex flex-col gap-2">
              {product.presentations.map(presentation => (
                <Chip
                  key={presentation.id}
                  className="capitalize"
                  size="sm"
                  variant="flat"
                >
                  {`${presentation.name} - ${formatLempira(fromCents(presentation.salePrice))}`}
                </Chip>
              ))}
            </div>
          )
        case 'status':
          return (
            <Chip
              className="capitalize border-none bg-default-100 rounded-lg"
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
                  {fromUnitPrecision(product.stock, product.unitPrecision)}
                  {product.baseUnit !== 'unit' &&
                    ` ${UNIT_CONFIG[product.baseUnit].label}`}
                </Chip>
              </Tooltip>

              {product.hasExpiredBatches || product.hasExpiringSoonBatches ? (
                <Tooltip
                  className="text-white"
                  content={
                    product.hasExpiredBatches
                      ? `${product.expiredBatchesCount} lote(s) vencido(s)`
                      : `${product.expiringSoonBatchesCount} lote(s) por vencer`
                  }
                  color={product.hasExpiredBatches ? 'danger' : 'warning'}
                >
                  <IconSolarSirenRoundedLineDuotone
                    className={cn('size-5', {
                      'text-warning-500':
                        product.hasExpiringSoonBatches &&
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
                    onPress={() => {
                      showPresentations(product)
                    }}
                    startContent={
                      <IconSolarWidget2BoldDuotone className={iconClasses} />
                    }
                  >
                    Ver presentaciones
                  </DropdownItem>
                  <DropdownItem
                    key="edit"
                    onPress={() => onEdit(product)}
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
                    onPress={() => toggleProduct(product.id)}
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
                    onPress={() => {
                      deleteProduct(product.id)
                    }}
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
    [deleteProduct, onEdit, toggleProduct, showPresentations]
  )

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-center">
          <Input
            isClearable
            className="w-full sm:max-w-72"
            placeholder="Buscar..."
            startContent={
              <IconSolarMagniferOutline className="text-default-400" />
            }
            value={search}
            onValueChange={value => {
              setSearch(value)
              setCurrentPage(1)
            }}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  startContent={
                    <IconSolarTuning2Linear className="text-default-400" />
                  }
                  variant="flat"
                >
                  Filtros
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
            {`Total ${totalItems} productos`}
          </span>
          <Select
            label="Elementos por página"
            labelPlacement="outside-left"
            className="sm:max-w-56"
            defaultSelectedKeys={[String(pageSize)]}
            classNames={{
              label: 'text-default-400',
            }}
            onSelectionChange={key => setPageSize(Number(key.currentKey))}
          >
            <SelectItem key="5">5</SelectItem>
            <SelectItem key="10">10</SelectItem>
            <SelectItem key="15">15</SelectItem>
          </Select>
        </div>
      </div>
    )
  }, [statusOptions, visibleColumns, totalItems, search, pageSize])

  return (
    <>
      <Table
        isHeaderSticky
        bottomContent={
          <div className="p-2 flex justify-end items-center">
            <Pagination
              total={pages}
              page={currentPage}
              onChange={page => setCurrentPage(page)}
              isCompact
              showControls
              showShadow
              color="primary"
            />
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
            <TableColumn
              key={column.uid}
              align={column.uid === 'actions' ? 'center' : 'start'}
            >
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
          emptyContent={'No hay productos'}
          items={products?.data ?? []}
        >
          {item => (
            <TableRow className="hover:bg-default-100" key={item.id}>
              {columnKey => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedProduct && (
        <ProductPresentationsDialog
          product={selectedProduct}
          isOpen={isPresentationsDialogOpen}
          onOpenChange={setIsPresentationsDialogOpen}
        />
      )}
    </>
  )
}
