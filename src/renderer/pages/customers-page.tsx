import { CreditCard, DollarSign, PlusIcon, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { PageHeader } from '@/components/ui/page-header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCredits } from '../features/credits/hooks/use-credits'
import { useCustomers } from '../features/customers/hooks/use-customers'
import { CustomerFormDialog } from '../features/customers/ui/customer-form-dialog'
import { CustomersTable } from '../features/customers/ui/customers-table'

interface Customer {
  id: number
  name: string
  email?: string
  phone?: string
  document?: string
  address?: string
  city?: string
  country?: string
  creditLimit: number
  currentBalance: number
  notes?: string
  isActive: boolean
  createdAt: Date
}

interface Credit {
  id: number
  creditNumber: string
  customerId: number
  customerName?: string
  originalAmount: number
  remainingAmount: number
  status: 'active' | 'overdue' | 'paid' | 'partial' | 'cancelled'
  dueDate?: Date
}

export const CustomersPage = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [creditStatusFilter, setCreditStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>()

  // Load customers data
  const {
    data,
    isLoading: customersLoading,
    error: customersError,
  } = useCustomers({
    search: searchTerm,
    hasOutstandingBalance: statusFilter === 'with_balance' ? true : undefined,
  })

  const customers = data?.data || []

  // Load credits data
  const {
    data: credits = [],
    isLoading: creditsLoading,
    error: creditsError,
  } = useCredits({
    status: creditStatusFilter !== 'all' ? creditStatusFilter : undefined,
  })

  // Filter customers
  const filteredCustomers = customers?.filter((customer: Customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email?.toLowerCase() || '').includes(
        searchTerm.toLowerCase()
      ) ||
      (customer.document?.toLowerCase() || '').includes(
        searchTerm.toLowerCase()
      ) ||
      (customer.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'with_balance' && customer.currentBalance > 0) ||
      (statusFilter === 'active' && customer.isActive) ||
      (statusFilter === 'inactive' && !customer.isActive)

    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    total: customers.length,
    active: customers?.filter((c: Customer) => c.isActive).length,
    withBalance: customers?.filter((c: Customer) => c.currentBalance > 0)
      .length,
    totalBalance: customers.reduce(
      (sum: number, c: Customer) => sum + c.currentBalance,
      0
    ),
    creditLimit: customers.reduce(
      (sum: number, c: Customer) => sum + c.creditLimit,
      0
    ),
  }

  const creditStats = {
    total: credits.length,
    active: credits?.filter((c: Credit) => c.status === 'active').length,
    overdue: credits?.filter((c: Credit) => c.status === 'overdue').length,
    totalAmount: credits.reduce(
      (sum: number, c: Credit) => sum + c.remainingAmount,
      0
    ),
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingCustomer(undefined)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCustomer(undefined)
  }

  const handleNewCredit = () => {
    navigate('/credits')
  }

  const isLoading = customersLoading || creditsLoading
  const hasError = customersError || creditsError

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar los datos</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col space-y-6">
      <PageHeader
        title="Gestión de Clientes"
        description="Administra clientes y sistema de créditos."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleNewCredit}>
              <CreditCard className="mr-2 h-4 w-4" />
              Nuevo Crédito
            </Button>
            <Button onClick={handleCreate}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Nuevo Cliente
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="customers" className="flex-1">
        <TabsList className="mb-4">
          <TabsTrigger value="customers">
            <Users className="mr-2 h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="credits">
            <CreditCard className="mr-2 h-4 w-4" />
            Libro de Créditos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          {/* Customer Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Clientes
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
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
                <CardTitle className="text-sm font-medium">
                  Con Saldo Pendiente
                </CardTitle>
                <DollarSign className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.withBalance}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0
                    ? Math.round((stats.withBalance / stats.total) * 100)
                    : 0}
                  % del total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Saldo Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  L {(stats.totalBalance / 100).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Por cobrar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Límite de Crédito
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  L {(stats.creditLimit / 100).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Límite total disponible
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Customer Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Busca y filtra clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, email, documento o teléfono..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-50">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                    <SelectItem value="with_balance">
                      Con saldo pendiente
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customers Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Clientes</CardTitle>
                  <CardDescription>
                    {filteredCustomers.length} cliente
                    {filteredCustomers.length !== 1 ? 's' : ''} encontrado
                    {filteredCustomers.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                {(searchTerm || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                    }}
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {customers.length === 0
                      ? 'No tienes clientes registrados'
                      : 'No se encontraron clientes con los filtros aplicados'}
                  </p>
                  {customers.length === 0 && (
                    <Button onClick={handleCreate}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Crear Primer Cliente
                    </Button>
                  )}
                </div>
              ) : (
                <CustomersTable
                  customers={filteredCustomers}
                  onEdit={handleEdit}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-6">
          {/* Credit Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Créditos
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{creditStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {creditStats.active} activos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
                <DollarSign className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {creditStats.overdue}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requieren atención
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monto Total
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  L {(creditStats.totalAmount / 100).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Por cobrar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Promedio por Crédito
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  L
                  {creditStats.total > 0
                    ? (
                        creditStats.totalAmount /
                        creditStats.total /
                        100
                      ).toFixed(2)
                    : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">Monto promedio</p>
              </CardContent>
            </Card>
          </div>

          {/* Credit Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros de Créditos</CardTitle>
              <CardDescription>Filtra créditos por estado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select
                  value={creditStatusFilter}
                  onValueChange={setCreditStatusFilter}
                >
                  <SelectTrigger className="w-50">
                    <SelectValue placeholder="Estado del crédito" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="overdue">Vencidos</SelectItem>
                    <SelectItem value="partial">Parciales</SelectItem>
                    <SelectItem value="paid">Pagados</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => navigate('/credits')}>
                  Ver todos los créditos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Credits List */}
          <Card>
            <CardHeader>
              <CardTitle>Créditos Recientes</CardTitle>
              <CardDescription>
                Vista resumida de los créditos más recientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {creditsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : credits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No hay créditos registrados
                  </p>
                  <Button onClick={handleNewCredit}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Crear Primer Crédito
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {credits.slice(0, 5).map((credit: Credit) => (
                    <div
                      key={credit.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {credit.customerName || 'Cliente desconocido'}
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          Crédito: {credit.creditNumber} | Monto: L
                          {(credit.originalAmount / 100).toFixed(2)} |
                          Pendiente: L
                          {(credit.remainingAmount / 100).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          {credit.dueDate && (
                            <div className="text-sm font-medium">
                              Vence:{' '}
                              {new Date(credit.dueDate).toLocaleDateString(
                                'es-NI'
                              )}
                            </div>
                          )}
                          <Badge
                            variant={
                              credit.status === 'overdue'
                                ? 'destructive'
                                : credit.status === 'active'
                                  ? 'default'
                                  : credit.status === 'paid'
                                    ? 'secondary'
                                    : 'outline'
                            }
                          >
                            {credit.status === 'active'
                              ? 'Activo'
                              : credit.status === 'overdue'
                                ? 'Vencido'
                                : credit.status === 'paid'
                                  ? 'Pagado'
                                  : credit.status === 'partial'
                                    ? 'Parcial'
                                    : 'Cancelado'}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/credits/${credit.id}`)}
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}

                  {credits.length > 5 && (
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/credits')}
                      >
                        Ver todos los créditos ({credits.length})
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Form Dialog */}
      <CustomerFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        customer={editingCustomer}
      />
    </div>
  )
}
