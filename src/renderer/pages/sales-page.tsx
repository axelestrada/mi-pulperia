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
  Textarea,
} from '@heroui/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertCircle,
  Ban,
  DollarSign,
  Download,
  Eye,
  FileText,
  Filter,
  MoreVertical,
  Receipt,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
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

type FiltersState = {
  search: string
  status: SalesStatusFilter
  minAmount: string
  maxAmount: string
}

const DEFAULT_FILTERS: FiltersState = {
  search: '',
  status: '',
  minAmount: '',
  maxAmount: '',
}

const formatQuantity = (value: number) => {
  const formatted = value.toFixed(3)
  return formatted.replace(/\.?0+$/, '')
}

export const SalesPage = () => {
  const [showFilters, setShowFilters] = useState(false)
  const [showSaleDetail, setShowSaleDetail] = useState(false)
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null)
  const [saleToRefund, setSaleToRefund] = useState<Sale | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [draftFilters, setDraftFilters] =
    useState<FiltersState>(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] =
    useState<FiltersState>(DEFAULT_FILTERS)
  const [cancelReason, setCancelReason] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [cancelReasonError, setCancelReasonError] = useState('')
  const [refundReasonError, setRefundReasonError] = useState('')

  const filters = useMemo(() => {
    const nextFilters: SalesFilters = {
      search: appliedFilters.search.trim() || undefined,
      status: appliedFilters.status || undefined,
      minAmount:
        appliedFilters.minAmount.trim() === ''
          ? undefined
          : Number(appliedFilters.minAmount),
      maxAmount:
        appliedFilters.maxAmount.trim() === ''
          ? undefined
          : Number(appliedFilters.maxAmount),
      page: currentPage,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }

    if (
      typeof nextFilters.minAmount === 'number' &&
      Number.isNaN(nextFilters.minAmount)
    ) {
      delete nextFilters.minAmount
    }
    if (
      typeof nextFilters.maxAmount === 'number' &&
      Number.isNaN(nextFilters.maxAmount)
    ) {
      delete nextFilters.maxAmount
    }

    return nextFilters
  }, [appliedFilters, currentPage])

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

  const onApplyFilters = () => {
    setAppliedFilters(draftFilters)
    setCurrentPage(1)
  }

  const onClearFilters = () => {
    setDraftFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setCurrentPage(1)
  }

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
            variant={showFilters ? 'solid' : 'flat'}
            startContent={<Filter className="size-4" />}
            onPress={() => setShowFilters(prev => !prev)}
          >
            Filtros
          </Button>
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

      {showFilters && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 font-semibold">
              <Filter className="size-5" />
              Filtros de Búsqueda
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input
                label="Buscar"
                value={draftFilters.search}
                onValueChange={value =>
                  setDraftFilters(prev => ({ ...prev, search: value }))
                }
                placeholder="Número de venta, cliente..."
              />

              <Select
                label="Estado"
                selectedKeys={[draftFilters.status || 'all']}
                onSelectionChange={keys => {
                  const next = Array.from(keys)[0]?.toString() ?? 'all'
                  setDraftFilters(prev => ({
                    ...prev,
                    status: next === 'all' ? '' : (next as SalesStatusFilter),
                  }))
                }}
              >
                <SelectItem key="all">Todos los estados</SelectItem>
                <SelectItem key="completed">Completada</SelectItem>
                <SelectItem key="cancelled">Cancelada</SelectItem>
                <SelectItem key="refunded">Reembolsada</SelectItem>
              </Select>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Monto Mín."
                  type="number"
                  step="0.01"
                  value={draftFilters.minAmount}
                  onValueChange={value =>
                    setDraftFilters(prev => ({ ...prev, minAmount: value }))
                  }
                  placeholder="0.00"
                />
                <Input
                  label="Monto Máx."
                  type="number"
                  step="0.01"
                  value={draftFilters.maxAmount}
                  onValueChange={value =>
                    setDraftFilters(prev => ({ ...prev, maxAmount: value }))
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="flat" onPress={onClearFilters}>
                Limpiar
              </Button>
              <Button color="primary" onPress={onApplyFilters}>
                Aplicar Filtros
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <div className="font-semibold">Lista de Ventas</div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : salesList.length === 0 ? (
            <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-default-500">
              <Receipt className="size-8" />
              <p>No se encontraron ventas</p>
            </div>
          ) : (
            <>
              <Table aria-label="Historial de ventas">
                <TableHeader>
                  <TableColumn>NÚMERO</TableColumn>
                  <TableColumn>FECHA</TableColumn>
                  <TableColumn>CLIENTE</TableColumn>
                  <TableColumn className="text-right">TOTAL</TableColumn>
                  <TableColumn className="text-center">ESTADO</TableColumn>
                  <TableColumn className="text-right">ACCIONES</TableColumn>
                </TableHeader>
                <TableBody items={salesList}>
                  {(sale: Sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">
                        {sale.saleNumber}
                      </TableCell>
                      <TableCell>
                        {format(new Date(sale.createdAt), 'PPp', {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{sale.customerName || 'Cliente general'}</p>
                          {sale.customerDocument && (
                            <p className="text-xs text-default-500">
                              {sale.customerDocument}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(fromCents(sale.total))}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(sale.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            aria-label={`Acciones de venta ${sale.saleNumber}`}
                          >
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
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-small text-default-500">
                    Mostrando {salesList.length} de {pagination.total}
                  </p>
                  <Pagination
                    page={currentPage}
                    total={pagination.totalPages}
                    showControls
                    onChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
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
        scrollBehavior="inside"
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

