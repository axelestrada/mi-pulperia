import type { Selection } from '@heroui/react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
} from '@heroui/react'
import { AlertTriangle, Clock, CreditCard, DollarSign, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useCreateCredit, useCredits } from '@/features/credits/hooks/use-credits'
import { useActiveCustomers } from '@/features/customers/hooks/use-customers'
import {
  SHIFT_HANDOVER_UPDATED_EVENT,
  getShiftModuleNote,
  setShiftModuleNote,
} from '@/features/operations/model/shift-handover-storage'

type CreditStatusFilter =
  | 'all'
  | 'active'
  | 'partial'
  | 'overdue'
  | 'paid'
  | 'cancelled'

type CreditItem = {
  id: number
  creditNumber: string
  customerName?: string
  originalAmount?: number
  remainingAmount: number
  status: 'active' | 'partial' | 'paid' | 'cancelled'
  dueDate?: string | Date
  isOverdue?: boolean
  description?: string
  notes?: string
  createdAt?: string | Date
}

const getSingleSelectionKey = (keys: Selection, fallback = 'all') => {
  if (keys === 'all') return fallback
  return Array.from(keys)[0]?.toString() ?? fallback
}

export function CreditsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CreditStatusFilter>('all')
  const [shiftNote, setShiftNote] = useState(() => getShiftModuleNote('credits'))
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedCredit, setSelectedCredit] = useState<CreditItem | null>(null)
  const [manualCustomerId, setManualCustomerId] = useState('')
  const [manualAmount, setManualAmount] = useState('')
  const [manualDueDate, setManualDueDate] = useState('')
  const [manualDescription, setManualDescription] = useState('')
  const [manualNotes, setManualNotes] = useState('')

  const backendStatus =
    statusFilter === 'all' || statusFilter === 'overdue'
      ? undefined
      : statusFilter

  const createCredit = useCreateCredit()
  const { data: activeCustomers = [] } = useActiveCustomers()

  const { data: credits = [], isLoading, error } = useCredits({
    search: searchTerm || undefined,
    status: backendStatus,
  })

  useEffect(() => {
    const refreshShiftNote = () => setShiftNote(getShiftModuleNote('credits'))
    window.addEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
    return () =>
      window.removeEventListener(SHIFT_HANDOVER_UPDATED_EVENT, refreshShiftNote)
  }, [])

  const filteredCredits = useMemo(
    () =>
      (credits as CreditItem[]).filter(credit => {
        if (statusFilter === 'all') return true
        if (statusFilter === 'overdue') return Boolean(credit.isOverdue)
        return credit.status === statusFilter
      }),
    [credits, statusFilter]
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, filteredCredits.length])

  const stats = useMemo(() => {
    const typedCredits = credits as CreditItem[]
    const overdueCredits = typedCredits.filter(credit => credit.isOverdue)
    const totalAmount = credits.reduce(
      (sum: number, credit: CreditItem) => sum + (credit.remainingAmount || 0),
      0
    )
    const overdueAmount = overdueCredits.reduce(
      (sum: number, credit: CreditItem) => sum + (credit.remainingAmount || 0),
      0
    )

    return {
      total: credits.length,
      active: typedCredits.filter(credit => credit.status === 'active').length,
      overdue: overdueCredits.length,
      totalAmount,
      overdueAmount,
    }
  }, [credits])

  const handleSaveShiftNote = () => {
    setShiftModuleNote('credits', shiftNote)
    sileo.success({ title: 'Nota de turno guardada en créditos' })
  }

  const totalPages = Math.max(1, Math.ceil(filteredCredits.length / pageSize))
  const paginatedCredits = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredCredits.slice(start, start + pageSize)
  }, [filteredCredits, currentPage])

  const openDetailModal = (credit: CreditItem) => {
    setSelectedCredit(credit)
    setIsDetailOpen(true)
  }

  const closeDetailModal = () => {
    setIsDetailOpen(false)
    setSelectedCredit(null)
  }

  const openCreateModal = () => {
    setManualCustomerId('')
    setManualAmount('')
    setManualDueDate('')
    setManualDescription('')
    setManualNotes('')
    setIsCreateOpen(true)
  }

  const handleCreateManualCredit = async () => {
    const customerId = Number(manualCustomerId)
    const amount = Number(manualAmount)
    const amountInCents = Math.round(amount * 100)

    if (!Number.isInteger(customerId) || customerId <= 0) {
      sileo.error({ title: 'Selecciona un cliente para el crédito' })
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      sileo.error({ title: 'Ingresa un monto válido' })
      return
    }

    if (!manualDescription.trim()) {
      sileo.error({ title: 'Ingresa un motivo para el crédito' })
      return
    }

    const dueDate = manualDueDate ? new Date(`${manualDueDate}T00:00:00`) : undefined

    if (dueDate && Number.isNaN(dueDate.getTime())) {
      sileo.error({ title: 'La fecha de vencimiento no es válida' })
      return
    }

    try {
      const creditNumber = await window.api.credits.generateCreditNumber()

      await createCredit.mutateAsync({
        credit: {
          creditNumber,
          customerId,
          type: 'manual_credit',
          amount: amountInCents,
          originalAmount: amountInCents,
          paidAmount: 0,
          remainingAmount: amountInCents,
          status: 'active',
          dueDate,
          interestRate: 0,
          lateFeesAmount: 0,
          description: manualDescription.trim(),
          notes: manualNotes.trim() || undefined,
          createdBy: 'MANUAL',
        },
      })


      sileo.success({ title: 'Crédito manual creado correctamente' })
      setIsCreateOpen(false)
    } catch (createError) {
      sileo.error({
        title: 'No se pudo crear el crédito manual',
        description:
          createError instanceof Error ? createError.message : 'Ocurrió un error inesperado',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <Spinner />
          <p className="text-default-500">Cargando créditos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-danger">Error al cargar los créditos</p>
          <Button onPress={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créditos</h1>
          <p className="text-default-500">
            Control del libro de créditos y pendientes por cobrar.
          </p>
        </div>
        <Button className="bg-foreground text-background" onPress={openCreateModal}>
          Nuevo crédito manual
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Total Créditos</h3>
            <CreditCard className="h-4 w-4 text-default-500" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-default-500">{stats.active} activos</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Vencidos</h3>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-default-500">Requieren seguimiento</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Saldo Total</h3>
            <DollarSign className="h-4 w-4 text-default-500" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">L {(stats.totalAmount / 100).toFixed(2)}</div>
            <p className="text-xs text-default-500">Por cobrar</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium">Monto Vencido</h3>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold text-red-600">
              L {(stats.overdueAmount / 100).toFixed(2)}
            </div>
            <p className="text-xs text-default-500">Cobro prioritario</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Filtros</h3>
          <p className="text-sm text-default-500">Busca y filtra créditos por estado</p>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Input
              placeholder="Buscar por cliente, documento, número de crédito..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<Search className="h-4 w-4 text-default-400" />}
            />

            <Select
              aria-label="Estado del crédito"
              selectedKeys={[statusFilter]}
              onSelectionChange={keys =>
                setStatusFilter(getSingleSelectionKey(keys) as CreditStatusFilter)
              }
              className="w-full md:w-52"
            >
              <SelectItem key="all">Todos</SelectItem>
              <SelectItem key="active">Activos</SelectItem>
              <SelectItem key="partial">Parciales</SelectItem>
              <SelectItem key="overdue">Vencidos</SelectItem>
              <SelectItem key="paid">Pagados</SelectItem>
              <SelectItem key="cancelled">Cancelados</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Nota de Turno</h3>
          <p className="text-sm text-default-500">
            Deja indicaciones sobre cobros pendientes para la siguiente persona.
          </p>
        </CardHeader>
        <CardBody className="space-y-3">
          <Textarea
            value={shiftNote}
            onValueChange={setShiftNote}
            placeholder="Ej. Cobrar hoy a cliente Juan por crédito CR-202602-001."
          />
          <Button size="sm" onPress={handleSaveShiftNote}>
            Guardar nota
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Créditos</h3>
          <p className="text-sm text-default-500">
            {filteredCredits.length} crédito
            {filteredCredits.length !== 1 ? 's' : ''} encontrado
            {filteredCredits.length !== 1 ? 's' : ''}
          </p>
        </CardHeader>
        <CardBody>
          {filteredCredits.length === 0 ? (
            <p className="text-sm text-default-500">
              No se encontraron créditos con los filtros aplicados.
            </p>
          ) : (
            <>
              <Table aria-label="Listado de créditos">
                <TableHeader>
                  <TableColumn>CLIENTE</TableColumn>
                  <TableColumn>CRÉDITO</TableColumn>
                  <TableColumn className="text-right">SALDO</TableColumn>
                  <TableColumn>VENCE</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                  <TableColumn align="center">ACCIONES</TableColumn>
                </TableHeader>
                <TableBody items={paginatedCredits}>
                  {(credit: CreditItem) => (
                    <TableRow key={credit.id}>
                      <TableCell>{credit.customerName || 'Cliente no disponible'}</TableCell>
                      <TableCell>{credit.creditNumber}</TableCell>
                      <TableCell className="text-right">
                        L {((credit.remainingAmount || 0) / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {credit.dueDate
                          ? new Date(credit.dueDate).toLocaleDateString('es-HN')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={
                            credit.isOverdue
                              ? 'danger'
                              : credit.status === 'active'
                                ? 'primary'
                                : credit.status === 'partial'
                                  ? 'warning'
                                  : credit.status === 'paid'
                                    ? 'success'
                                    : 'default'
                          }
                        >
                          {credit.isOverdue
                            ? 'Vencido'
                            : credit.status === 'active'
                              ? 'Activo'
                              : credit.status === 'partial'
                                ? 'Parcial'
                                : credit.status === 'paid'
                                  ? 'Pagado'
                                  : 'Cancelado'}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            variant="bordered"
                            onPress={() => openDetailModal(credit)}
                          >
                            Ver
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-small text-default-500">
                    Mostrando {paginatedCredits.length} de {filteredCredits.length}
                  </p>
                  <Pagination
                    page={currentPage}
                    total={totalPages}
                    showControls
                    onChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isDetailOpen} onOpenChange={setIsDetailOpen} size="lg">
        <ModalContent>
          <>
            <ModalHeader>Detalle del crédito</ModalHeader>
            <ModalBody className="space-y-3">
              {!selectedCredit ? null : (
                <>
                  <div>
                    <p className="text-sm text-default-500">Cliente</p>
                    <p className="font-medium">
                      {selectedCredit.customerName || 'Cliente no disponible'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Crédito</p>
                    <p className="font-medium">{selectedCredit.creditNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Motivo del crédito</p>
                    <p className="font-medium">
                      {selectedCredit.description?.trim() ||
                        'No se especificó el motivo de este crédito.'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-default-500">Notas</p>
                    <p className="font-medium">
                      {selectedCredit.notes?.trim() || 'Sin notas adicionales.'}
                    </p>
                  </div>
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={closeDetailModal}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>

      <Modal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} size="lg">
        <ModalContent>
          <>
            <ModalHeader>Nuevo crédito manual</ModalHeader>
            <ModalBody className="space-y-3">
              <Select
                label="Cliente"
                selectedKeys={manualCustomerId ? [manualCustomerId] : []}
                onSelectionChange={keys => setManualCustomerId(String(keys.currentKey ?? ''))}
              >
                {activeCustomers.map(customer => (
                  <SelectItem key={String(customer.id)}>
                    {customer.name}
                    {customer.document ? ` - ${customer.document}` : ''}
                  </SelectItem>
                ))}
              </Select>

              <Input
                label="Monto (L)"
                type="number"
                min={0.01}
                step="0.01"
                value={manualAmount}
                onValueChange={setManualAmount}
                placeholder="0.00"
              />

              <Input
                label="Fecha de vencimiento (opcional)"
                type="date"
                value={manualDueDate}
                onValueChange={setManualDueDate}
              />

              <Input
                label="Motivo"
                value={manualDescription}
                onValueChange={setManualDescription}
                placeholder="Ej. Crédito manual por saldo pendiente"
              />

              <Textarea
                label="Notas (opcional)"
                value={manualNotes}
                onValueChange={setManualNotes}
                placeholder="Notas adicionales"
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleCreateManualCredit}
                isLoading={createCredit.isPending}
              >
                Crear crédito
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </div>
  )
}
