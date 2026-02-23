import { ProductDTO } from '~/src/main/domains/products/products-model'

import {
  Pagination,
  Table,
  TableCell,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Select,
  SelectItem,
  Spinner,
  Selection,
  Tooltip,
  Chip,
  useDisclosure,
} from '@heroui/react'
import { Presentation } from '../model/presentation-schema'
import { cn } from '@/lib/utils'

type Props = {
  product: ProductDTO
}

const INITIAL_VISIBLE_COLUMNS = [
  'image',
  'name',
  'sku',
  'barcode',
  'unit',
  'factor',
  'salePrice',
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
  { name: 'UNIDAD', uid: 'unit' },
  { name: 'FACTOR', uid: 'factor' },
  { name: 'PRECIO', uid: 'salePrice' },
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

export function PresentationsTable({ product }: Props) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  const [presentationFormMode, setPresentationFormMode] =
    useState<PresentationFormMode>('create')

  const [selectedPresentation, setSelectedPresentation] =
    useState<Presentation | null>(null)

  const {
    isOpen: isPresentationFormOpen,
    onOpen: openPresentationForm,
    onOpenChange: setIsPresentationFormOpen,
  } = useDisclosure()

  const { data: presentations, isLoading } = usePresentationsByProduct(
    product.id
  )

  const { mutateAsync: togglePresentation } = useTogglePresentation()
  const { mutateAsync: deletePresentation } = useDeletePresentation()

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

  const totalItems = presentations?.length // TODO: Get total items from API

  const renderCell = useCallback(
    (
      presentation: Presentation,
      columnKey: React.Key
    ): string | React.ReactNode => {
      const cellValue = presentation[columnKey as keyof Presentation]

      const iconClasses =
        'text-xl text-default-500 pointer-events-none shrink-0'

      switch (columnKey) {
        case 'id':
          return (
            <div className="flex items-center gap-2 text-default-500">
              <span>{presentation.id}</span>
              <Button
                size="sm"
                variant="light"
                isIconOnly
                className="text-default-500"
                onPress={() => {
                  navigator.clipboard.writeText(String(presentation.id))
                }}
              >
                <IconSolarCopyLinear />
              </Button>
            </div>
          )
        case 'image':
          return (
            <ProductImage src={presentation.image} alt={presentation.name} />
          )
        case 'name':
          return (
            <p className="whitespace-nowrap">
              {presentation.name}{' '}
              {presentation.isBase && (
                <Chip variant="flat" size="sm">
                  Base
                </Chip>
              )}
            </p>
          )
        case 'sku':
          return <p className="whitespace-nowrap">{presentation.sku}</p>
        case 'barcode':
          return <p className="whitespace-nowrap">{presentation.barcode}</p>
        case 'description':
          return <p>{presentation.description}</p>
        case 'salePrice':
          return <p>{formatLempira(fromCents(presentation.salePrice))}</p>
        case 'factor':
          return (
            <Chip variant="flat" size="sm">
              {presentation.factor ? `x${presentation.factor}` : 'Variable'}
            </Chip>
          )
        case 'unit':
          return <MeasurementUnitBadge unit={presentation.unit} />
        case 'status':
          return (
            <Chip
              className="capitalize border-none bg-default-100 rounded-lg"
              size="sm"
              variant="dot"
              color={statusConfig[presentation.status].color}
            >
              {statusConfig[presentation.status].label}
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
                <DropdownSection
                  showDivider={!presentation.isBase}
                  title="Acciones"
                >
                  <DropdownItem
                    key="edit"
                    onPress={() => {
                      setPresentationFormMode('edit')
                      setSelectedPresentation(presentation)
                      openPresentationForm()
                    }}
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
                    onPress={() => togglePresentation(presentation.id)}
                    startContent={
                      presentation.status === 'active' ? (
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
                    {presentation.status === 'active'
                      ? 'Desactivar'
                      : 'Activar'}
                  </DropdownItem>
                </DropdownSection>

                {presentation.isBase ? null : (
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
                        deletePresentation(presentation.id)
                      }}
                    >
                      Eliminar
                    </DropdownItem>
                  </DropdownSection>
                )}
              </DropdownMenu>
            </Dropdown>
          )
        default:
          return cellValue?.toString()
      }
    },
    [product, togglePresentation, deletePresentation, openPresentationForm]
  )

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-center justify-between">
          <Input
            className="w-full sm:max-w-72"
            size="sm"
            placeholder="Buscar..."
            endContent={
              <IconSolarMagniferOutline className="text-default-400 size-4" />
            }
            value={search}
            onValueChange={value => {
              setSearch(value)
              setPage(1)
            }}
          />
          <div className="flex gap-3 items-center">
            <Dropdown size="sm">
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  size="sm"
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

            <Dropdown size="sm">
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  size="sm"
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

            <Button
              size="sm"
              endContent={<IconLucidePlus className="size-4" />}
              color="default"
              className="bg-foreground text-background"
              onPress={() => {
                setPresentationFormMode('create')
                setSelectedPresentation(null)
                openPresentationForm()
              }}
            >
              Nueva Presentación
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            {`Total ${totalItems ?? 0} presentaciones`}
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
  }, [
    statusOptions,
    visibleColumns,
    totalItems,
    search,
    pageSize,
    openPresentationForm,
  ])

  const bottomContent = (
    <div className="p-2 flex justify-end items-center">
      <Pagination
        total={1} // TODO: Implementar paginación
        page={page}
        isCompact
        showControls
        showShadow
        color="primary"
      />
    </div>
  )

  return (
    <>
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
        <TableBody
          loadingContent={<Spinner />}
          loadingState={isLoading ? 'loading' : 'idle'}
          emptyContent={'No hay presentaciones'}
          items={presentations ?? []}
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

      <PresentationFormDialog
        isOpen={isPresentationFormOpen}
        onOpenChange={setIsPresentationFormOpen}
        product={product}
        presentation={selectedPresentation}
        mode={presentationFormMode}
      />
    </>
  )
}
