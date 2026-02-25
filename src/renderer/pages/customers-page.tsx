import type { Selection } from '@heroui/react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Select,
  SelectItem,
  Spinner,
  Tab,
  Tabs,
} from '@heroui/react'
import { CreditCard, DollarSign, PlusIcon, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/page-header'
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

const getSingleSelectionKey = (keys: Selection, fallback = 'all') => {
  if (keys === 'all') return fallback
  return Array.from(keys)[0]?.toString() ?? fallback
}

export const CustomersPage = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [creditStatusFilter, setCreditStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>()

  const {
    data,
    isLoading: customersLoading,
    error: customersError,
  } = useCustomers({
    search: searchTerm,
    hasOutstandingBalance: statusFilter === 'with_balance' ? true : undefined,
  })

  const customers = data?.data || []

  const {
    data: credits = [],
    isLoading: creditsLoading,
    error: creditsError,
  } = useCredits({
    status: creditStatusFilter !== 'all' ? creditStatusFilter : undefined,
  })

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
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-danger">Error al cargar los datos</p>
          <Button onPress={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <PageHeader
        title="Gestión de Clientes"
        description="Administra clientes y sistema de créditos."
        actions={
          <div className="flex gap-2">
            <Button
              variant="bordered"
              startContent={<CreditCard className="h-4 w-4" />}
              onPress={handleNewCredit}
            >
              Nuevo Crédito
            </Button>
            <Button
              startContent={<PlusIcon className="h-4 w-4" />}
              onPress={handleCreate}
            >
              Nuevo Cliente
            </Button>
          </div>
        }
      />

      <Tabs
        aria-label="Secciones de clientes"
        defaultSelectedKey="customers"
        className="flex-1"
        classNames={{
          tabList: 'mb-4',
          panel: 'px-0',
        }}
      >
        <Tab
          key="customers"
          title={
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clientes
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <h3 className="text-sm font-medium">Total Clientes</h3>
                  <Users className="h-4 w-4 text-default-500" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-default-500">
                    {stats.active} activos
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <h3 className="text-sm font-medium">Con Saldo Pendiente</h3>
                  <DollarSign className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">{stats.withBalance}</div>
                  <p className="text-xs text-default-500">
                    {stats.total > 0
                      ? Math.round((stats.withBalance / stats.total) * 100)
                      : 0}
                    % del total
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <h3 className="text-sm font-medium">Saldo Total</h3>
                  <DollarSign className="h-4 w-4 text-danger" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold text-danger">
                    L {(stats.totalBalance / 100).toFixed(2)}
                  </div>
                  <p className="text-xs text-default-500">Por cobrar</p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-sm font-medium">Límite de Crédito</h3>
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">
                    L {(stats.creditLimit / 100).toFixed(2)}
                  </div>
                  <p className="text-xs text-default-500">
                    Límite total disponible
                  </p>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <h3 className="font-semibold">Filtros</h3>
                <p className="text-sm text-default-500">
                  Busca y filtra clientes
                </p>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <Input
                    placeholder="Buscar por nombre, email, documento o teléfono..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    startContent={
                      <Search className="h-4 w-4 text-default-400" />
                    }
                  />
                  <Select
                    aria-label="Estado de cliente"
                    selectedKeys={[statusFilter]}
                    onSelectionChange={keys =>
                      setStatusFilter(getSingleSelectionKey(keys))
                    }
                    className="w-full md:w-50"
                  >
                    <SelectItem key="all">Todos</SelectItem>
                    <SelectItem key="active">Activos</SelectItem>
                    <SelectItem key="inactive">Inactivos</SelectItem>
                    <SelectItem key="with_balance">
                      Con saldo pendiente
                    </SelectItem>
                  </Select>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Clientes</h3>
                    <p className="text-sm text-default-500">
                      {filteredCustomers.length} cliente
                      {filteredCustomers.length !== 1 ? 's' : ''} encontrado
                      {filteredCustomers.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {(searchTerm || statusFilter !== 'all') && (
                    <Button
                      variant="light"
                      size="sm"
                      onPress={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner />
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="mb-4 text-default-500">
                      {customers.length === 0
                        ? 'No tienes clientes registrados'
                        : 'No se encontraron clientes con los filtros aplicados'}
                    </p>
                    {customers.length === 0 && (
                      <Button
                        startContent={<PlusIcon className="h-4 w-4" />}
                        onPress={handleCreate}
                      >
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
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab
          key="credits"
          title={
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Libro de Créditos
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <h3 className="text-sm font-medium">Total Créditos</h3>
                  <CreditCard className="h-4 w-4 text-default-500" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">{creditStats.total}</div>
                  <p className="text-xs text-default-500">
                    {creditStats.active} activos
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <h3 className="text-sm font-medium">Vencidos</h3>
                  <DollarSign className="h-4 w-4 text-danger" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold text-danger">
                    {creditStats.overdue}
                  </div>
                  <p className="text-xs text-default-500">Requieren atención</p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <h3 className="text-sm font-medium">Monto Total</h3>
                  <DollarSign className="h-4 w-4 text-default-500" />
                </CardHeader>
                <CardBody>
                  <div className="text-2xl font-bold">
                    L {(creditStats.totalAmount / 100).toFixed(2)}
                  </div>
                  <p className="text-xs text-default-500">Por cobrar</p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-sm font-medium">Promedio por Crédito</h3>
                </CardHeader>
                <CardBody>
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
                  <p className="text-xs text-default-500">Monto promedio</p>
                </CardBody>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <h3 className="font-semibold">Filtros de Créditos</h3>
                <p className="text-sm text-default-500">
                  Filtra créditos por estado
                </p>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
                  <Select
                    aria-label="Estado del crédito"
                    selectedKeys={[creditStatusFilter]}
                    onSelectionChange={keys =>
                      setCreditStatusFilter(getSingleSelectionKey(keys))
                    }
                    className="w-full md:w-50"
                  >
                    <SelectItem key="all">Todos</SelectItem>
                    <SelectItem key="active">Activos</SelectItem>
                    <SelectItem key="overdue">Vencidos</SelectItem>
                    <SelectItem key="partial">Parciales</SelectItem>
                    <SelectItem key="paid">Pagados</SelectItem>
                  </Select>
                  <Button onPress={() => navigate('/credits')}>
                    Ver todos los créditos
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-semibold">Créditos Recientes</h3>
                <p className="text-sm text-default-500">
                  Vista resumida de los créditos más recientes
                </p>
              </CardHeader>
              <CardBody>
                {creditsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner />
                  </div>
                ) : credits.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="mb-4 text-default-500">
                      No hay créditos registrados
                    </p>
                    <Button
                      startContent={<CreditCard className="h-4 w-4" />}
                      onPress={handleNewCredit}
                    >
                      Crear Primer Crédito
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {credits.slice(0, 5).map((credit: Credit) => (
                      <div
                        key={credit.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">
                            {credit.customerName || 'Cliente desconocido'}
                          </h3>
                          <div className="text-sm text-default-500">
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
                            <Chip
                              size="sm"
                              variant="flat"
                              color={
                                credit.status === 'overdue'
                                  ? 'danger'
                                  : credit.status === 'active'
                                    ? 'primary'
                                    : credit.status === 'paid'
                                      ? 'success'
                                      : 'default'
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
                            </Chip>
                          </div>
                          <Button
                            variant="bordered"
                            size="sm"
                            onPress={() => navigate(`/credits/${credit.id}`)}
                          >
                            Ver
                          </Button>
                        </div>
                      </div>
                    ))}

                    {credits.length > 5 && (
                      <div className="pt-4 text-center">
                        <Button
                          variant="bordered"
                          onPress={() => navigate('/credits')}
                        >
                          Ver todos los créditos ({credits.length})
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>

      <CustomerFormDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        customer={editingCustomer}
      />
    </div>
  )
}

