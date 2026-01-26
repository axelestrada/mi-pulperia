import { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  CreditCard,
  DollarSign,
  Clock,
  AlertTriangle,
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

export function CreditsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mock data - replace with real data hooks
  const credits = [
    {
      id: 1,
      customerName: 'Juan Pérez',
      amount: 150000, // cents
      balance: 75000, // cents
      dueDate: new Date('2024-02-15'),
      status: 'active',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 2,
      customerName: 'María García',
      amount: 200000,
      balance: 200000,
      dueDate: new Date('2024-02-20'),
      status: 'overdue',
      createdAt: new Date('2024-01-10'),
    },
  ]

  const filteredCredits = credits.filter(credit => {
    const matchesSearch = credit.customerName
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || credit.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: credits.length,
    active: credits.filter(c => c.status === 'active').length,
    overdue: credits.filter(c => c.status === 'overdue').length,
    totalAmount: credits.reduce((sum, c) => sum + c.balance, 0),
    overdueAmount: credits
      .filter(c => c.status === 'overdue')
      .reduce((sum, c) => sum + c.balance, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créditos</h1>
          <p className="text-muted-foreground">
            Gestiona los créditos otorgados a tus clientes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Crédito
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Créditos
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdue}
            </div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              L {(stats.totalAmount / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Por cobrar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencido</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              L {(stats.overdueAmount / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Monto vencido</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra créditos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="overdue">Vencidos</SelectItem>
                <SelectItem value="paid">Pagados</SelectItem>
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
              <CardTitle>Créditos</CardTitle>
              <CardDescription>
                {filteredCredits.length} crédito
                {filteredCredits.length !== 1 ? 's' : ''} encontrado
                {filteredCredits.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCredits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No se encontraron créditos
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Crédito
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCredits.map(credit => (
                <div
                  key={credit.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{credit.customerName}</h3>
                    <div className="text-sm text-muted-foreground">
                      Saldo: L {(credit.balance / 100).toFixed(2)} de L
                      {(credit.amount / 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Vence: {credit.dueDate.toLocaleDateString('es-NI')}
                      </div>
                      <Badge
                        variant={
                          credit.status === 'overdue'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {credit.status === 'active'
                          ? 'Activo'
                          : credit.status === 'overdue'
                            ? 'Vencido'
                            : 'Pagado'}
                      </Badge>
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
