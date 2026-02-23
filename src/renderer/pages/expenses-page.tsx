import { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingDown,
  Calendar,
  Tag,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('month')

  // Mock data - replace with real data hooks
  const expenses = [
    {
      id: 1,
      description: 'Alquiler del local',
      amount: 1500000, // cents
      category: 'rent',
      date: new Date('2024-01-01'),
      paymentMethod: 'cash',
      receipt: 'REC-001',
    },
    {
      id: 2,
      description: 'Servicios públicos',
      amount: 35000,
      category: 'utilities',
      date: new Date('2024-01-15'),
      paymentMethod: 'bank',
      receipt: 'REC-002',
    },
    {
      id: 3,
      description: 'Suministros de oficina',
      amount: 25000,
      category: 'supplies',
      date: new Date('2024-01-20'),
      paymentMethod: 'cash',
      receipt: 'REC-003',
    },
  ]

  const categories = [
    { value: 'rent', label: 'Alquiler' },
    { value: 'utilities', label: 'Servicios públicos' },
    { value: 'supplies', label: 'Suministros' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'transportation', label: 'Transporte' },
    { value: 'other', label: 'Otros' },
  ]

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.receipt.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      categoryFilter === 'all' || expense.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const stats = {
    total: expenses.length,
    totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
    monthlyAverage:
      expenses.length > 0
        ? expenses.reduce((sum, e) => sum + e.amount, 0) / 12
        : 0,
    categoryBreakdown: categories.reduce(
      (acc, cat) => {
        acc[cat.value] = expenses
          .filter(e => e.category === cat.value)
          .reduce((sum, e) => sum + e.amount, 0)
        return acc
      },
      {} as Record<string, number>
    ),
  }

  const topCategory = Object.entries(stats.categoryBreakdown).sort(
    ([, a], [, b]) => b - a
  )[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gastos</h1>
          <p className="text-muted-foreground">
            Registra y controla todos los gastos del negocio
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Gasto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              L {(stats.totalAmount / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Gastos acumulados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio Mensual
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              L {(stats.monthlyAverage / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Estimado mensual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mayor Categoría
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topCategory
                ? categories.find(c => c.value === topCategory[0])?.label
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              L {topCategory ? (topCategory[1] / 100).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra gastos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descripción o recibo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gastos</CardTitle>
              <CardDescription>
                {filteredExpenses.length} gasto
                {filteredExpenses.length !== 1 ? 's' : ''} encontrado
                {filteredExpenses.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No se encontraron gastos
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Registrar Primer Gasto
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredExpenses.map(expense => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{expense.description}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>Recibo: {expense.receipt}</span>
                      <Badge variant="outline">
                        {
                          categories.find(c => c.value === expense.category)
                            ?.label
                        }
                      </Badge>
                      <span>{expense.date.toLocaleDateString('es-NI')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-red-600">
                        -L {(expense.amount / 100).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {expense.paymentMethod === 'cash'
                          ? 'Efectivo'
                          : 'Banco'}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
