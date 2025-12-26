import { formatCurrency } from '@/shared/utils/formatCurrency'

import { useState } from 'react'
import {
  AlertTriangleIcon,
  CreditCardIcon,
  DollarSignIcon,
  EditIcon,
  EyeIcon,
  MoreHorizontalIcon,
  SearchIcon,
  UserRoundCheckIcon,
  UserRoundXIcon,
  LockIcon,
  UnlockIcon,
  CalendarIcon,
  ShoppingCartIcon,
  ReceiptIcon,
} from 'lucide-react'

import { format } from 'date-fns'

type Customer = {
  id: string
  name: string
  address: string
  phone: string
  email: string
  creditLimit: number
  currentDebt: number
  lastPurchase: Date
  status: 'active' | 'inactive'
  creditBlocked: boolean
  registrationDate: Date
}

type Purchase = {
  id: string
  date: Date
  amount: number
  items: number
  status: 'paid' | 'pending'
}

type Payment = {
  id: string
  date: Date
  amount: number
  method: string
  reference: string
}

const mockPurchases: Purchase[] = [
  {
    id: '1',
    date: new Date('2024-06-10'),
    amount: 150,
    items: 5,
    status: 'pending',
  },
  {
    id: '2',
    date: new Date('2024-05-20'),
    amount: 200,
    items: 8,
    status: 'paid',
  },
  {
    id: '3',
    date: new Date('2024-05-05'),
    amount: 75,
    items: 3,
    status: 'paid',
  },
]

const mockPayments: Payment[] = [
  {
    id: '1',
    date: new Date('2024-05-25'),
    amount: 100,
    method: 'Efectivo',
    reference: 'PAG-001',
  },
  {
    id: '2',
    date: new Date('2024-05-15'),
    amount: 50,
    method: 'Transferencia',
    reference: 'PAG-002',
  },
  {
    id: '3',
    date: new Date('2024-04-30'),
    amount: 75,
    method: 'Efectivo',
    reference: 'PAG-003',
  },
]

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    address: 'Calle Falsa 123',
    phone: '9976-4567',
    email: 'juan.perez@email.com',
    creditLimit: 500,
    currentDebt: 150,
    lastPurchase: new Date('2024-06-10'),
    status: 'active',
    creditBlocked: false,
    registrationDate: new Date('2023-01-15'),
  },
  {
    id: '2',
    name: 'María Gómez',
    address: 'Avenida Siempre Viva 742',
    phone: '9532-5678',
    email: 'maria.gomez@email.com',
    creditLimit: 300,
    currentDebt: 0,
    lastPurchase: new Date('2024-05-22'),
    status: 'inactive',
    creditBlocked: false,
    registrationDate: new Date('2023-03-20'),
  },
]

