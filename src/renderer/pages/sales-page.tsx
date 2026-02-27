import type { Selection } from '@heroui/react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
} from '@heroui/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertCircle,
  Ban,
  Columns3,
  DollarSign,
  Download,
  Eye,
  FileText,
  MoreVertical,
  Receipt,
  RefreshCw,
  Search,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { TablePagination } from '../components/table/table-pagination'
import { UNIT_CONFIG } from '../features/products/ui/product-units'
import {
  type Sale,
  type SalesFilters,
  useCancelSale,
  useRefundSale,
  useSale,
  useSales,
  useSalesSummary,
  useTopSellingProducts,
} from '../hooks/use-sales'

type SalesStatusFilter = '' | 'completed' | 'cancelled' | 'refunded'

const INITIAL_VISIBLE_COLUMNS = [
  'saleNumber',
  'createdAt',
  'customer',
  'total',
  'status',
  'actions',
]

const columns = [
  { name: 'NUMERO', uid: 'saleNumber' },
  { name: 'FECHA', uid: 'createdAt' },
  { name: 'CLIENTE', uid: 'customer' },
  { name: 'TOTAL', uid: 'total' },
  { name: 'ESTADO', uid: 'status' },
  { name: 'ACCIONES', uid: 'actions' },
]

const formatQuantity = (value: number) => {
  const formatted = value.toFixed(3)
  return formatted.replace(/\.?0+$/, '')
}

