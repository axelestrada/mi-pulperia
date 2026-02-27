import {
  Button,
  Card,
  Chip,
  cn,
  Select,
  SelectItem,
  Spinner,
} from '@heroui/react'
import { FileText, Package, ShoppingCart } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/../shared/utils/formatCurrency'
import { PageHeader } from '@/components/ui/page-header'

type TimeRange = '7' | '14' | '30'

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
    activeCredits: number
    totalActiveAmount: number
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
  const [salesByDate, setSalesByDate] = useState<
    Array<{ date: string; totalRevenue: number }>
  >([])
  const [topProducts, setTopProducts] = useState<
    Array<{ name: string; quantity: number; revenue: number }>
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const handleTimeRangeChange = useCallback((value: TimeRange) => {
    setTimeRange(value)
  }, [])

  const loadDashboardMetrics = useCallback(
    async () => {
      try {
        setIsLoading(true)

        const dateFrom = new Date()
        dateFrom.setDate(dateFrom.getDate() - Number(timeRange))

        const [metrics, salesReport, topProductsReport] = await Promise.all([
          window.api.reports.getDashboardMetrics('today'),
          window.api.reports.getSalesReport({
            dateFrom: dateFrom.toISOString(),
            dateTo: new Date().toISOString(),
          }),
          window.api.reports.getTopProducts({
            dateFrom: dateFrom.toISOString(),
            dateTo: new Date().toISOString(),
            limit: 6,
            sortBy: 'quantity',
          }),
        ])

        setDashboardMetrics(metrics as DashboardMetrics)

        const grouped: Record<string, number> = {}
        const salesRows = (salesReport?.salesByDate || []) as Array<{
          date: string | Date
          totalRevenue?: number
        }>
        for (const row of salesRows) {
          const key = new Date(row.date).toISOString().slice(0, 10)
          grouped[key] = (grouped[key] || 0) + Number(row.totalRevenue || 0)
        }

        const salesTrend = Object.entries(grouped)
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, totalRevenue]) => ({
            date: date.slice(5),
            totalRevenue,
          }))
        setSalesByDate(salesTrend)

        const topRows = Array.isArray(topProductsReport)
          ? (topProductsReport as Array<{
              productName?: string
              totalQuantity?: number
              totalRevenue?: number
            }>)
          : []
        setTopProducts(
          topRows.map(p => ({
            name: p.productName || 'Producto',
            quantity: Number(p.totalQuantity || 0),
            revenue: Number(p.totalRevenue || 0),
          }))
        )
      } catch (error) {
        console.error('Error loading dashboard metrics:', error)
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
            activeCredits: 0,
            totalActiveAmount: 0,
            overdueCredits: 0,
            totalOverdueAmount: 0,
          },
          orders: {
            pendingOrders: 0,
            totalPendingValue: 0,
          },
        })
        setSalesByDate([])
        setTopProducts([])
      } finally {
        setIsLoading(false)
      }
    },
    [timeRange]
  )

  useEffect(() => {
    void loadDashboardMetrics()
  }, [timeRange, loadDashboardMetrics])

  const profitMargin =
    dashboardMetrics?.sales.totalRevenue &&
    dashboardMetrics.sales.totalRevenue > 0
      ? (dashboardMetrics.sales.totalProfit /
          dashboardMetrics.sales.totalRevenue) *
        100
      : 0

  const cardsData = useMemo(() => {
    const metrics = dashboardMetrics
    return [
      {
        title: 'Ventas de hoy',
        value: formatCurrency((metrics?.sales.totalRevenue || 0) / 100),
        change: `${metrics?.sales.totalSales || 0} tickets`,
        changeType: 'positive' as const,
        trendChipPosition: 'top' as const,
        icon: <IconSolarWalletMoneyLinear />,
      },
      {
        title: 'Ganancia de hoy',
        value: formatCurrency((metrics?.sales.totalProfit || 0) / 100),
        change: `${profitMargin.toFixed(1)}%`,
        changeType:
          profitMargin > 0 ? ('positive' as const) : ('neutral' as const),
        trendChipPosition: 'top' as const,
        icon: <IconSolarHandMoneyLinear />,
      },
      {
        title: 'Stock bajo',
        value: metrics?.inventory.lowStockItems || 0,
        changeType: 'negative' as const,
        trendChipPosition: 'top' as const,
        icon: <IconSolarBoxLinear />,
      },
      {
        title: 'Créditos',
        value: formatCurrency((metrics?.credits.totalActiveAmount || 0) / 100),
        change: `${metrics?.credits.activeCredits || 0} activos`,
        changeType: 'neutral' as const,
        trendChipPosition: 'top' as const,
        icon: <IconSolarBanknote2Linear />,
      },
    ]
  }, [dashboardMetrics, profitMargin])

  const pieColors = [
    '#3366FF',
    '#70DD35',
    '#F59E0B',
    '#EF4444',
    '#06B6D4',
    '#8B5CF6',
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Spinner />
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
            <Select
              selectedKeys={[timeRange]}
              fullWidth={false}
              className="min-w-30"
              disallowEmptySelection
              onSelectionChange={key =>
                handleTimeRangeChange((key.currentKey || '7') as TimeRange)
              }
            >
              <SelectItem key="7">7 días</SelectItem>
              <SelectItem key="14">14 días</SelectItem>
              <SelectItem key="30">30 días</SelectItem>
            </Select>

            <Button
              variant="shadow"
              startContent={<IconLucidePlus />}
              color="default"
              className="bg-foreground text-background"
              onPress={() => navigate('/pos')}
            >
              Nueva Venta
            </Button>
          </>
        }
      />

      <dl className="grid w-full grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
        {cardsData.map(
          ({ title, value, change, changeType, icon, trendChipPosition }) => (
            <Card
              key={title}
              className="dark:border-default-100 border border-transparent"
            >
              <div className="flex py-4 px-2 xl:px-4">
                <div
                  className={cn(
                    'mt-1 flex h-8 w-8 items-center justify-center rounded-md',
                    {
                      'bg-success-50': changeType === 'positive',
                      'bg-warning-50': changeType === 'neutral',
                      'bg-danger-50': changeType === 'negative',
                    }
                  )}
                >
                  {changeType === 'positive' ? (
                    <div className="text-success">{icon}</div>
                  ) : changeType === 'neutral' ? (
                    <div className="text-warning">{icon}</div>
                  ) : (
                    <div className="text-danger">{icon}</div>
                  )}
                </div>

                <div className="flex flex-col gap-y-2">
                  <dt className="text-small text-default-500 mx-2 xl:mx-4 font-medium">
                    {title}
                  </dt>
                  <dd className="text-default-700 px-2 xl:px-4 text-2xl font-semibold">
                    {value}
                  </dd>
                </div>

                {change && (
                  <Chip
                    className={cn('absolute right-2 xl:right-4', {
                      'top-4': trendChipPosition === 'top',
                    })}
                    classNames={{
                      content: 'font-semibold text-[0.65rem]',
                    }}
                    color={
                      changeType === 'positive'
                        ? 'success'
                        : changeType === 'neutral'
                          ? 'warning'
                          : 'danger'
                    }
                    radius="sm"
                    size="sm"
                    startContent={
                      changeType === 'positive' ? (
                        <IconSolarArrowRightUpLinear className="size-3" />
                      ) : changeType === 'neutral' ? (
                        <IconSolarArrowRightLinear className="size-3" />
                      ) : (
                        <IconSolarArrowRightDownLinear className="size-3" />
                      )
                    }
                    variant="flat"
                  >
                    {change}
                  </Chip>
                )}
              </div>

              <div className="bg-default-100">
                <Button
                  fullWidth
                  className="text-default-500 flex justify-start text-xs data-pressed:scale-100"
                  radius="none"
                  variant="light"
                >
                  Ver detalles
                </Button>
              </div>
            </Card>
          )
        )}
      </dl>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="border border-default-200">
          <div className="p-4">
            <h3 className="font-semibold">Rendimiento</h3>
            <p className="text-sm text-default-500">
              Ingresos diarios en el período seleccionado
            </p>
          </div>
          <div className="h-72 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesByDate}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value / 100)}
                />
                <Line
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke="#3366FF"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border border-default-200">
          <div className="p-4">
            <h3 className="font-semibold">Productos más vendidos</h3>
            <p className="text-sm text-default-500">
              Participación por cantidad vendida
            </p>
          </div>
          <div className="h-72 p-2">
            {topProducts.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-default-500">
                Sin datos en el período seleccionado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProducts}
                    dataKey="quantity"
                    nameKey="name"
                    outerRadius={95}
                    label
                  >
                    {topProducts.map((product, index) => (
                      <Cell
                        key={`cell-${product.name}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Button
          variant="flat"
          startContent={<ShoppingCart className="size-4" />}
          onPress={() => navigate('/pos')}
        >
          Nueva venta
        </Button>
        <Button
          variant="flat"
          startContent={<Package className="size-4" />}
          onPress={() => navigate('/inventory-entry')}
        >
          Agregar inventario
        </Button>
        <Button
          variant="flat"
          startContent={<FileText className="size-4" />}
          onPress={() => navigate('/reports')}
        >
          Ver reportes
        </Button>
      </div>
    </div>
  )
}
