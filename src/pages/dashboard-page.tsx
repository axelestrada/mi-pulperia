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

export const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7')

  const handleTimeRangeChange = useCallback((value: TimeRange) => {
    setTimeRange(value)
  }, [])

  const chartData = [
    { date: '2024-04-02', sales: 3100, margin: 465 },
    { date: '2024-04-03', sales: 2950, margin: 440 },
    { date: '2024-04-04', sales: 3400, margin: 510 },
    { date: '2024-04-05', sales: 4200, margin: 630 },
    { date: '2024-04-06', sales: 5600, margin: 840 },
    { date: '2024-04-07', sales: 4800, margin: 720 },
    { date: '2024-04-08', sales: 3000, margin: 450 },
  ]

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

            <Button onClick={() => console.log('Nueva venta')}>
              <PlusIcon /> Nueva Venta
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        <div className="@container/card h-full">
          <Card className="py-4 @[250px]/card:py-6 gap-3 h-full">
            <CardHeader className="px-4 @[250px]/card:px-6">
              <CardTitle className="text-sm">Ventas de hoy</CardTitle>

              <CardAction>
                <DollarSignIcon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>

            <CardContent className="px-4 @[250px]/card:px-6">
              <CardTitle className="text-2xl mb-2 font-semibold tabular-nums @[250px]/card:text-3xl">
                L. 1,450.00
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <TrendingUpIcon className="size-4 text-green-600" />
                +12% desde ayer
              </CardDescription>
            </CardContent>
            <CardFooter className="flex flex-col gap-1 px-4 @[250px]/card:px-6 mt-auto">
              <CardDescription className="flex justify-between w-full text-xs">
                Margen
                <span>25%</span>
              </CardDescription>
              <Progress value={33} color="bg-cyan-600" className="h-1" />
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
                45
              </CardTitle>
              <CardDescription>Ticket Promedio: L. 52.13</CardDescription>
            </CardContent>
            <CardFooter className="px-4 @[250px]/card:px-6 mt-auto">
              <CardDescription className="flex items-center gap-2">
                <ActivityIcon className="size-4 text-blue-600" />
                <span className="text-xs">Pico: 02:30PM - 04:00PM</span>
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
                5
              </CardTitle>
              <CardDescription>
                Necesitan reabastecimiento
              </CardDescription>
            </CardContent>
            <CardFooter className="px-4 @[250px]/card:px-6 mt-auto">
              <Badge variant="destructive" className="text-xs">
                2 urgentes
              </Badge>
            </CardFooter>
          </Card>
        </div>

        <div className="@container/card h-full">
          <Card className="py-4 @[250px]/card:py-6 gap-3 h-full">
            <CardHeader className="px-4 @[250px]/card:px-6">
              <CardTitle className="text-sm">Deuda Total</CardTitle>

              <CardAction>
                <CreditCardIcon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>

            <CardContent className="px-4 @[250px]/card:px-6">
              <CardTitle className="text-2xl mb-2 font-semibold tabular-nums @[250px]/card:text-3xl">
                L. 1,250.00
              </CardTitle>
              <CardDescription>4 clientes con crédito</CardDescription>
            </CardContent>
            <CardFooter className="px-4 @[250px]/card:px-6 mt-auto">
              <Badge className="text-xs" variant="outline">
                1 vencida
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
              <AreaChart data={chartData}>
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
              <Button variant="outline" className="flex-col h-20 flex-1">
                <ReceiptIcon className="size-5 mb-1 text-teal-600" />
                <span className="text-xs">Nueva Venta</span>
              </Button>

              <Button variant="outline" className="flex-col h-20 flex-1">
                <TruckIcon className="size-5 mb-1 text-cyan-600" />
                <span className="text-xs">Recibir Stock</span>
              </Button>

              <Button variant="outline" className="flex-col h-20 flex-1">
                <UserRoundPlusIcon className="size-5 mb-1 text-green-600" />
                <span className="text-xs">Agregar Cliente</span>
              </Button>

              <Button variant="outline" className="flex-col h-20 flex-1">
                <TagsIcon className="size-5 mb-1 text-blue-600" />
                <span className="text-xs">Imprimir Etiquetas</span>
              </Button>

              <Button variant="outline" className="flex-col h-20 flex-1">
                <DollarSignIcon className="size-5 mb-1 text-purple-600" />
                <span className="text-xs">Agregar Gasto</span>
              </Button>

              <Button variant="outline" className="flex-col h-20 flex-1">
                <PackageIcon className="size-5 mb-1 text-orange-600" />
                <span className="text-xs">Agregar Stock</span>
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
