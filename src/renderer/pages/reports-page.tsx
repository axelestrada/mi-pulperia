import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Filter,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const reportTypes = [
  {
    id: 'sales',
    title: 'Reporte de Ventas',
    description: 'Análisis detallado de ventas por período',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 'inventory',
    title: 'Reporte de Inventario',
    description: 'Estado actual del inventario y rotación',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    id: 'customers',
    title: 'Reporte de Clientes',
    description: 'Análisis de comportamiento de clientes',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'profits',
    title: 'Reporte de Ganancias',
    description: 'Análisis de rentabilidad y márgenes',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    id: 'products',
    title: 'Productos Más Vendidos',
    description: 'Ranking de productos por ventas',
    icon: BarChart3,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  {
    id: 'expenses',
    title: 'Reporte de Gastos',
    description: 'Análisis de gastos por categoría',
    icon: TrendingUp,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
]

const quickReports = [
  {
    id: 'daily-sales',
    title: 'Ventas del Día',
    description: 'Resumen de ventas de hoy',
    value: 'L2,450.00',
    change: '+12.5%',
    trend: 'up',
  },
  {
    id: 'weekly-sales',
    title: 'Ventas de la Semana',
    description: 'Resumen de ventas de esta semana',
    value: 'L15,280.00',
    change: '+8.3%',
    trend: 'up',
  },
  {
    id: 'monthly-sales',
    title: 'Ventas del Mes',
    description: 'Resumen de ventas de este mes',
    value: 'L65,430.00',
    change: '-2.1%',
    trend: 'down',
  },
  {
    id: 'low-stock',
    title: 'Productos con Poco Stock',
    description: 'Productos que necesitan reabastecimiento',
    value: '8 productos',
    change: '+3 desde ayer',
    trend: 'warning',
  },
]

export function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('')
  const [dateRange, setDateRange] = useState('month')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async (reportId: string) => {
    setIsGenerating(true)
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
      // Here you would typically call the API to generate the report
      console.log(`Generating ${reportId} report for ${dateRange}`)
    }, 2000)
  }

  const handleDownloadReport = (reportId: string) => {
    // Here you would implement the download functionality
    console.log(`Downloading ${reportId} report`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">
            Genera y descarga reportes detallados de tu negocio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <Input type="date" className="w-[150px]" />
              <Input type="date" className="w-[150px]" />
            </div>
          )}
        </div>
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Resúmenes Rápidos</CardTitle>
          <CardDescription>
            Vista general de métricas importantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickReports.map(report => (
              <Card key={report.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{report.title}</h3>
                  <Badge
                    variant={
                      report.trend === 'up'
                        ? 'default'
                        : report.trend === 'down'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {report.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold mb-1">{report.value}</div>
                <p className="text-xs text-muted-foreground">
                  {report.description}
                </p>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Reportes</CardTitle>
          <CardDescription>
            Selecciona el tipo de reporte que deseas generar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportTypes.map(report => {
              const Icon = report.icon
              return (
                <Card
                  key={report.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedReport === report.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${report.bgColor}`}>
                        <Icon className={`h-5 w-5 ${report.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {report.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {report.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={e => {
                          e.stopPropagation()
                          handleGenerateReport(report.id)
                        }}
                        disabled={isGenerating}
                        className="flex-1"
                      >
                        {isGenerating && selectedReport === report.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generando...
                          </>
                        ) : (
                          <>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Generar
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={e => {
                          e.stopPropagation()
                          handleDownloadReport(report.id)
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Recientes</CardTitle>
          <CardDescription>
            Descarga reportes generados anteriormente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: 'Reporte de Ventas - Enero 2024',
                type: 'Ventas',
                date: '2024-01-31',
                size: '2.4 MB',
                format: 'PDF',
              },
              {
                name: 'Inventario - Stock Actual',
                type: 'Inventario',
                date: '2024-01-30',
                size: '1.8 MB',
                format: 'Excel',
              },
              {
                name: 'Productos Más Vendidos - Enero',
                type: 'Productos',
                date: '2024-01-29',
                size: '0.9 MB',
                format: 'PDF',
              },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{report.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>Tipo: {report.type}</span>
                    <span>
                      Fecha: {new Date(report.date).toLocaleDateString('es-NI')}
                    </span>
                    <span>Tamaño: {report.size}</span>
                    <Badge variant="outline">{report.format}</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