export const SalesPage = () => {
  const [showSaleDetail, setShowSaleDetail] = useState(false)
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null)
  const [saleToRefund, setSaleToRefund] = useState<Sale | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SalesStatusFilter>('')
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  )
  const [cancelReason, setCancelReason] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [cancelReasonError, setCancelReasonError] = useState('')
  const [refundReasonError, setRefundReasonError] = useState('')

  const filters = useMemo(() => {
    const nextFilters: SalesFilters = {
      search: search.trim() || undefined,
      status: statusFilter || undefined,
      page: currentPage,
      limit: pageSize,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }
    return nextFilters
  }, [currentPage, pageSize, search, statusFilter])

  const { data: salesData, isLoading } = useSales(filters)
  const { data: selectedSale } = useSale(selectedSaleId || 0)
  const { data: summary } = useSalesSummary({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  })
  const { data: topProducts } = useTopSellingProducts(
    5,
    filters.dateFrom,
    filters.dateTo
  )

  const cancelSale = useCancelSale()
  const refundSale = useRefundSale()

  const salesList = salesData?.data ?? []
  const pagination = salesData?.pagination
  const totalItems = pagination?.total ?? 0
  const totalPages = Math.max(1, pagination?.totalPages ?? 1)
  const statusOptions = useMemo(
    () => [
      { name: 'Todos', uid: 'all' },
      { name: 'Completada', uid: 'completed' },
      { name: 'Cancelada', uid: 'cancelled' },
      { name: 'Reembolsada', uid: 'refunded' },
    ],
    []
  )
  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return columns
    return columns.filter(column =>
      Array.from(visibleColumns).includes(column.uid)
    )
  }, [visibleColumns])

  const onViewSale = (sale: Sale) => {
    setSelectedSaleId(sale.id)
    setShowSaleDetail(true)
  }

  const openCancelDialog = (sale: Sale) => {
    setSaleToCancel(sale)
    setCancelReason('')
    setCancelReasonError('')
    setShowCancelDialog(true)
  }

  const openRefundDialog = (sale: Sale) => {
    setSaleToRefund(sale)
    setRefundReason('')
    setRefundReasonError('')
    setShowRefundDialog(true)
  }

  const onCancelSale = async () => {
    if (!saleToCancel) return
    if (!cancelReason.trim()) {
      setCancelReasonError('Debe especificar una razón')
      return
    }

    try {
      await cancelSale.mutateAsync({
        id: saleToCancel.id,
        reason: cancelReason.trim(),
      })
      setShowCancelDialog(false)
      setSaleToCancel(null)
      setCancelReason('')
      setCancelReasonError('')
    } catch (error) {
      console.error('Error cancelling sale:', error)
    }
  }

  const onRefundSale = async () => {
    if (!saleToRefund) return
    if (!refundReason.trim()) {
      setRefundReasonError('Debe especificar una razón')
      return
    }

    try {
      await refundSale.mutateAsync({
        id: saleToRefund.id,
        reason: refundReason.trim(),
      })
      setShowRefundDialog(false)
      setSaleToRefund(null)
      setRefundReason('')
      setRefundReasonError('')
    } catch (error) {
      console.error('Error refunding sale:', error)
    }
  }

  const getStatusBadge = (status: Sale['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Chip size="sm" color="success" variant="flat">
            Completada
          </Chip>
        )
      case 'cancelled':
        return (
          <Chip size="sm" color="warning" variant="flat">
            Cancelada
          </Chip>
        )
      case 'refunded':
        return (
          <Chip size="sm" color="danger" variant="flat">
            Reembolsada
          </Chip>
        )
      default:
        return (
          <Chip size="sm" variant="flat">
            {status}
          </Chip>
        )
    }
  }

  const money = (cents: number) => formatCurrency(fromCents(cents))

  const renderCell = (sale: Sale, columnKey: string) => {
    switch (columnKey) {
      case 'saleNumber':
        return <span className="font-medium">{sale.saleNumber}</span>
      case 'createdAt':
        return format(new Date(sale.createdAt), 'PPp', { locale: es })
      case 'customer':
        return (
          <div>
            <p>{sale.customerName || 'Cliente general'}</p>
            {sale.customerDocument && (
              <p className="text-xs text-default-500">{sale.customerDocument}</p>
            )}
          </div>
        )
      case 'total':
        return (
          <span className="font-medium tabular-nums">
            {formatCurrency(fromCents(sale.total))}
          </span>
        )
      case 'status':
        return getStatusBadge(sale.status)
      case 'actions':
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label={`Acciones de venta ${sale.saleNumber}`}>
              <DropdownItem
                key="view"
                startContent={<Eye className="size-4" />}
                onPress={() => onViewSale(sale)}
              >
                Ver detalle
              </DropdownItem>
              {sale.status === 'completed' ? (
                <DropdownItem
                  key="cancel"
                  color="warning"
                  startContent={<Ban className="size-4" />}
                  onPress={() => openCancelDialog(sale)}
                >
                  Cancelar
                </DropdownItem>
              ) : null}
              {sale.status === 'completed' ? (
                <DropdownItem
                  key="refund"
                  color="danger"
                  startContent={<RefreshCw className="size-4" />}
                  onPress={() => openRefundDialog(sale)}
                >
                  Reembolsar
                </DropdownItem>
              ) : null}
            </DropdownMenu>
          </Dropdown>
        )
      default:
        return null
    }
  }

  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-72"
            placeholder="Buscar venta, cliente, documento..."
            startContent={<Search className="size-4 text-default-400" />}
            value={search}
            onValueChange={value => {
              setSearch(value)
              setCurrentPage(1)
            }}
          />

          <Dropdown>
            <DropdownTrigger>
              <Button variant="flat">Estado</Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              closeOnSelect
              selectionMode="single"
              selectedKeys={new Set([statusFilter || 'all'])}
              onSelectionChange={keys => {
                const next = Array.from(keys)[0]?.toString() || 'all'
                setStatusFilter(next === 'all' ? '' : (next as SalesStatusFilter))
                setCurrentPage(1)
              }}
            >
              {statusOptions.map(status => (
                <DropdownItem key={status.uid}>{status.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="flat"
                startContent={<Columns3 className="size-4 text-default-400" />}
              >
                Columnas
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              closeOnSelect={false}
              selectionMode="multiple"
              selectedKeys={visibleColumns}
              onSelectionChange={setVisibleColumns}
            >
              {columns.map(column => (
                <DropdownItem key={column.uid}>{column.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-small text-default-400">
            Total {totalItems} ventas
          </span>
          <Select
            label="Elementos por pagina"
            labelPlacement="outside-left"
            className="sm:max-w-56"
            selectedKeys={[String(pageSize)]}
            classNames={{ label: 'text-default-400' }}
            onSelectionChange={keys => {
              const nextPageSize = Number(keys.currentKey ?? pageSize)
              setPageSize(nextPageSize)
              setCurrentPage(1)
            }}
          >
            <SelectItem key="10">10</SelectItem>
            <SelectItem key="20">20</SelectItem>
            <SelectItem key="50">50</SelectItem>
          </Select>
        </div>
      </div>
    ),
    [pageSize, search, statusFilter, statusOptions, totalItems, visibleColumns]
  )

  const rows = [
    { label: 'Subtotal', value: money(selectedSale?.subtotal || 0) },
    (selectedSale?.discountAmount || 0) > 0
      ? {
          label: 'Descuento',
          value: `-${money(selectedSale?.discountAmount || 0)}`,
          className: 'text-success',
        }
      : null,
    (selectedSale?.taxAmount || 0) > 0
      ? { label: 'Impuesto', value: money(selectedSale?.taxAmount || 0) }
      : null,
  ].filter(Boolean) as Array<{
    label: string
    value: string
    className?: string
  }>

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Historial de Ventas
          </h1>
          <p className="text-default-500">
            Gestione y consulte todas las ventas realizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="flat"
            isDisabled
            startContent={<Download className="size-4" />}
          >
            Exportar
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardBody className="rounded-large border border-default-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-default-500">Total Ventas</p>
                  <p className="text-2xl font-semibold">{summary.totalSales}</p>
                </div>
                <Receipt className="size-5 text-default-500" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="rounded-large border border-default-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-default-500">
                    Ingresos Totales
                  </p>
                  <p className="text-2xl font-semibold text-success">
                    {formatCurrency(fromCents(summary.totalRevenue))}
                  </p>
                </div>
                <DollarSign className="size-5 text-default-500" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="rounded-large border border-default-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-default-500">
                    Promedio por Venta
                  </p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(fromCents(summary.averageSaleAmount))}
                  </p>
                </div>
                <TrendingUp className="size-5 text-default-500" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="rounded-large border border-default-200 p-4">
              <div className="flex items-center justify-between">
                <p className="text-small text-default-500">Estados</p>
                <FileText className="size-5 text-default-500" />
              </div>
              <div className="mt-2 space-y-1">
                {Object.entries(summary.salesByStatus).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="capitalize text-default-500">
                        {status}
                      </span>
                      <span className="font-medium">{count}</span>
                    </div>
                  )
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
      <Card>
        <CardHeader className="pb-2">
          <div className="font-semibold">Lista de Ventas</div>
        </CardHeader>
        <CardBody>
          <Table
            aria-label="Historial de ventas"
            topContent={topContent}
            topContentPlacement="outside"
            bottomContent={
              <TablePagination
                page={currentPage}
                total={totalPages}
                onChange={setCurrentPage}
              />
            }
            bottomContentPlacement="outside"
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
            <TableBody<Sale>
              items={salesList}
              emptyContent={
                <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-default-500">
                  <Receipt className="size-8" />
                  <p>No se encontraron ventas</p>
                </div>
              }
              loadingContent={<Spinner />}
              loadingState={isLoading ? 'loading' : 'idle'}
            >
              {item => (
                <TableRow key={item.id} className="hover:bg-default-100">
                  {columnKey => (
                    <TableCell>{renderCell(item, String(columnKey))}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {topProducts && topProducts.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="font-semibold">Productos Más Vendidos</div>
          </CardHeader>
          <CardBody className="space-y-2">
            {topProducts.map((product, index) => (
              <div
                key={product.presentationId}
                className="flex items-center justify-between rounded-large border border-default-200 p-3"
              >
                <div className="flex items-center gap-3">
                  <Chip size="sm" variant="flat">
                    {index + 1}
                  </Chip>
                  <div>
                    <p className="font-medium">{product.presentationName}</p>
                    <p className="text-sm text-default-500">
                      {product.productName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {product.totalQuantity} unidades
                  </p>
                  <p className="text-sm text-default-500">
                    {formatCurrency(fromCents(product.totalRevenue))}
                  </p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <Modal
        isOpen={showSaleDetail}
        onOpenChange={setShowSaleDetail}
        scrollBehavior="outside"
        size="3xl"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Detalle de Venta</ModalHeader>
              <ModalBody>
                {selectedSale && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium">Número de Venta</p>
                        <p>{selectedSale.saleNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Fecha</p>
                        <p>
                          {format(
                            new Date(selectedSale.createdAt),
                            'dd MMM yyyy hh:mm aa',
                            {
                              locale: es,
                            }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Cliente</p>
                        <p>
                          {selectedSale.customer?.name || 'Cliente general'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Estado</p>
                        {getStatusBadge(selectedSale.status)}
                      </div>
                    </div>

                    <Divider />

                    <div>
                      <h4 className="mb-2 font-medium">Artículos</h4>
                      <div className="space-y-2">
                        {selectedSale.items?.map(item => {
                          const displayName = `${item.productName} (${item.presentationName})`
                          const factor = item.presentationFactor || 1
                          const presentationQuantity = item.quantity / factor
                          const inventoryUnitLabel =
                            UNIT_CONFIG[item.productBaseUnit]?.label || 'ud'
                          const showInventoryBreakdown = factor !== 1

                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between rounded-large border border-default-200 p-3"
                            >
                              <div>
                                <p className="text-sm text-default-500">
                                  {displayName}
                                </p>
                                <p className="text-xs">
                                  {showInventoryBreakdown ? (
                                    <>
                                      {formatQuantity(presentationQuantity)} x{' '}
                                      {formatCurrency(
                                        fromCents(item.unitPrice)
                                      )}{' '}
                                      x{' '}
                                      {formatQuantity(
                                        fromUnitPrecision(
                                          item.quantity,
                                          item.productBaseUnitPrecision
                                        )
                                      )}
                                      {inventoryUnitLabel} del inventario
                                    </>
                                  ) : (
                                    <>
                                      {formatQuantity(item.quantity)} x{' '}
                                      {formatCurrency(
                                        fromCents(item.unitPrice)
                                      )}
                                    </>
                                  )}
                                </p>
                                {item.notes && (
                                  <p className="text-xs">{item.notes}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  {formatCurrency(fromCents(item.totalPrice))}
                                </p>
                                {item.discount > 0 && (
                                  <p className="text-xs text-success">
                                    Desc: -
                                    {formatCurrency(fromCents(item.discount))}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <Divider />

                    <div>
                      <h4 className="mb-2 font-medium">Pagos</h4>
                      <div className="space-y-2">
                        {selectedSale.payments?.map(payment => {
                          const delivered = fromCents(payment.amount)
                          const change = fromCents(payment.changeAmount ?? 0)
                          const applied = Math.max(0, delivered - change)

                          return (
                            <div
                              key={payment.id}
                              className="flex items-start justify-between rounded-large border border-default-200 p-3"
                            >
                              <span className="font-medium capitalize">
                                {payment.method}
                              </span>
                              <div className="text-right text-sm">
                                <p>
                                  Entregado:{' '}
                                  <span className="font-medium">
                                    {formatCurrency(delivered)}
                                  </span>
                                </p>
                                <p className="text-default-500">
                                  Aplicado:{' '}
                                  <span className="font-medium">
                                    {formatCurrency(applied)}
                                  </span>
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <Divider />

                    <div className="space-y-1">
                      {rows.map(row => (
                        <div
                          key={row.label}
                          className={`flex items-center justify-between text-sm ${row.className ?? ''}`}
                        >
                          <span className="text-default-500">{row.label}</span>
                          <span className="font-medium tabular-nums">
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-large border border-default-200 bg-default-100 p-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-medium text-default-600">
                          Total
                        </span>
                        <span className="text-xl font-bold tabular-nums">
                          {money(selectedSale.total)}
                        </span>
                      </div>
                    </div>

                    {selectedSale.notes ? (
                      <>
                        <Divider />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Notas</p>
                          <p className="whitespace-pre-line text-sm text-default-500">
                            {selectedSale.notes}
                          </p>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>Cancelar Venta</ModalHeader>
              <ModalBody className="space-y-4">
                <div className="flex items-start gap-2 rounded-large border border-warning-200 bg-warning-50 p-3 text-warning-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <p className="text-sm">
                    Esta acción cancelará la venta y revertirá los movimientos
                    de inventario.
                  </p>
                </div>

                <Textarea
                  label="Razón de la Cancelación"
                  isRequired
                  value={cancelReason}
                  onValueChange={value => {
                    setCancelReason(value)
                    if (cancelReasonError) setCancelReasonError('')
                  }}
                  placeholder="Especifique la razón..."
                  isInvalid={Boolean(cancelReasonError)}
                  errorMessage={cancelReasonError}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cerrar
                </Button>
                <Button
                  color="warning"
                  onPress={onCancelSale}
                  isLoading={cancelSale.isPending}
                  startContent={
                    !cancelSale.isPending ? <Ban className="size-4" /> : null
                  }
                >
                  Cancelar Venta
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader>Reembolsar Venta</ModalHeader>
              <ModalBody className="space-y-4">
                <div className="flex items-start gap-2 rounded-large border border-danger-200 bg-danger-50 p-3 text-danger-700">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <p className="text-sm">
                    Esta acción reembolsará la venta y revertirá los movimientos
                    de inventario.
                  </p>
                </div>

                <Textarea
                  label="Razón del Reembolso"
                  isRequired
                  value={refundReason}
                  onValueChange={value => {
                    setRefundReason(value)
                    if (refundReasonError) setRefundReasonError('')
                  }}
                  placeholder="Especifique la razón..."
                  isInvalid={Boolean(refundReasonError)}
                  errorMessage={refundReasonError}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cerrar
                </Button>
                <Button
                  color="danger"
                  onPress={onRefundSale}
                  isLoading={refundSale.isPending}
                  startContent={
                    !refundSale.isPending ? (
                      <RefreshCw className="size-4" />
                    ) : null
                  }
                >
                  Reembolsar Venta
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}
