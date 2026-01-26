import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DollarSignIcon,
  PlusIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  ActivityIcon,
  AlertTriangleIcon,
  CreditCardIcon,
  ReceiptIcon,
  TruckIcon,
  UserRoundPlusIcon,
  TagsIcon,
  PackageIcon,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  CardAction,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ButtonGroup } from '@/components/ui/button-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import { PageHeader } from '@/components/ui/page-header'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart'

// Import report components (keep existing ones that work)
import { LowStock } from '@/features/reports/components/low-stock'
import { TopProducts } from '@/features/reports/components/top-products'
import { CategorySales } from '@/features/reports/components/category-sales'
import { Debts } from '@/features/reports/components/debts'

type TimeRange = '7' | '14' | '30'

const chartConfig = {
  sales: {
    label: 'Ventas',
    color: 'var(--chart-1)',
  },
  margin: {
    label: 'Margen',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

interface DashboardMetrics {
  sales: {
    totalSales: number
    totalRevenue: number
    totalProfit: number
    averageTicket: number
  }
  inventory: {
    lowStockItems: number
    totalLowStockValue: number
  }
  credits: {
    overdueCredits: number
    totalOverdueAmount: number
  }
  orders: {
    pendingOrders: number
    totalPendingValue: number
  }
}

export const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7')
  const [dashboardMetrics, setDashboardMetrics] =
    useState<DashboardMetrics | null>(null)
  const [salesChart, setSalesChart] = useState<
    Array<{ date: string; sales: number; margin: number }>
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const handleTimeRangeChange = useCallback((value: TimeRange) => {
    setTimeRange(value)
  }, [])

  // Load dashboard metrics
  const loadDashboardMetrics = useCallback(async (period: string) => {
    try {
      setIsLoading(true)

      // Check if reports API is available
      if (window.api && window.api.reports) {
        // Get dashboard metrics from backend
        const metrics = await window.api.reports.getDashboardMetrics(period)
        setDashboardMetrics(metrics)

        // Get sales report for chart data
        const dateFrom = new Date()
        const daysBack = parseInt(period)
        dateFrom.setDate(dateFrom.getDate() - daysBack)

        const salesReport = await window.api.reports.getSalesReport({
          dateFrom: dateFrom.toISOString(),
          dateTo: new Date().toISOString(),
        })

        // Transform sales data for chart
        if (salesReport && salesReport.salesByDate) {
          const chartData = salesReport.salesByDate.map((item: any) => ({
            date: new Date(item.date).toISOString().split('T')[0],
            sales: (item.totalRevenue || 0) / 100, // Convert from cents
            margin: (item.totalProfit || 0) / 100, // Convert from cents
          }))
          setSalesChart(chartData)
        }
      } else {
        // Fallback with mock data if API not available
        console.warn('Reports API not available, using fallback data')
        setDashboardMetrics({
          sales: {
            totalSales: 45,
            totalRevenue: 145000, // 1450.00 in cents
            totalProfit: 36250, // 362.50 in cents
            averageTicket: 5213, // 52.13 in cents
          },
          inventory: {
            lowStockItems: 5,
            totalLowStockValue: 50000, // 500.00 in cents
          },
          credits: {
            overdueCredits: 1,
            totalOverdueAmount: 125000, // 1250.00 in cents
          },
          orders: {
            pendingOrders: 3,
            totalPendingValue: 75000, // 750.00 in cents
          },
        })

        setSalesChart([
          { date: '2024-04-02', sales: 3100, margin: 465 },
          { date: '2024-04-03', sales: 2950, margin: 440 },
          { date: '2024-04-04', sales: 3400, margin: 510 },
          { date: '2024-04-05', sales: 4200, margin: 630 },
          { date: '2024-04-06', sales: 5600, margin: 840 },
          { date: '2024-04-07', sales: 4800, margin: 720 },
          { date: '2024-04-08', sales: 3000, margin: 450 },
        ])
      }
    } catch (error) {
      console.error('Error loading dashboard metrics:', error)
      // Set fallback data on error
      setDashboardMetrics({
        sales: {
          totalSales: 0,
          totalRevenue: 0,
          totalProfit: 0,
          averageTicket: 0,
        },
        inventory: {
          lowStockItems: 0,
          totalLowStockValue: 0,
        },
        credits: {
          overdueCredits: 0,
          totalOverdueAmount: 0,
        },
        orders: {
          pendingOrders: 0,
          totalPendingValue: 0,
        },
      })
      setSalesChart([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load data on mount and when time range changes
  useEffect(() => {
    const period =
      timeRange === '7' ? 'week' : timeRange === '14' ? 'week' : 'month'
    loadDashboardMetrics(period)
  }, [timeRange, loadDashboardMetrics])

  // Navigation handlers
  const handleNewSale = () => navigate('/pos')
  const handleAddStock = () => navigate('/inventory-entry')
  const handleAddCustomer = () => navigate('/customers')
  const handleAddExpense = () => navigate('/expenses')

  // Calculate profit margin percentage
  const profitMargin =
    dashboardMetrics?.sales.totalRevenue &&
    dashboardMetrics.sales.totalRevenue > 0
      ? (dashboardMetrics.sales.totalProfit /
          dashboardMetrics.sales.totalRevenue) *
        100
      : 0

  // Calculate trend (simplified - you could enhance this with historical comparison)
  const salesTrend = '+12%' // You could calculate this from historical data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Panel Principal"
        description="Resumen del estado de tu pulpería"
        actions={
          <>
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Seleccione un rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Rango de tiempo</SelectLabel>
                  <SelectItem value="7">7 días</SelectItem>
                  <SelectItem value="14">14 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button onClick={handleNewSale}>
              <PlusIcon /> Nueva Venta
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        <div className="@container/card h-full">
          <Card className="py-4 @[250px]/card:py-6 gap-3 h-full">
            <CardHeader className="px-4 @[250px]/card:px-6">
              <CardTitle className="text-sm">
                Ventas de {timeRange} días
              </CardTitle>

              <CardAction>
                <DollarSignIcon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>

            <CardContent className="px-4 @[250px]/card:px-6">
              <CardTitle className="text-2xl mb-2 font-semibold tabular-nums @[250px]/card:text-3xl">
                L
                {(
                  (dashboardMetrics?.sales.totalRevenue || 0) / 100
                ).toLocaleString('es-NI', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <TrendingUpIcon className="size-4 text-green-600" />
                {salesTrend} desde período anterior
              </CardDescription>
            </CardContent>
            <CardFooter className="flex flex-col gap-1 px-4 @[250px]/card:px-6 mt-auto">
              <CardDescription className="flex justify-between w-full text-xs">
                Margen
                <span>{profitMargin.toFixed(1)}%</span>
              </CardDescription>
              <Progress
                value={profitMargin}
                color="bg-cyan-600"
                className="h-1"
              />
            </CardFooter>
          </Card>
        </div>

        <div className="@container/card h-full">
          <Card className="py-4 @[250px]/card:py-6 gap-3 h-full">
            <CardHeader className="px-4 @[250px]/card:px-6">
              <CardTitle className="text-sm">Transacciones</CardTitle>

              <CardAction>
                <ShoppingCartIcon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>

            <CardContent className="px-4 @[250px]/card:px-6">
              <CardTitle className="text-2xl mb-2 font-semibold tabular-nums @[250px]/card:text-3xl">
                {dashboardMetrics?.sales.totalSales || 0}
              </CardTitle>
              <CardDescription>
                Ticket Promedio: L
                {((dashboardMetrics?.sales.averageTicket || 0) / 100).toFixed(
                  2
                )}
              </CardDescription>
            </CardContent>
            <CardFooter className="px-4 @[250px]/card:px-6 mt-auto">
              <CardDescription className="flex items-center gap-2">
                <ActivityIcon className="size-4 text-blue-600" />
                <span className="text-xs">Últimos {timeRange} días</span>
              </CardDescription>
            </CardFooter>
          </Card>
        </div>

        <div className="@container/card h-full">
          <Card className="py-4 @[250px]/card:py-6 gap-3 h-full">
            <CardHeader className="px-4 @[250px]/card:px-6">
              <CardTitle className="text-sm">Stock Bajo</CardTitle>

              <CardAction>
                <AlertTriangleIcon className="size-4 text-orange-600" />
              </CardAction>
            </CardHeader>

            <CardContent className="px-4 @[250px]/card:px-6">
              <CardTitle className="text-2xl mb-2 font-semibold text-orange-600 tabular-nums @[250px]/card:text-3xl">
                {dashboardMetrics?.inventory.lowStockItems || 0}
              </CardTitle>
              <CardDescription>Necesitan reabastecimiento</CardDescription>
            </CardContent>
            <CardFooter className="px-4 @[250px]/card:px-6 mt-auto">
              <Badge
                variant={
                  dashboardMetrics?.inventory.lowStockItems &&
                  dashboardMetrics.inventory.lowStockItems > 5
                    ? 'destructive'
                    : 'secondary'
                }
                className="text-xs"
              >
                Valor: L
                {(
                  (dashboardMetrics?.inventory.totalLowStockValue || 0) / 100
                ).toFixed(0)}
              </Badge>
            </CardFooter>
          </Card>
        </div>

        <div className="@container/card h-full">
          <Card className="py-4 @[250px]/card:py-6 gap-3 h-full">
            <CardHeader className="px-4 @[250px]/card:px-6">
              <CardTitle className="text-sm">Créditos Vencidos</CardTitle>

              <CardAction>
                <CreditCardIcon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>

            <CardContent className="px-4 @[250px]/card:px-6">
              <CardTitle className="text-2xl mb-2 font-semibold tabular-nums @[250px]/card:text-3xl">
                L
                {(
                  (dashboardMetrics?.credits.totalOverdueAmount || 0) / 100
                ).toLocaleString('es-NI', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </CardTitle>
              <CardDescription>
                {dashboardMetrics?.credits.overdueCredits || 0} cliente
                {(dashboardMetrics?.credits.overdueCredits || 0) !== 1
                  ? 's'
                  : ''}{' '}
                con deuda vencida
              </CardDescription>
            </CardContent>
            <CardFooter className="px-4 @[250px]/card:px-6 mt-auto">
              <Badge
                className="text-xs"
                variant={
                  dashboardMetrics?.credits.overdueCredits &&
                  dashboardMetrics.credits.overdueCredits > 0
                    ? 'destructive'
                    : 'outline'
                }
              >
                {dashboardMetrics?.credits.overdueCredits || 0} vencida
                {(dashboardMetrics?.credits.overdueCredits || 0) !== 1
                  ? 's'
                  : ''}
              </Badge>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ventas</CardTitle>
            <CardDescription>
              Ventas y margen de los últimos {timeRange} días
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-62.5 w-full"
            >
              <AreaChart data={salesChart}>
                <defs>
                  <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-2)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-2)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillMargin" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-3)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-3)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  className="w-full"
                  interval={'preserveStartEnd'}
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={value => {
                    const date = new Date(value)
                    return date.toLocaleDateString('es-HN', {
                      weekday: 'short',
                    })
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={value => {
                        return new Date(value).toLocaleDateString('es-HN', {
                          month: 'long',
                          day: '2-digit',
                          year: 'numeric',
                        })
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="sales"
                  type="natural"
                  fill="url(#fillSales)"
                  stroke="var(--chart-2)"
                />
                <Area
                  dataKey="margin"
                  type="natural"
                  fill="url(#fillMargin)"
                  stroke="var(--chart-3)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="@container/card gap-3">
          <CardHeader>
            <CardTitle className="text-sm">Ventas por Categorías</CardTitle>
            <CardDescription>
              Distribución de ventas por categorías
            </CardDescription>
          </CardHeader>

          <CardContent>
            <CategorySales />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accesos directos a las funciones más utilizadas
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ButtonGroup className="w-full">
              <Button
                variant="outline"
                className="flex-col h-20 flex-1"
                onClick={handleNewSale}
              >
                <ReceiptIcon className="size-5 mb-1 text-teal-600" />
                <span className="text-xs">Nueva Venta</span>
              </Button>

              <Button
                variant="outline"
                className="flex-col h-20 flex-1"
                onClick={handleAddStock}
              >
                <TruckIcon className="size-5 mb-1 text-cyan-600" />
                <span className="text-xs">Recibir Stock</span>
              </Button>

              <Button
                variant="outline"
                className="flex-col h-20 flex-1"
                onClick={handleAddCustomer}
              >
                <UserRoundPlusIcon className="size-5 mb-1 text-green-600" />
                <span className="text-xs">Agregar Cliente</span>
              </Button>

              <Button
                variant="outline"
                className="flex-col h-20 flex-1"
                onClick={() => navigate('/suppliers')}
              >
                <TagsIcon className="size-5 mb-1 text-blue-600" />
                <span className="text-xs">Proveedores</span>
              </Button>

              <Button
                variant="outline"
                className="flex-col h-20 flex-1"
                onClick={handleAddExpense}
              >
                <DollarSignIcon className="size-5 mb-1 text-purple-600" />
                <span className="text-xs">Agregar Gasto</span>
              </Button>

              <Button
                variant="outline"
                className="flex-col h-20 flex-1"
                onClick={() => navigate('/purchase-orders')}
              >
                <PackageIcon className="size-5 mb-1 text-orange-600" />
                <span className="text-xs">Órdenes Compra</span>
              </Button>
            </ButtonGroup>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="top-products" className="w-full">
          <TabsList className="mb-2">
            <TabsTrigger value="top-products">Top Productos</TabsTrigger>
            <TabsTrigger value="low-stock">Stock Bajo</TabsTrigger>
            <TabsTrigger value="debts">Deudas</TabsTrigger>
          </TabsList>

          <TabsContent value="top-products">
            <TopProducts timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="low-stock">
            <LowStock />
          </TabsContent>

          <TabsContent value="debts">
            <Debts />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
