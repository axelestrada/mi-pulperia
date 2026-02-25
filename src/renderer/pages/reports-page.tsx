import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Calendar,
  DollarSign,
  FileText,
  Package,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  SHIFT_HANDOVER_UPDATED_EVENT,
  getShiftModuleNote,
  setShiftModuleNote,
} from '@/features/operations/model/shift-handover-storage'
import { getTopUpRecords } from '@/features/top-ups/model/top-ups-storage'

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

export function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const [isLoading, setIsLoading] = useState(false)
  const [salesReport, setSalesReport] = useState<SalesReportResponse | null>(null)
  const [profitsReport, setProfitsReport] =
    useState<ProfitsReportResponse | null>(null)
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([])
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [shiftNote, setShiftNote] = useState(() => getShiftModuleNote('reports'))

  useEffect(() => {
    const refreshShiftNote = () => setShiftNote(getShiftModuleNote('reports'))
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

  const topUpsSummary = useMemo(() => {
    const records = getTopUpRecords().filter(record => record.cost > 0)
    const fromDate = new Date(dateFilters.dateFrom).getTime()
    const toDate = new Date(dateFilters.dateTo).getTime()
    const filtered = records.filter(record => {
      const timestamp = new Date(record.createdAt).getTime()
      return timestamp >= fromDate && timestamp <= toDate
    })

    const amount = filtered.reduce((sum, record) => sum + record.amount, 0)
    const cost = filtered.reduce((sum, record) => sum + record.cost, 0)

    return {
      count: filtered.length,
      amount,
      cost,
      margin: amount - cost,
    }
  }, [dateFilters.dateFrom, dateFilters.dateTo])

  const loadReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const [sales, profits, metrics, top] = await Promise.all([
        window.api.reports.getSalesReport(dateFilters),
        window.api.reports.getProfitsReport(dateFilters),
        window.api.reports.getDashboardMetrics(dateRange),
        window.api.reports.getTopProducts({
          ...dateFilters,
          limit: 10,
          sortBy: 'revenue',
        }),
      ])
      setSalesReport(sales as SalesReportResponse)
      setProfitsReport(profits as ProfitsReportResponse)
      setDashboard(metrics as DashboardResponse)
      setTopProducts(Array.isArray(top) ? (top as TopProductItem[]) : [])
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
          <p className="text-muted-foreground">
            Vista consolidada de ventas, ganancias, gastos y recargas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={dateRange}
            onValueChange={value => setDateRange(value as DateRange)}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Últimos 7 días</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => void loadReports()}>
            Recargar
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
          Cargando reportes...
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              L {((salesReport?.summary?.totalRevenue || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Ventas netas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              L {((profitsReport?.summary?.netProfit || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Margen: {(profitsReport?.summary?.netMargin || 0).toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              L {((profitsReport?.summary?.totalExpenses || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Egresos pagados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recargas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topUpsSummary.count}</div>
            <p className="text-xs text-muted-foreground">
              Margen: L {topUpsSummary.margin.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Top Productos
            </CardTitle>
            <CardDescription>Productos con más ingreso en el período</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos disponibles.</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map(product => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between rounded border p-2"
                  >
                    <div>
                      <p className="font-medium">{product.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.categoryName || 'Sin categoría'}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      L {((product.totalRevenue || 0) / 100).toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Resumen Operativo
            </CardTitle>
            <CardDescription>Métricas clave para el cambio de turno</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Ventas realizadas</span>
              <span className="font-semibold">{dashboard?.sales?.totalSales || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Créditos vencidos</span>
              <span className="font-semibold">
                {dashboard?.credits?.overdueCredits || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Órdenes pendientes</span>
              <span className="font-semibold">
                {dashboard?.orders?.pendingOrders || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Recargas (monto / costo)</span>
              <span className="font-semibold">
                L {topUpsSummary.amount.toFixed(2)} / L {topUpsSummary.cost.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nota de Turno</CardTitle>
          <CardDescription>
            Escriba observaciones de reportes para quien continúa turno.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={shiftNote}
            onChange={e => setShiftNote(e.target.value)}
            placeholder="Ej. Revisar caída de margen en recargas y gastos de transporte."
          />
          <Button size="sm" onClick={handleSaveShiftNote}>
            Guardar nota
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
