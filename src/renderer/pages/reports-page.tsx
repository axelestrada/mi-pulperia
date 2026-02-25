import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Calendar,
  DollarSign,
  FileText,
  Package,
} from 'lucide-react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Select,
  SelectItem,
  Spinner,
  Textarea,
} from '@heroui/react'
import {
  SHIFT_HANDOVER_UPDATED_EVENT,
  getShiftModuleNote,
  setShiftModuleNote,
} from '@/features/operations/model/shift-handover-storage'
import { topUpsService } from '@/features/top-ups/services/top-ups-service'

type DateRange = 'today' | 'week' | 'month' | 'year'

type SalesReportSummary = {
  totalRevenue?: number
}

type SalesReportResponse = {
  summary?: SalesReportSummary
}

type ProfitsSummary = {
  netProfit?: number
  netMargin?: number
  totalExpenses?: number
}

type ProfitsReportResponse = {
  summary?: ProfitsSummary
}

type TopProductItem = {
  productId: number
  productName: string
  categoryName?: string
  totalRevenue?: number
}

type DashboardResponse = {
  sales?: { totalSales?: number }
  credits?: { overdueCredits?: number }
  orders?: { pendingOrders?: number }
}

type TopUpsSummary = {
  count: number
  amount: number
  cost: number
  margin: number
}

