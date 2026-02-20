import { zodResolver } from '@hookform/resolvers/zod'
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
  Receipt,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { formatCurrency } from '../../shared/utils/formatCurrency'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form'
import { Input } from '../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Separator } from '../components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { Textarea } from '../components/ui/textarea'
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

// Form validation schemas
const filtersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['completed', 'cancelled', 'refunded', '']).optional(),
  customerId: z.number().optional(),
  cashSessionId: z.number().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
})

const cancelSaleSchema = z.object({
  reason: z.string().min(1, 'Debe especificar una razón'),
})

const refundSaleSchema = z.object({
  reason: z.string().min(1, 'Debe especificar una razón'),
})

const formatQuantity = (value: number) => {
  const formatted = value.toFixed(3)
  return formatted.replace(/\.?0+$/, '')
}

type FiltersFormData = z.infer<typeof filtersSchema>
type CancelSaleFormData = z.infer<typeof cancelSaleSchema>
type RefundSaleFormData = z.infer<typeof refundSaleSchema>

export const SalesPage = () => {
  const [showFilters, setShowFilters] = useState(false)
  const [showSaleDetail, setShowSaleDetail] = useState(false)
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null)
  const [saleToRefund, setSaleToRefund] = useState<Sale | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Form for filters
  const filtersForm = useForm<FiltersFormData>({
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      search: '',
      status: '',
    },
  })

  const cancelForm = useForm<CancelSaleFormData>({
    resolver: zodResolver(cancelSaleSchema),
  })

  const refundForm = useForm<RefundSaleFormData>({
    resolver: zodResolver(refundSaleSchema),
  })

  // Build filters for API
  const filters: SalesFilters = {
    ...filtersForm.watch(),
    page: currentPage,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  }

  // Remove empty values
  Object.keys(filters).forEach(key => {
    if (filters[key] === '' || filters[key] === undefined) {
      delete filters[key]
    }
  })

  // Queries
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

  // Mutations
  const cancelSale = useCancelSale()
  const refundSale = useRefundSale()

  // Handlers
  const onApplyFilters = () => {
    setCurrentPage(1)
    // Filters are applied automatically through the form watch
  }

  const onClearFilters = () => {
    filtersForm.reset({
      search: '',
      status: '',
    })
    setCurrentPage(1)
  }

  const onViewSale = (sale: Sale) => {
    setSelectedSaleId(sale.id)
    setShowSaleDetail(true)
  }

  const onCancelSale = async (data: CancelSaleFormData) => {
    if (!saleToCancel) return

    try {
      await cancelSale.mutateAsync({
        id: saleToCancel.id,
        reason: data.reason,
      })
      setShowCancelDialog(false)
      setSaleToCancel(null)
      cancelForm.reset()
    } catch (error) {
      console.error('Error cancelling sale:', error)
    }
  }

  const onRefundSale = async (data: RefundSaleFormData) => {
    if (!saleToRefund) return

    try {
      await refundSale.mutateAsync({
        id: saleToRefund.id,
        reason: data.reason,
      })
      setShowRefundDialog(false)
      setSaleToRefund(null)
      refundForm.reset()
    } catch (error) {
      console.error('Error refunding sale:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completada</Badge>
      case 'cancelled':
        return <Badge variant="secondary">Cancelada</Badge>
      case 'refunded':
        return <Badge variant="destructive">Reembolsada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ventas</h1>
          <p className="text-muted-foreground">
            Gestione y consulte todas las ventas realizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Ventas
              </CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalSales}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos Totales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(fromCents(summary.totalRevenue))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Promedio por Venta
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(fromCents(summary.averageSaleAmount))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {Object.entries(summary.salesByStatus).map(
                  ([status, count]) => (
                    <div key={status} className="flex justify-between">
                      <span className="capitalize">{status}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...filtersForm}>
              <form
                onSubmit={filtersForm.handleSubmit(onApplyFilters)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={filtersForm.control}
                    name="search"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Buscar</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Número de venta, cliente..."
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={filtersForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Todos los estados" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">
                              Todos los estados
                            </SelectItem>
                            <SelectItem value="completed">
                              Completada
                            </SelectItem>
                            <SelectItem value="cancelled">Cancelada</SelectItem>
                            <SelectItem value="refunded">
                              Reembolsada
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <FormField
                      control={filtersForm.control}
                      name="minAmount"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Monto Mín.</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              onChange={e =>
                                field.onChange(
                                  parseFloat(e.target.value) || undefined
                                )
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={filtersForm.control}
                      name="maxAmount"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Monto Máx.</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              onChange={e =>
                                field.onChange(
                                  parseFloat(e.target.value) || undefined
                                )
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClearFilters}
                  >
                    Limpiar
                  </Button>
                  <Button type="submit">Aplicar Filtros</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : salesData?.data?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron ventas</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData?.data?.map(sale => (
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
                        {sale.customerName || 'Cliente general'}
                        {sale.customerDocument && (
                          <div className="text-xs text-muted-foreground">
                            {sale.customerDocument}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(fromCents(sale.total))}
                      </TableCell>
                      <TableCell>{getStatusBadge(sale.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="sm">
                              •••
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewSale(sale)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalle
                            </DropdownMenuItem>
                            {sale.status === 'completed' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSaleToCancel(sale)
                                    setShowCancelDialog(true)
                                  }}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Cancelar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSaleToRefund(sale)
                                    setShowRefundDialog(true)
                                  }}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Reembolsar
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {salesData?.pagination && salesData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {salesData.data.length} de{' '}
                    {salesData.pagination.total} ventas
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={!salesData.pagination.hasPrev}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={!salesData.pagination.hasNext}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      {topProducts && topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topProducts.map((product, index) => (
                <div
                  key={product.presentationId}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{product.presentationName}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.productName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {product.totalQuantity} unidades
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(fromCents(product.totalRevenue))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sale Detail Dialog */}
      <Dialog open={showSaleDetail} onOpenChange={setShowSaleDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Venta</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Número de Venta</p>
                  <p>{selectedSale.saleNumber}</p>
                  {/* TODO: poner aqui un boton para copiar el numero de la venta */}
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
                  <p>{selectedSale.customer?.name || 'Cliente general'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Estado</p>
                  {getStatusBadge(selectedSale.status)}
                </div>
              </div>

              <Separator />

              {/* Items */}
              <div>
                <h4 className="font-medium mb-2">Artículos</h4>
                <div className="space-y-2">
                  {selectedSale.items?.map(item => {
                    const displayName = `${item.productName} (${item.presentationName})`
                    const factor = item.presentationFactor || 1
                    const presentationQuantity = item.quantity / factor
                    const presentationUnitLabel =
                      UNIT_CONFIG[item.presentationUnit]?.label || 'ud'
                    const inventoryUnitLabel =
                      UNIT_CONFIG[item.productBaseUnit]?.label || 'ud'
                    const showInventoryBreakdown = factor !== 1

                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {displayName}
                          </p>
                          <p className="text-xs">
                            {showInventoryBreakdown ? (
                              <>
                                {formatQuantity(presentationQuantity)}
                                {presentationUnitLabel} x{' '}
                                {formatCurrency(fromCents(item.unitPrice))} x{' '}
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
                                {formatQuantity(item.quantity)}
                                {inventoryUnitLabel} x{' '}
                                {formatCurrency(fromCents(item.unitPrice))}
                              </>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(fromCents(item.totalPrice))}
                          </p>
                          {item.discount > 0 && (
                            <p className="text-xs text-green-600">
                              Desc: -{formatCurrency(item.discount)}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Separator />

              {/* Payments */}
              <div>
                <h4 className="font-medium mb-2">Pagos</h4>
                <div className="space-y-2">
                  {selectedSale.payments?.map(payment => {
                    return (
                      <div
                        key={payment.id}
                        className="flex justify-between items-center"
                      >
                        <span className="capitalize">{payment.method}</span>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(fromCents(payment.amount))}
                          </p>
                          {payment.changeAmount && (
                            <p className="text-xs text-blue-600">
                              Cambio:{' '}
                              {formatCurrency(fromCents(payment.changeAmount))}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    {formatCurrency(fromCents(selectedSale.subtotal))}
                  </span>
                </div>
                {selectedSale.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento:</span>
                    <span>
                      -{formatCurrency(fromCents(selectedSale.discountAmount))}
                    </span>
                  </div>
                )}
                {selectedSale.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Impuesto:</span>
                    <span>
                      {formatCurrency(fromCents(selectedSale.taxAmount))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(fromCents(selectedSale.total))}</span>
                </div>
              </div>

              {selectedSale.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-1">Notas</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSale.notes}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Sale Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Venta</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta acción cancelará la venta y revertirá los movimientos de
              inventario.
            </AlertDescription>
          </Alert>
          <Form {...cancelForm}>
            <form
              onSubmit={cancelForm.handleSubmit(onCancelSale)}
              className="space-y-4"
            >
              <FormField
                control={cancelForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón de la Cancelación *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Especifique la razón..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCancelDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={cancelSale.isPending}
                >
                  {cancelSale.isPending ? 'Cancelando...' : 'Cancelar Venta'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Refund Sale Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reembolsar Venta</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Esta acción reembolsará la venta y revertirá los movimientos de
              inventario.
            </AlertDescription>
          </Alert>
          <Form {...refundForm}>
            <form
              onSubmit={refundForm.handleSubmit(onRefundSale)}
              className="space-y-4"
            >
              <FormField
                control={refundForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón del Reembolso *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Especifique la razón..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRefundDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={refundSale.isPending}
                >
                  {refundSale.isPending
                    ? 'Reembolsando...'
                    : 'Reembolsar Venta'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
