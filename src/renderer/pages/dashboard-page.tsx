import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/ui/page-header'

// Import report components (keep existing ones that work)

import { Button, Select, SelectItem, Card, Chip, cn } from '@heroui/react'

const data = [
  {
    title: 'Ventas de hoy',
    value: 'L 2,534.00',
    change: '33%',
    changeType: 'positive',
    trendChipPosition: 'top',
    icon: <IconSolarWalletMoneyLinear />,
  },
  {
    title: 'Ganancia de hoy',
    value: 'L 639.25',
    change: '0.0%',
    changeType: 'neutral',
    trendChipPosition: 'top',
    icon: <IconSolarHandMoneyLinear />,
  },
  {
    title: 'Stock bajo',
    value: 5,
    changeType: 'negative',
    trendChipPosition: 'top',
    icon: <IconSolarBoxLinear />,
  },
  {
    title: 'Créditos totales',
    value: 'L 1,250.00',
    changeType: 'negative',
    trendChipPosition: 'top',
    icon: <IconSolarBoxLinear />,
  },
]

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
            <Select
              defaultSelectedKeys={['7']}
              fullWidth={false}
              className="min-w-30"
              disallowEmptySelection
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
              onPress={handleNewSale}
            >
              Nueva Venta
            </Button>
          </>
        }
      />

      <dl className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {data.map(
          (
            { title, value, change, changeType, icon, trendChipPosition },
            index
          ) => (
            <Card
              key={index}
              className="dark:border-default-100 border border-transparent"
            >
              <div className="flex p-4">
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
                  <dt className="text-small text-default-500 mx-4 font-medium">
                    {title}
                  </dt>
                  <dd className="text-default-700 px-4 text-2xl font-semibold">
                    {value}
                  </dd>
                </div>

                {change && (
                  <Chip
                    className={cn('absolute right-4', {
                      'top-4': trendChipPosition === 'top',
                      'bottom-4': trendChipPosition === 'bottom',
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
    </div>
  )
}
