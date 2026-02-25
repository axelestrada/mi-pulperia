import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, DollarSign, Search, Tag, TrendingDown } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  SHIFT_HANDOVER_UPDATED_EVENT,
  getShiftModuleNote,
  setShiftModuleNote,
} from '@/features/operations/model/shift-handover-storage'

type ExpenseStatusFilter = 'all' | 'pending' | 'paid' | 'cancelled'

type ExpenseItem = {
  id: number
  expenseNumber: string
  title: string
  totalAmount: number
  expenseDate: string | Date
  status: 'pending' | 'paid' | 'cancelled'
  categoryName?: string
  supplierName?: string
}

export function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ExpenseStatusFilter>('all')
  const [shiftNote, setShiftNote] = useState(() => getShiftModuleNote('expenses'))
  const [expenses, setExpenses] = useState<ExpenseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadExpenses = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')
      const data = await window.api.expenses.list({
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      setExpenses(Array.isArray(data) ? (data as ExpenseItem[]) : [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, statusFilter])

  useEffect(() => {
    void loadExpenses()
  }, [loadExpenses])

  useEffect(() => {
    const refreshShiftNote = () => setShiftNote(getShiftModuleNote('expenses'))
    window.addEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
    return () =>
      window.removeEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
  }, [])

  const stats = useMemo(() => {
    const totalAmount = expenses.reduce(
      (sum: number, expense) => sum + (expense.totalAmount || 0),
      0
    )
    const pendingAmount = expenses
      .filter(expense => expense.status === 'pending')
      .reduce((sum: number, expense) => sum + (expense.totalAmount || 0), 0)

    const categoryBreakdown = expenses.reduce(
      (acc: Record<string, number>, expense) => {
        const categoryName = expense.categoryName || 'Sin categoría'
        acc[categoryName] = (acc[categoryName] || 0) + (expense.totalAmount || 0)
        return acc
      },
      {}
    )

    const topCategory =
      Object.entries(categoryBreakdown).sort(([, a], [, b]) => b - a)[0] || null

    return {
      total: expenses.length,
      totalAmount,
      pendingAmount,
      average:
        expenses.length > 0 ? Math.round(totalAmount / expenses.length) : 0,
      topCategory,
    }
  }, [expenses])

  const handleSaveShiftNote = () => {
    setShiftModuleNote('expenses', shiftNote)
    sileo.success({ title: 'Nota de turno guardada en gastos' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando gastos...</p>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <Button onClick={() => void loadExpenses()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gastos</h1>
          <p className="text-muted-foreground">
            Control diario de egresos para el personal de turno.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Registros filtrados</p>
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
            <p className="text-xs text-muted-foreground">Acumulado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              L {(stats.average / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Por gasto</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mayor Categoría</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.topCategory?.[0] || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              L {stats.topCategory ? (stats.topCategory[1] / 100).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca por número, título o proveedor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Buscar gasto..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={value => setStatusFilter(value as ExpenseStatusFilter)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="paid">Pagados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nota de Turno</CardTitle>
          <CardDescription>
            Deja instrucciones sobre gastos pendientes o por aprobar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={shiftNote}
            onChange={e => setShiftNote(e.target.value)}
            placeholder="Ej. Revisar gasto EXP202602-010, falta factura."
          />
          <Button size="sm" onClick={handleSaveShiftNote}>
            Guardar nota
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gastos</CardTitle>
          <CardDescription>
            {expenses.length} gasto{expenses.length !== 1 ? 's' : ''} encontrado
            {expenses.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No se encontraron gastos con los filtros aplicados.
            </p>
          ) : (
            <div className="space-y-3">
              {expenses.map(expense => (
                <div
                  key={expense.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {expense.expenseNumber} - {expense.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {expense.categoryName || 'Sin categoría'}
                      {expense.supplierName ? ` | ${expense.supplierName}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.expenseDate).toLocaleDateString('es-HN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        expense.status === 'pending'
                          ? 'outline'
                          : expense.status === 'cancelled'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {expense.status === 'pending'
                        ? 'Pendiente'
                        : expense.status === 'paid'
                          ? 'Pagado'
                          : 'Cancelado'}
                    </Badge>
                    <span className="font-semibold text-red-600">
                      L {((expense.totalAmount || 0) / 100).toFixed(2)}
                    </span>
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