export function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const [isLoading, setIsLoading] = useState(false)
  const [salesReport, setSalesReport] = useState<SalesReportResponse | null>(null)
  const [profitsReport, setProfitsReport] =
    useState<ProfitsReportResponse | null>(null)
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([])
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [topUpsSummary, setTopUpsSummary] = useState<TopUpsSummary>({
    count: 0,
    amount: 0,
    cost: 0,
    margin: 0,
  })
  const [shiftNote, setShiftNoteState] = useState(() => getShiftModuleNote('reports'))

  useEffect(() => {
    const refreshShiftNote = () => setShiftNoteState(getShiftModuleNote('reports'))
    window.addEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
    return () =>
      window.removeEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
  }, [])

  const dateFilters = useMemo(() => {
    const dateTo = new Date()
    const dateFrom = new Date()
    if (dateRange === 'today') {
      dateFrom.setHours(0, 0, 0, 0)
    } else if (dateRange === 'week') {
      dateFrom.setDate(dateFrom.getDate() - 7)
    } else if (dateRange === 'month') {
      dateFrom.setMonth(dateFrom.getMonth() - 1)
    } else {
      dateFrom.setFullYear(dateFrom.getFullYear() - 1)
    }
    return {
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
    }
  }, [dateRange])

  const loadReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const [sales, profits, metrics, top, topUps] = await Promise.all([
        window.api.reports.getSalesReport(dateFilters),
        window.api.reports.getProfitsReport(dateFilters),
        window.api.reports.getDashboardMetrics(dateRange),
        window.api.reports.getTopProducts({
          ...dateFilters,
          limit: 10,
          sortBy: 'revenue',
        }),
        topUpsService.getSummary(dateFilters),
      ])
      setSalesReport(sales as SalesReportResponse)
      setProfitsReport(profits as ProfitsReportResponse)
      setDashboard(metrics as DashboardResponse)
      setTopProducts(Array.isArray(top) ? (top as TopProductItem[]) : [])
      setTopUpsSummary(topUps as TopUpsSummary)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      sileo.error({ title: 'No se pudieron cargar los reportes', description: message })
    } finally {
      setIsLoading(false)
    }
  }, [dateFilters, dateRange])

  useEffect(() => {
    void loadReports()
  }, [loadReports])

  const handleSaveShiftNote = () => {
    setShiftModuleNote('reports', shiftNote)
    sileo.success({ title: 'Nota de turno guardada en reportes' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-default-500">
            Vista consolidada de ventas, ganancias, gastos y recargas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            disallowEmptySelection
            selectedKeys={[dateRange]}
            className="w-44"
            onSelectionChange={key =>
              setDateRange(String(key.currentKey || 'month') as DateRange)
            }
          >
            <SelectItem key="today">Hoy</SelectItem>
            <SelectItem key="week">Ultimos 7 dias</SelectItem>
            <SelectItem key="month">Ultimo mes</SelectItem>
            <SelectItem key="year">Ultimo ano</SelectItem>
          </Select>
          <Button variant="flat" onPress={() => void loadReports()}>
            Recargar
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-large border border-default-200 p-3 text-sm text-default-500">
          <Spinner size="sm" />
          Cargando reportes...
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="py-4">
            <p className="text-sm text-default-500">Ingresos</p>
            <p className="text-2xl font-semibold">
              L {((salesReport?.summary?.totalRevenue || 0) / 100).toFixed(2)}
            </p>
            <p className="text-xs text-default-500">Ventas netas</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <p className="text-sm text-default-500">Ganancia Neta</p>
            <p className="text-2xl font-semibold">
              L {((profitsReport?.summary?.netProfit || 0) / 100).toFixed(2)}
            </p>
            <p className="text-xs text-default-500">
              Margen: {(profitsReport?.summary?.netMargin || 0).toFixed(2)}%
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <p className="text-sm text-default-500">Gasto Total</p>
            <p className="text-2xl font-semibold">
              L {((profitsReport?.summary?.totalExpenses || 0) / 100).toFixed(2)}
            </p>
            <p className="text-xs text-default-500">Egresos pagados</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="py-4">
            <p className="text-sm text-default-500">Recargas</p>
            <p className="text-2xl font-semibold">{topUpsSummary.count}</p>
            <p className="text-xs text-default-500">
              Margen: L {topUpsSummary.margin.toFixed(2)}
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="size-4" />
              Top Productos
            </div>
          </CardHeader>
          <CardBody>
            {topProducts.length === 0 ? (
              <p className="text-sm text-default-500">Sin datos disponibles.</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map(product => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between rounded-large border border-default-200 px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">{product.productName}</p>
                      <p className="text-xs text-default-500">
                        {product.categoryName || 'Sin categoria'}
                      </p>
                    </div>
                    <Chip variant="flat">
                      L {((product.totalRevenue || 0) / 100).toFixed(2)}
                    </Chip>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="size-4" />
              Resumen Operativo
            </div>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-default-500">Ventas registradas</span>
              <span className="font-semibold">{dashboard?.sales?.totalSales || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-default-500">Creditos vencidos</span>
              <span className="font-semibold">{dashboard?.credits?.overdueCredits || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-default-500">Ordenes pendientes</span>
              <span className="font-semibold">{dashboard?.orders?.pendingOrders || 0}</span>
            </div>
            <div className="rounded-large border border-default-200 p-3">
              <p className="mb-2 font-medium">Nota de turno (reportes)</p>
              <Textarea
                value={shiftNote}
                onValueChange={setShiftNoteState}
                placeholder="Ej. Revisar caida de margen en recargas y gastos de transporte."
              />
              <Button className="mt-3" size="sm" onPress={handleSaveShiftNote}>
                Guardar nota
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="grid gap-4 md:grid-cols-3">
          <div className="rounded-large border border-default-200 p-3">
            <div className="mb-1 flex items-center gap-2 text-default-500">
              <DollarSign className="size-4" />
              Ingresos de recarga
            </div>
            <p className="text-lg font-semibold">L {topUpsSummary.amount.toFixed(2)}</p>
          </div>
          <div className="rounded-large border border-default-200 p-3">
            <div className="mb-1 flex items-center gap-2 text-default-500">
              <Package className="size-4" />
              Costo de recargas
            </div>
            <p className="text-lg font-semibold">L {topUpsSummary.cost.toFixed(2)}</p>
          </div>
          <div className="rounded-large border border-default-200 p-3">
            <div className="mb-1 flex items-center gap-2 text-default-500">
              <BarChart3 className="size-4" />
              Margen recargas
            </div>
            <p className="text-lg font-semibold">L {topUpsSummary.margin.toFixed(2)}</p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