export const CustomersTable = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  )
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerTab, setDrawerTab] = useState('info')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)

  const handleOpenDrawer = (customer: Customer, tab = 'info') => {
    setSelectedCustomer(customer)
    setDrawerTab(tab)
    setIsDrawerOpen(true)
    setEditMode(false)
  }

  const handleToggleCreditBlock = () => {
    if (selectedCustomer) {
      setCustomers(
        customers.map(c =>
          c.id === selectedCustomer.id
            ? { ...c, creditBlocked: !c.creditBlocked }
            : c
        )
      )
      setSelectedCustomer({
        ...selectedCustomer,
        creditBlocked: !selectedCustomer.creditBlocked,
      })
    }
  }

  const handleToggleStatus = () => {
    if (selectedCustomer) {
      const newStatus =
        selectedCustomer.status === 'active' ? 'inactive' : 'active'
      setCustomers(
        customers.map(c =>
          c.id === selectedCustomer.id ? { ...c, status: newStatus } : c
        )
      )
      setSelectedCustomer({ ...selectedCustomer, status: newStatus })
    }
  }

  const handleOpenPaymentDialog = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsPaymentDialogOpen(true)
    setPaymentAmount('')
  }

  const handleRegisterPayment = () => {
    if (selectedCustomer && paymentAmount) {
      const amount = parseFloat(paymentAmount)
      if (amount > 0) {
        setCustomers(
          customers.map(c =>
            c.id === selectedCustomer.id
              ? { ...c, currentDebt: Math.max(0, c.currentDebt - amount) }
              : c
          )
        )
        setSelectedCustomer({
          ...selectedCustomer,
          currentDebt: Math.max(0, selectedCustomer.currentDebt - amount),
        })
        setPaymentAmount('')
        setIsPaymentDialogOpen(false)
        alert(`Abono de ${formatCurrency(amount)} registrado exitosamente`)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl flex gap-4">
        <div className="relative w-full">
          <SearchIcon className="size-4 text-foreground/50 absolute left-3 top-1/2 -translate-y-1/2" />

          <Input
            className="w-full pl-10 pr-5"
            placeholder="Buscar por nombre, teléfono o dirección..."
          />
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Clientes</SelectLabel>
              <SelectItem value="all">Todos los clientes</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
              <SelectItem value="with_debt">Con deuda</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <div className="border p-4 py-8 rounded-xl flex items-center">
          <UserRoundCheckIcon className="size-5 text-green-600" />

          <div className="flex flex-col ml-3">
            <span className="font-bold text-2xl">3</span>
            <span className="text-sm text-muted-foreground">
              Clientes activos
            </span>
          </div>
        </div>

        <div className="border p-4 py-8 rounded-xl flex items-center">
          <CreditCardIcon className="size-5 text-blue-600" />

          <div className="flex flex-col ml-3">
            <span className="font-bold text-2xl">3</span>
            <span className="text-sm text-muted-foreground">Con crédito</span>
          </div>
        </div>

        <div className="border p-4 py-8 rounded-xl flex items-center">
          <DollarSignIcon className="size-5 text-orange-600" />

          <div className="flex flex-col ml-3">
            <span className="font-bold text-2xl">{formatCurrency(550)}</span>
            <span className="text-sm text-muted-foreground">Deuda total</span>
          </div>
        </div>

        <div className="border p-4 py-8 rounded-xl flex items-center">
          <AlertTriangleIcon className="size-5 text-red-600" />

          <div className="flex flex-col ml-3">
            <span className="font-bold text-2xl">3</span>
            <span className="text-sm text-muted-foreground">
              Deudas vencidas
            </span>
          </div>
        </div>
      </div>

      <div className="border rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Límite de Crédito</TableHead>
              <TableHead>Deuda Actual</TableHead>
              <TableHead>Última Compra</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {customers.map(customer => (
              <TableRow key={customer.id} className="cursor-pointer">
                <TableCell>
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.address}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{formatCurrency(customer.creditLimit)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        customer.currentDebt > 0
                          ? 'text-red-600 font-medium'
                          : ''
                      }
                    >
                      {formatCurrency(customer.currentDebt)}
                    </span>
                    {/* {getDaysOverdue(customer) > 15 && (
                      <Badge variant="destructive" className="text-xs">
                        {getDaysOverdue(customer)}d
                      </Badge>
                    )} */}
                    {/* TODO: Implementar indicador de días de atraso */}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.lastPurchase
                    ? format(customer.lastPurchase, 'dd-MM-yyyy')
                    : 'Nunca'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      customer.status === 'active' ? 'default' : 'destructive'
                    }
                    className={
                      customer.status === 'active' ? 'bg-green-600' : ''
                    }
                  >
                    {customer.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleOpenDrawer(customer, 'info')}
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        Ver Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          handleOpenDrawer(customer, 'info')
                          setEditMode(true)
                        }}
                      >
                        <EditIcon className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {customer.currentDebt > 0 && (
                        <DropdownMenuItem
                          onClick={() => handleOpenPaymentDialog(customer)}
                        >
                          <DollarSignIcon className="h-4 w-4 mr-2" />
                          Registrar Abono
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleOpenDrawer(customer, 'statement')}
                      >
                        <ReceiptIcon className="h-4 w-4 mr-2" />
                        Ver Estado de Cuenta
                      </DropdownMenuItem>
                      {customer.status === 'active' ? (
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            handleOpenDrawer(customer, 'info')
                            setTimeout(handleToggleStatus, 100)
                          }}
                        >
                          <UserRoundXIcon className="h-4 w-4 mr-2" />
                          Deshabilitar
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-green-600"
                          onClick={() => {
                            handleOpenDrawer(customer, 'info')
                            setTimeout(handleToggleStatus, 100)
                          }}
                        >
                          <UserRoundCheckIcon className="h-4 w-4 mr-2" />
                          Habilitar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Customer Profile Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-2xl">
                  {selectedCustomer?.name}
                </SheetTitle>
                <SheetDescription>{selectedCustomer?.phone}</SheetDescription>
              </div>
              <SheetClose />
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <Tabs value={drawerTab} onValueChange={setDrawerTab}>
              <TabsList className="w-full mb-2">
                <TabsTrigger value="info" className="flex-1">
                  <UserRoundCheckIcon className="size-4 mr-2" />
                  Información
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  <ShoppingCartIcon className="size-4 mr-2" />
                  Historial
                </TabsTrigger>
                <TabsTrigger value="statement" className="flex-1">
                  <ReceiptIcon className="size-4 mr-2" />
                  Estado de Cuenta
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Datos Personales</CardTitle>
                    <CardAction>
                      {!editMode && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditMode(true)}
                        >
                          <EditIcon className="size-4" />
                          Editar
                        </Button>
                      )}
                    </CardAction>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Nombre
                        </label>
                        {editMode ? (
                          <Input defaultValue={selectedCustomer?.name} />
                        ) : (
                          <p className="font-medium">
                            {selectedCustomer?.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Teléfono
                        </label>
                        {editMode ? (
                          <Input defaultValue={selectedCustomer?.phone} />
                        ) : (
                          <p className="font-medium">
                            {selectedCustomer?.phone}
                          </p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm text-muted-foreground">
                          Dirección
                        </label>
                        {editMode ? (
                          <Input defaultValue={selectedCustomer?.address} />
                        ) : (
                          <p className="font-medium">
                            {selectedCustomer?.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {editMode && (
                      <div className="flex gap-2 pt-2">
                        <Button>Guardar Cambios</Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditMode(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Información de Crédito
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Límite de Crédito
                        </label>
                        <p className="font-medium text-lg">
                          {formatCurrency(selectedCustomer?.creditLimit || 0)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Deuda Actual
                        </label>
                        <p
                          className={`font-medium text-lg ${
                            selectedCustomer?.currentDebt &&
                            selectedCustomer.currentDebt > 0
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}
                        >
                          {formatCurrency(selectedCustomer?.currentDebt || 0)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Crédito Disponible
                        </label>
                        <p className="font-medium text-lg text-blue-600">
                          {formatCurrency(
                            (selectedCustomer?.creditLimit || 0) -
                              (selectedCustomer?.currentDebt || 0)
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Estado
                        </label>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              selectedCustomer?.status === 'active'
                                ? 'default'
                                : 'destructive'
                            }
                            className={
                              selectedCustomer?.status === 'active'
                                ? 'bg-green-600'
                                : ''
                            }
                          >
                            {selectedCustomer?.status === 'active'
                              ? 'Activo'
                              : 'Inactivo'}
                          </Badge>

                          {selectedCustomer?.creditBlocked && (
                            <Badge variant="destructive">
                              Crédito Bloqueado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="gap-2 pt-4 border-t grid grid-cols-2">
                      {selectedCustomer && selectedCustomer.currentDebt > 0 && (
                        <Button
                          className="col-span-full"
                          onClick={() =>
                            handleOpenPaymentDialog(selectedCustomer)
                          }
                        >
                          <DollarSignIcon className="size-4" />
                          Registrar Abono
                        </Button>
                      )}
                      <Button
                        variant={
                          selectedCustomer?.creditBlocked
                            ? 'outline'
                            : 'destructive'
                        }
                        size="sm"
                        onClick={handleToggleCreditBlock}
                      >
                        {selectedCustomer?.creditBlocked ? (
                          <>
                            <UnlockIcon className="size-4" />
                            Desbloquear Crédito
                          </>
                        ) : (
                          <>
                            <LockIcon className="size-4" />
                            Bloquear Crédito
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          selectedCustomer?.status === 'active'
                            ? 'destructive'
                            : 'outline'
                        }
                        onClick={handleToggleStatus}
                      >
                        {selectedCustomer?.status === 'active' ? (
                          <>
                            <UserRoundXIcon className="size-4" />
                            Deshabilitar Cliente
                          </>
                        ) : (
                          <>
                            <UserRoundCheckIcon className="size-4" />
                            Habilitar Cliente
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Información Adicional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Fecha de Registro
                      </span>
                      <span className="font-medium">
                        {selectedCustomer?.registrationDate
                          ? format(
                              selectedCustomer.registrationDate,
                              'dd-MM-yyyy'
                            )
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Última Compra
                      </span>
                      <span className="font-medium">
                        {selectedCustomer?.lastPurchase
                          ? format(selectedCustomer.lastPurchase, 'dd-MM-yyyy')
                          : 'Nunca'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Estado de Cuenta */}
              <TabsContent value="statement" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumen de Cuenta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <span className="text-sm">Límite de Crédito</span>
                        <span className="font-bold text-lg">
                          {formatCurrency(selectedCustomer?.creditLimit || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                        <span className="text-sm">Deuda Total</span>
                        <span className="font-bold text-lg text-red-600">
                          {formatCurrency(selectedCustomer?.currentDebt || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <span className="text-sm">Crédito Disponible</span>
                        <span className="font-bold text-lg text-blue-600">
                          {formatCurrency(
                            (selectedCustomer?.creditLimit || 0) -
                              (selectedCustomer?.currentDebt || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Compras Pendientes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mockPurchases
                        .filter(p => p.status === 'pending')
                        .map(purchase => (
                          <div
                            key={purchase.id}
                            className="flex justify-between items-center p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">
                                {format(purchase.date, 'dd-MM-yyyy')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {purchase.items} artículos
                              </p>
                            </div>
                            <Badge variant="destructive">
                              {formatCurrency(purchase.amount)}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab: Historial */}
              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShoppingCartIcon className="size-5" />
                      Historial de Compras
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mockPurchases.map(purchase => (
                        <div
                          key={purchase.id}
                          className="flex justify-between items-center p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <CalendarIcon className="size-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {format(purchase.date, 'dd-MM-yyyy')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {purchase.items} artículos
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {formatCurrency(purchase.amount)}
                            </p>
                            <Badge
                              variant={
                                purchase.status === 'paid'
                                  ? 'default'
                                  : 'destructive'
                              }
                              className={
                                purchase.status === 'paid' ? 'bg-green-600' : ''
                              }
                            >
                              {purchase.status === 'paid'
                                ? 'Pagado'
                                : 'Pendiente'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSignIcon className="size-5" />
                      Historial de Pagos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mockPayments.map(payment => (
                        <div
                          key={payment.id}
                          className="flex justify-between items-center p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <ReceiptIcon className="size-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {format(payment.date, 'dd-MM-yyyy')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {payment.method} - {payment.reference}
                              </p>
                            </div>
                          </div>
                          <p className="font-bold text-green-600">
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Abono</DialogTitle>
            <DialogDescription>
              Cliente: {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Deuda Actual
                </span>
                <span className="font-bold text-lg text-red-600">
                  {formatCurrency(selectedCustomer?.currentDebt || 0)}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Monto del Abono
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                className="text-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Método de Pago
              </label>
              <Select defaultValue="cash">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="transfer">Transferencia</SelectItem>
                  <SelectItem value="card">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Referencia (Opcional)
              </label>
              <Input placeholder="Número de referencia o nota" />
            </div>

            {paymentAmount && parseFloat(paymentAmount) > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Deuda Actual</span>
                  <span className="font-medium">
                    {formatCurrency(selectedCustomer?.currentDebt || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Abono</span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(parseFloat(paymentAmount))}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Nueva Deuda</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(
                      Math.max(
                        0,
                        (selectedCustomer?.currentDebt || 0) -
                          parseFloat(paymentAmount)
                      )
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleRegisterPayment}>
                <DollarSignIcon className="size-4 mr-2" />
                Registrar Abono
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsPaymentDialogOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
